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
import { compressImageClient, compressImageToTargetSize } from "@/lib/compression/image-client";
import { COMPRESSION_PRESETS, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";
import { TargetSizeSelector } from "@/components/tools/target-size-selector";
import { FileItem, CompressionPreset } from "@/types";
import { ImageDown, Lock, RotateCcw, Loader2, Download, Eye, Plus } from "lucide-react";
import { ImageComparison } from "@/components/tools/image-comparison";
import { trackJob } from "@/lib/track-job";
import { toast } from "sonner";
import JSZip from "jszip";

export default function CompressImagePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [preset, setPreset] = useState<CompressionPreset["value"]>("balanced");
  const [isCompressing, setIsCompressing] = useState(false);
  const [targetEnabled, setTargetEnabled] = useState(false);
  const [targetSizeKB, setTargetSizeKB] = useState(200);

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
          ? await compressImageToTargetSize(
              files[i].file,
              targetSizeKB * 1024
            )
          : await compressImageClient(
              files[i].file,
              settings.jpegQuality / 100
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
          type: "compress-image",
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
      toast.success(`${doneCount} image${doneCount > 1 ? "s" : ""} compressed successfully`);
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
    a.download = "crushfile-images.zip";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ZIP downloaded with all compressed images");
  }, [files, downloadFile]);

  const reset = useCallback(() => {
    setFiles([]);
  }, []);

  const allDone = files.length > 0 && files.every((f) => f.status === "done");
  const hasFiles = files.length > 0;
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex rounded-2xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 p-4 mb-5">
          <ImageDown className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Compress Image</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Reduce image file size without losing visible quality
        </p>
        <Badge variant="secondary" className="mt-4 px-4 py-1.5 border border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400">
          <Lock className="h-3 w-3 mr-1.5" />
          Processed locally — files never leave your device
        </Badge>
      </div>

      {!hasFiles ? (
        <>
          <Dropzone
            accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"] }}
            maxSize={25 * 1024 * 1024}
            multiple={true}
            onFiles={handleFiles}
            label="Drop your images here"
            description="Supports JPEG, PNG, WebP, GIF, BMP"
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

          {allDone && previewIdx !== null && files[previewIdx]?.compressedBlob && (
            <ImageComparison
              originalFile={files[previewIdx].file}
              compressedBlob={files[previewIdx].compressedBlob!}
              originalSize={files[previewIdx].originalSize}
              compressedSize={files[previewIdx].compressedSize || 0}
            />
          )}

          {allDone && files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, idx) => (
                <button
                  key={f.id}
                  onClick={() => setPreviewIdx(previewIdx === idx ? null : idx)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                    previewIdx === idx
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  {f.name.length > 20 ? f.name.slice(0, 20) + "..." : f.name}
                </button>
              ))}
            </div>
          )}

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

          <div className="flex gap-3 flex-wrap">
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
            {!allDone && !isCompressing && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById("add-more-img")?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Files
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
            <input
              id="add-more-img"
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(Array.from(e.target.files));
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
