"use client";

import { formatBytes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Download, Check, ArrowRight, FileIcon, Loader2, AlertCircle, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CompressionResultProps {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  status: "pending" | "compressing" | "done" | "error";
  progress: number;
  error?: string;
  onDownload?: () => void;
}

export function CompressionResult({
  fileName,
  originalSize,
  compressedSize,
  status,
  progress,
  error,
  onDownload,
}: CompressionResultProps) {
  const savings = originalSize - compressedSize;
  const savingsPercent =
    originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

  return (
    <div className={cn(
      "rounded-2xl border bg-card p-5 transition-all duration-300",
      status === "done" && "border-green-500/20 bg-green-500/[0.02]",
      status === "error" && "border-destructive/20 bg-destructive/[0.02]",
      status === "compressing" && "border-primary/20 bg-primary/[0.02]"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "rounded-xl p-2.5 shrink-0 transition-colors",
          status === "done" ? "bg-green-500/10" :
          status === "error" ? "bg-destructive/10" :
          status === "compressing" ? "bg-primary/10" : "bg-muted"
        )}>
          {status === "compressing" ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : status === "error" ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : status === "done" ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <FileIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>

          {status === "pending" && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(originalSize)} — Ready to compress
            </p>
          )}

          {status === "compressing" && (
            <div className="mt-2.5">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-primary font-medium mt-1.5">
                Compressing... {progress}%
              </p>
            </div>
          )}

          {status === "done" && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {formatBytes(originalSize)}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                <span className="font-semibold text-green-600">
                  {formatBytes(compressedSize)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                    savingsPercent > 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <TrendingDown className="h-3 w-3" />
                  {savingsPercent > 0
                    ? `${savingsPercent}% smaller`
                    : "Already optimized"}
                </div>
                {savings > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Saved {formatBytes(savings)}
                  </span>
                )}
              </div>
            </div>
          )}

          {status === "error" && (
            <p className="text-sm text-destructive mt-1.5">{error}</p>
          )}
        </div>

        {status === "done" && onDownload && (
          <Button size="sm" onClick={onDownload} className="shrink-0 gap-1.5 rounded-xl shadow-sm">
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}

interface BatchSummaryProps {
  totalOriginal: number;
  totalCompressed: number;
  fileCount: number;
  onDownloadAll?: () => void;
}

export function BatchSummary({
  totalOriginal,
  totalCompressed,
  fileCount,
  onDownloadAll,
}: BatchSummaryProps) {
  const savings = totalOriginal - totalCompressed;
  const savingsPercent =
    totalOriginal > 0 ? Math.round((savings / totalOriginal) * 100) : 0;

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Compression Summary</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {fileCount} file{fileCount !== 1 ? "s" : ""} compressed successfully
          </p>
        </div>
        {onDownloadAll && (
          <Button onClick={onDownloadAll} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
            <Download className="h-4 w-4" />
            Download All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-5">
        <div className="rounded-xl bg-card/80 p-3.5 border">
          <p className="text-xs text-muted-foreground font-medium">Original</p>
          <p className="text-lg font-bold mt-0.5">{formatBytes(totalOriginal)}</p>
        </div>
        <div className="rounded-xl bg-card/80 p-3.5 border border-green-500/20">
          <p className="text-xs text-muted-foreground font-medium">Compressed</p>
          <p className="text-lg font-bold text-green-600 mt-0.5">
            {formatBytes(totalCompressed)}
          </p>
        </div>
        <div className="rounded-xl bg-card/80 p-3.5 border border-primary/20">
          <p className="text-xs text-muted-foreground font-medium">Saved</p>
          <p className="text-lg font-bold text-primary mt-0.5">
            {savingsPercent}%
          </p>
        </div>
      </div>
    </div>
  );
}
