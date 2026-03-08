"use client";

import { useState, useCallback } from "react";
import { Dropzone } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mergePDFs, mergeWithPageOrder, extractPageThumbnails } from "@/lib/compression/pdf-client";
import type { PageThumbnail } from "@/lib/compression/pdf-client";
import { formatBytes } from "@/lib/constants";
import { FileReorderList } from "@/components/tools/file-reorder-list";
import { PageReorderPanel } from "@/components/tools/page-reorder-panel";
import {
  FilePlus2,
  Lock,
  RotateCcw,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function MergePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageThumbnails, setPageThumbnails] = useState<PageThumbnail[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setMergedBlob(null);
    setError(null);

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
      // Thumbnail extraction failed
    }
    setLoadingPages(false);
  }, [files.length]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedBlob(null);
    // Remove thumbnails for this file and reindex
    setPageThumbnails((prev) => {
      const filtered = prev.filter((p) => p.fileIndex !== index);
      return filtered.map((p) => ({
        ...p,
        fileIndex: p.fileIndex > index ? p.fileIndex - 1 : p.fileIndex,
      }));
    });
  }, []);

  const moveFile = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setMergedBlob(null);
    // Remap thumbnail fileIndex to match new file order
    setPageThumbnails((prev) =>
      prev.map((p) => {
        let newIdx = p.fileIndex;
        if (p.fileIndex === from) {
          newIdx = to;
        } else if (from < to && p.fileIndex > from && p.fileIndex <= to) {
          newIdx = p.fileIndex - 1;
        } else if (from > to && p.fileIndex >= to && p.fileIndex < from) {
          newIdx = p.fileIndex + 1;
        }
        return { ...p, fileIndex: newIdx };
      })
    );
  }, []);

  const merge = useCallback(async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    setError(null);

    try {
      let blob: Blob;

      // Check if pages were reordered/removed
      if (pageThumbnails.length > 0) {
        const pageOrder = pageThumbnails.map((p) => ({
          fileIndex: p.fileIndex,
          pageIndex: p.pageIndex,
        }));
        blob = await mergeWithPageOrder(files, pageOrder);
      } else {
        blob = await mergePDFs(files);
      }

      setMergedBlob(blob);
      toast.success(`${files.length} PDFs merged successfully (${pageThumbnails.length} pages)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Merge failed";
      setError(msg);
      toast.error(msg);
    }

    setIsMerging(false);
  }, [files, pageThumbnails]);

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
    setPageThumbnails([]);
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
          <FileReorderList
            files={files.map((f) => ({ name: f.name, size: f.size }))}
            onReorder={moveFile}
            onRemove={removeFile}
            title="Files to merge"
            disabled={isMerging}
          />

          {!mergedBlob && (pageThumbnails.length > 0 || loadingPages) && (
            <PageReorderPanel
              pages={pageThumbnails}
              onPagesChange={setPageThumbnails}
              loading={loadingPages}
              disabled={isMerging}
              multiFile={files.length > 1}
            />
          )}

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
