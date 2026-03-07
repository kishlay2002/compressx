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
import { compressPDFClient, compressPDFToTargetSize } from "@/lib/compression/pdf-client";
import { COMPRESSION_PRESETS } from "@/lib/constants";
import { TargetSizeSelector } from "@/components/tools/target-size-selector";
import { FileItem, CompressionPreset } from "@/types";
import { FileDown, Lock, RotateCcw, Loader2 } from "lucide-react";
import { trackJob } from "@/lib/track-job";
import { toast } from "sonner";
import JSZip from "jszip";

export default function CompressPDFPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [preset, setPreset] = useState<CompressionPreset["value"]>("balanced");
  const [isCompressing, setIsCompressing] = useState(false);
  const [targetEnabled, setTargetEnabled] = useState(false);
  const [targetSizeKB, setTargetSizeKB] = useState(500);

  const handleFiles = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      originalSize: file.size,
      status: "pending" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const compressAll = useCallback(async () => {
    setIsCompressing(true);
    const settings = COMPRESSION_PRESETS.find((p) => p.value === preset)!;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "compressing", progress: 50 } : f
        )
      );

      try {
        const result = targetEnabled
          ? await compressPDFToTargetSize(
              files[i].file,
              targetSizeKB * 1024
            )
          : await compressPDFClient(
              files[i].file,
              settings.pdfImageQuality / 100,
              settings.stripMetadata
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

    const doneCount = files.filter((f) => f.status !== "error").length;
    const errorCount = files.filter((f) => f.status === "error").length;
    if (doneCount > 0) {
      toast.success(`${doneCount} PDF${doneCount > 1 ? "s" : ""} compressed successfully`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} file${errorCount > 1 ? "s" : ""} failed to compress`);
    }
  }, [files, preset, targetEnabled, targetSizeKB]);

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
          Processed locally — files never leave your device
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
            </div>
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
