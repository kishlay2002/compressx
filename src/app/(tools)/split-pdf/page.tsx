"use client";

import { useState, useCallback } from "react";
import { Dropzone } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { splitPDF, getPDFInfo } from "@/lib/compression/pdf-client";
import { formatBytes } from "@/lib/constants";
import { PDFInfo } from "@/types";
import {
  Scissors,
  Lock,
  RotateCcw,
  Loader2,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

export default function SplitPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PDFInfo | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [results, setResults] = useState<Blob[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setResults([]);
    setError(null);
    try {
      const info = await getPDFInfo(f);
      setPdfInfo(info);
      setRangeInput(`1-${info.pageCount}`);
    } catch {
      setError("Failed to read PDF");
    }
  }, []);

  const parseRanges = useCallback(
    (input: string) => {
      if (!pdfInfo) return [];
      const ranges: { start: number; end: number }[] = [];
      const parts = input.split(",").map((s) => s.trim());
      for (const part of parts) {
        if (part.includes("-")) {
          const [s, e] = part.split("-").map(Number);
          if (!isNaN(s) && !isNaN(e) && s >= 1 && e <= pdfInfo.pageCount) {
            ranges.push({ start: s - 1, end: e - 1 });
          }
        } else {
          const n = Number(part);
          if (!isNaN(n) && n >= 1 && n <= pdfInfo.pageCount) {
            ranges.push({ start: n - 1, end: n - 1 });
          }
        }
      }
      return ranges;
    },
    [pdfInfo]
  );

  const split = useCallback(async () => {
    if (!file) return;
    const ranges = parseRanges(rangeInput);
    if (ranges.length === 0) {
      setError("Please enter valid page ranges");
      return;
    }

    setIsSplitting(true);
    setError(null);

    try {
      const blobs = await splitPDF(file, ranges);
      setResults(blobs);
      toast.success(`PDF split into ${blobs.length} part${blobs.length > 1 ? "s" : ""}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Split failed";
      setError(msg);
      toast.error(msg);
    }

    setIsSplitting(false);
  }, [file, rangeInput, parseRanges]);

  const downloadResult = useCallback(
    (blob: Blob, index: number) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file?.name.replace(".pdf", "") || "split";
      a.download = `${baseName}_part${index + 1}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [file]
  );

  const reset = useCallback(() => {
    setFile(null);
    setPdfInfo(null);
    setResults([]);
    setError(null);
    setRangeInput("");
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex rounded-2xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 p-4 mb-5">
          <Scissors className="h-7 w-7 text-violet-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Split PDF</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Extract specific pages or page ranges from a PDF
        </p>
        <Badge variant="secondary" className="mt-4 px-4 py-1.5 border border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400">
          <Lock className="h-3 w-3 mr-1.5" />
          Processed locally — files never leave your device
        </Badge>
      </div>

      {!file ? (
        <Dropzone
          accept={{ "application/pdf": [".pdf"] }}
          maxSize={25 * 1024 * 1024}
          multiple={false}
          onFiles={handleFiles}
          label="Drop your PDF here"
          description="Select a PDF file to split"
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)} ·{" "}
                {pdfInfo ? `${pdfInfo.pageCount} pages` : "Loading..."}
              </p>
            </div>
          </div>

          {pdfInfo && (
            <div>
              <Label htmlFor="ranges" className="text-sm font-medium">
                Page Ranges
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter page ranges separated by commas. Example: 1-3, 5, 8-10
              </p>
              <Input
                id="ranges"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="e.g. 1-3, 5, 8-10"
              />
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Split Results</h3>
                {results.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={async () => {
                      const zip = new JSZip();
                      const baseName = file?.name.replace(".pdf", "") || "split";
                      results.forEach((blob, idx) => {
                        zip.file(`${baseName}_part${idx + 1}.pdf`, blob);
                      });
                      const zipBlob = await zip.generateAsync({ type: "blob" });
                      const url = URL.createObjectURL(zipBlob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${baseName}_parts.zip`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("ZIP downloaded with all parts");
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download All (ZIP)
                  </Button>
                )}
              </div>
              {results.map((blob, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border p-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-500/10 p-2">
                      <FileText className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Part {idx + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(blob.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => downloadResult(blob, idx)}
                    className="gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            {results.length === 0 && (
              <Button
                onClick={split}
                size="lg"
                className="flex-1"
                disabled={isSplitting || !pdfInfo}
              >
                {isSplitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Splitting...
                  </>
                ) : (
                  "Split PDF"
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
