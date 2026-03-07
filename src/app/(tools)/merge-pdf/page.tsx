"use client";

import { useState, useCallback, useRef } from "react";
import { Dropzone, FileCard } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mergePDFs } from "@/lib/compression/pdf-client";
import { formatBytes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  FilePlus2,
  Lock,
  RotateCcw,
  Loader2,
  Download,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";

export default function MergePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setMergedBlob(null);
    setError(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedBlob(null);
  }, []);

  const moveFile = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setMergedBlob(null);
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDragIdx(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIdx(index);
  }, []);

  const handleDrop = useCallback(
    (index: number) => {
      if (dragIdx !== null && dragIdx !== index) {
        moveFile(dragIdx, index);
      }
      setDragIdx(null);
      setDragOverIdx(null);
    },
    [dragIdx, moveFile]
  );

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setDragOverIdx(null);
  }, []);

  const merge = useCallback(async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    setError(null);

    try {
      const blob = await mergePDFs(files);
      setMergedBlob(blob);
      toast.success(`${files.length} PDFs merged successfully`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Merge failed";
      setError(msg);
      toast.error(msg);
    }

    setIsMerging(false);
  }, [files]);

  const download = useCallback(() => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }, [mergedBlob]);

  const reset = useCallback(() => {
    setFiles([]);
    setMergedBlob(null);
    setError(null);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 p-4 mb-5">
          <FilePlus2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Merge PDF</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Combine multiple PDF files into a single document
        </p>
        <Badge variant="secondary" className="mt-4 px-4 py-1.5 border border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400">
          <Lock className="h-3 w-3 mr-1.5" />
          Processed locally — files never leave your device
        </Badge>
      </div>

      <Dropzone
        accept={{ "application/pdf": [".pdf"] }}
        maxSize={25 * 1024 * 1024}
        multiple={true}
        onFiles={handleFiles}
        label="Drop your PDFs here"
        description="Add multiple PDFs to merge them in order"
      />

      {files.length > 0 && (
        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">
                Files to merge ({files.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Drag to reorder or use arrows
              </p>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-2 rounded-xl p-1.5 transition-all",
                    dragIdx === index && "opacity-50",
                    dragOverIdx === index && dragIdx !== index && "ring-2 ring-primary/40 bg-primary/5"
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
                  <span className="text-xs text-muted-foreground w-6 text-center font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <FileCard
                      name={file.name}
                      size={file.size}
                      onRemove={() => removeFile(index)}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => index > 0 && moveFile(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => index < files.length - 1 && moveFile(index, index + 1)}
                      disabled={index === files.length - 1}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mergedBlob && (
            <div className="rounded-2xl border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Merge Complete</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {files.length} files merged · Output:{" "}
                    {formatBytes(mergedBlob.size)}
                  </p>
                </div>
                <Button onClick={download} className="gap-2 rounded-xl shadow-sm">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/5 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {!mergedBlob && (
              <Button
                onClick={merge}
                size="lg"
                className="flex-1"
                disabled={files.length < 2 || isMerging}
              >
                {isMerging ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>Merge {files.length} PDFs</>
                )}
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
