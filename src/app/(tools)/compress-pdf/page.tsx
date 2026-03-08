"use client";

import { useState, useCallback } from "react";
import { Dropzone } from "@/components/tools/dropzone";
import { QualitySelector } from "@/components/tools/quality-selector";
import {
  CompressionResult,
  BatchSummary,
} from "@/components/tools/compression-result";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { compressPDFClient, compressPDFToTargetSize, extractPageThumbnails, reorderPDFPages, getPDFInfo } from "@/lib/compression/pdf-client";
import type { PageThumbnail } from "@/lib/compression/pdf-client";
import { PageReorderPanel } from "@/components/tools/page-reorder-panel";
import { COMPRESSION_PRESETS, formatBytes } from "@/lib/constants";
import { TargetSizeSelector } from "@/components/tools/target-size-selector";
import { FileItem, CompressionPreset } from "@/types";
import { FileDown, Lock, RotateCcw, Loader2 } from "lucide-react";
import { FileReorderList } from "@/components/tools/file-reorder-list";
import { trackJob } from "@/lib/track-job";
import { toast } from "sonner";
import JSZip from "jszip";
import { AIEnhanceToggle } from "@/components/tools/ai-enhance-toggle";
import type { AIEnhanceConfig } from "@/lib/compression/ai-enhance";

export default function CompressPDFPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [preset, setPreset] = useState<CompressionPreset["value"]>("balanced");
  const [isCompressing, setIsCompressing] = useState(false);
  const [targetEnabled, setTargetEnabled] = useState(false);
  const [targetSizeKB, setTargetSizeKB] = useState(500);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIEnhanceConfig | null>(null);
  const [pageThumbnails, setPageThumbnails] = useState<PageThumbnail[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    const items: FileItem[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      originalSize: file.size,
      status: "pending" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...items]);

    // Extract page thumbnails for page-level reorder
    setLoadingPages(true);
    try {
      const existingCount = files.length;
      const allThumbs: PageThumbnail[] = [];
      for (let i = 0; i < newFiles.length; i++) {
        const thumbs = await extractPageThumbnails(newFiles[i], existingCount + i);
        allThumbs.push(...thumbs);
      }
      setPageThumbnails((prev) => [...prev, ...allThumbs]);
    } catch {
      // Thumbnail extraction failed — page reorder won't be available
    }
    setLoadingPages(false);
  }, [files.length]);

  const reorderFile = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
    // Remove thumbnails for this file and reindex
    setPageThumbnails((prev) => {
      const filtered = prev.filter((p) => p.fileIndex !== index);
      return filtered.map((p) => ({
        ...p,
        fileIndex: p.fileIndex > index ? p.fileIndex - 1 : p.fileIndex,
      }));
    });
  }, []);

  const compressAll = useCallback(async () => {
    setIsCompressing(true);
    const settings = COMPRESSION_PRESETS.find((p) => p.value === preset)!;

    // Apply page reorder if pages were rearranged or removed
    const currentFiles = [...files];
    if (pageThumbnails.length > 0) {
      for (let fi = 0; fi < currentFiles.length; fi++) {
        const filePages = pageThumbnails
          .filter((p) => p.fileIndex === fi)
          .map((p) => p.pageIndex);
        if (filePages.length > 0) {
          const info = await getPDFInfo(currentFiles[fi].file);
          const isDefault =
            filePages.length === info.pageCount &&
            filePages.every((p, idx) => p === idx);
          if (!isDefault) {
            try {
              const reordered = await reorderPDFPages(currentFiles[fi].file, filePages);
              currentFiles[fi] = {
                ...currentFiles[fi],
                file: reordered,
                originalSize: reordered.size,
              };
            } catch {
              // If reorder fails, use original file
            }
          }
        }
      }
      setFiles([...currentFiles]);
    }

    for (let i = 0; i < currentFiles.length; i++) {
      if (currentFiles[i].status === "done") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "compressing", progress: 50 } : f
        )
      );

      try {
        const activeAi = aiEnabled && aiConfig?.apiKey ? aiConfig : undefined;
        const result = targetEnabled
          ? await compressPDFToTargetSize(
              files[i].file,
              targetSizeKB * 1024,
              activeAi
            )
          : await compressPDFClient(
              files[i].file,
              settings.pdfImageQuality / 100,
              settings.stripMetadata,
              activeAi
            );

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "done",
                  progress: 100,
                  compressedSize: result.compressedSize,
                  compressedBlob: result.blob,
                }
              : f
          )
        );

        trackJob({
          type: "compress-pdf",
          inputFilename: files[i].name,
          inputSize: files[i].originalSize,
          outputSize: result.compressedSize,
          preset: targetEnabled ? `target-${targetSizeKB}kb` : preset,
          pipeline: "client",
        });
      } catch (err) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "error",
                  error:
                    err instanceof Error ? err.message : "Compression failed",
                }
              : f
          )
        );
      }
    }

    setIsCompressing(false);

    const updatedFiles = files;
    const doneFiles = updatedFiles.filter((f) => f.status !== "error");
    const errorCount = updatedFiles.filter((f) => f.status === "error").length;
    if (doneFiles.length > 0) {
      if (targetEnabled && doneFiles.length === 1 && doneFiles[0].compressedSize) {
        const achieved = doneFiles[0].compressedSize;
        const targetBytes = targetSizeKB * 1024;
        if (achieved <= targetBytes) {
          toast.success(`Compressed to ${formatBytes(achieved)} (target: ${formatBytes(targetBytes)})`);
        } else {
          toast.info(`Best achievable: ${formatBytes(achieved)} (target was ${formatBytes(targetBytes)}). Lower targets require more quality trade-off.`);
        }
      } else {
        toast.success(`${doneFiles.length} PDF${doneFiles.length > 1 ? "s" : ""} compressed successfully`);
      }
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} file${errorCount > 1 ? "s" : ""} failed to compress`);
    }
  }, [files, preset, targetEnabled, targetSizeKB, aiEnabled, aiConfig, pageThumbnails]);

  const downloadFile = useCallback((item: FileItem) => {
    if (!item.compressedBlob) return;
    const url = URL.createObjectURL(item.compressedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${item.name}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter((f) => f.status === "done" && f.compressedBlob);
    if (doneFiles.length <= 1) {
      doneFiles.forEach(downloadFile);
      return;
    }
    const zip = new JSZip();
    doneFiles.forEach((f) => {
      zip.file(`compressed-${f.name}`, f.compressedBlob!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressx-pdfs.zip";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ZIP downloaded with all compressed PDFs");
  }, [files, downloadFile]);

  const reset = useCallback(() => {
    setFiles([]);
    setPageThumbnails([]);
  }, []);

  const allDone = files.length > 0 && files.every((f) => f.status === "done");
  const hasFiles = files.length > 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex rounded-2xl bg-gradient-to-br from-red-500/15 to-orange-500/15 p-4 mb-5">
          <FileDown className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Compress PDF</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Reduce PDF file size while preserving content quality
        </p>
        <Badge variant="secondary" className="mt-4 px-4 py-1.5 border border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400">
          <Lock className="h-3 w-3 mr-1.5" />
          Processed locally — files never leave your device{aiEnabled ? " (AI pages sent to API)" : ""}
        </Badge>
      </div>

      {!hasFiles ? (
        <>
          <Dropzone
            accept={{ "application/pdf": [".pdf"] }}
            maxSize={25 * 1024 * 1024}
            multiple={true}
            onFiles={handleFiles}
            label="Drop your PDFs here"
            description="Supports PDF files up to 25MB"
          />
          <div className="mt-6 space-y-4">
            <TargetSizeSelector
              enabled={targetEnabled}
              onEnabledChange={setTargetEnabled}
              targetSizeKB={targetSizeKB}
              onTargetSizeChange={setTargetSizeKB}
            />
            {!targetEnabled && (
              <div>
                <h3 className="text-sm font-medium mb-3">Compression Level</h3>
                <QualitySelector value={preset} onChange={setPreset} />
              </div>
            )}
            <AIEnhanceToggle
              enabled={aiEnabled}
              onEnabledChange={setAiEnabled}
              config={aiConfig}
              onConfigChange={setAiConfig}
            />
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {!allDone && (
            <div className="space-y-4">
              <TargetSizeSelector
                enabled={targetEnabled}
                onEnabledChange={setTargetEnabled}
                targetSizeKB={targetSizeKB}
                onTargetSizeChange={setTargetSizeKB}
                originalSizeBytes={files.reduce((s, f) => Math.max(s, f.originalSize), 0)}
              />
              {!targetEnabled && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Compression Level</h3>
                  <QualitySelector value={preset} onChange={setPreset} />
                </div>
              )}
              <AIEnhanceToggle
                enabled={aiEnabled}
                onEnabledChange={setAiEnabled}
                config={aiConfig}
                onConfigChange={setAiConfig}
              />
            </div>
          )}

          {files.some((f) => f.status === "pending") && files.length > 1 && (
            <FileReorderList
              files={files.map((f) => ({ name: f.name, size: f.originalSize }))}
              onReorder={reorderFile}
              onRemove={removeFile}
              title="Files to compress"
              disabled={isCompressing}
            />
          )}

          {files.some((f) => f.status === "pending") && (pageThumbnails.length > 0 || loadingPages) && (
            <PageReorderPanel
              pages={pageThumbnails}
              onPagesChange={setPageThumbnails}
              loading={loadingPages}
              disabled={isCompressing}
              multiFile={files.length > 1}
            />
          )}

          <div className="space-y-3">
            {files.map((file) => (
              <CompressionResult
                key={file.id}
                fileName={file.name}
                originalSize={file.originalSize}
                compressedSize={file.compressedSize || 0}
                status={file.status}
                progress={file.progress}
                error={file.error}
                onDownload={
                  file.status === "done" ? () => downloadFile(file) : undefined
                }
              />
            ))}
          </div>

          {allDone && (
            <BatchSummary
              totalOriginal={files.reduce((s, f) => s + f.originalSize, 0)}
              totalCompressed={files.reduce(
                (s, f) => s + (f.compressedSize || 0),
                0
              )}
              fileCount={files.length}
              onDownloadAll={files.length > 1 ? downloadAll : undefined}
            />
          )}

          <div className="flex gap-3">
            {!allDone && !isCompressing && (
              <Button onClick={compressAll} size="lg" className="flex-1">
                Compress {files.length} file{files.length !== 1 ? "s" : ""}
              </Button>
            )}
            {isCompressing && (
              <Button disabled size="lg" className="flex-1">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Compressing...
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
