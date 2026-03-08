"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowDownUp,
  ListOrdered,
  X,
  Loader2,
  FileText,
  Layers,
} from "lucide-react";
import type { PageThumbnail } from "@/lib/compression/pdf-client";

interface PageReorderPanelProps {
  pages: PageThumbnail[];
  onPagesChange: (pages: PageThumbnail[]) => void;
  loading?: boolean;
  disabled?: boolean;
  multiFile?: boolean;
}

export function PageReorderPanel({
  pages,
  onPagesChange,
  loading = false,
  disabled = false,
  multiFile = false,
}: PageReorderPanelProps) {
  const [reorderEnabled, setReorderEnabled] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const movePage = useCallback(
    (from: number, to: number) => {
      if (disabled) return;
      const next = [...pages];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onPagesChange(next);
    },
    [pages, onPagesChange, disabled]
  );

  const removePage = useCallback(
    (index: number) => {
      if (disabled) return;
      if (pages.length <= 1) return;
      const next = pages.filter((_, i) => i !== index);
      onPagesChange(next);
    },
    [pages, onPagesChange, disabled]
  );

  const handleDragStart = useCallback(
    (index: number) => {
      if (!reorderEnabled || disabled) return;
      setDragIdx(index);
    },
    [reorderEnabled, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      if (!reorderEnabled || disabled) return;
      e.preventDefault();
      setDragOverIdx(index);
    },
    [reorderEnabled, disabled]
  );

  const handleDrop = useCallback(
    (index: number) => {
      if (!reorderEnabled || disabled) return;
      if (dragIdx !== null && dragIdx !== index) {
        movePage(dragIdx, index);
      }
      setDragIdx(null);
      setDragOverIdx(null);
    },
    [dragIdx, movePage, reorderEnabled, disabled]
  );

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setDragOverIdx(null);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-center gap-3 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading page previews...</span>
        </div>
      </div>
    );
  }

  if (pages.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg p-1.5 bg-muted">
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              Pages ({pages.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              {multiFile ? "All pages from all files" : "Reorder or remove pages"}
            </p>
          </div>
        </div>

        {pages.length > 1 && (
          <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-0.5">
            <button
              onClick={() => setReorderEnabled(false)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                !reorderEnabled
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              Keep Order
            </button>
            <button
              onClick={() => setReorderEnabled(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                reorderEnabled
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              Reorder
            </button>
          </div>
        )}
      </div>

      {reorderEnabled && pages.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Drag pages to reorder or use arrows. Click × to remove a page.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {pages.map((page, index) => (
          <div
            key={`${page.fileIndex}-${page.pageIndex}-${index}`}
            draggable={reorderEnabled && !disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group relative rounded-xl border bg-background overflow-hidden transition-all",
              reorderEnabled && "cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/30",
              dragIdx === index && "opacity-40 scale-95",
              dragOverIdx === index && dragIdx !== index && "ring-2 ring-primary/50 bg-primary/5 scale-105"
            )}
          >
            {/* Thumbnail */}
            <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
              <img
                src={page.thumbnail}
                alt={page.pageLabel}
                className="w-full h-full object-contain"
                draggable={false}
              />

              {/* Order badge */}
              <div className="absolute top-1.5 left-1.5 rounded-md bg-background/90 backdrop-blur-sm border px-1.5 py-0.5 text-[10px] font-bold tabular-nums shadow-sm">
                {index + 1}
              </div>

              {/* Remove button */}
              {reorderEnabled && pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePage(index);
                  }}
                  className="absolute top-1.5 right-1.5 rounded-md bg-destructive/90 text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* Drag handle */}
              {reorderEnabled && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-md bg-background/90 backdrop-blur-sm border px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Page info */}
            <div className="px-2 py-1.5 border-t">
              <p className="text-[10px] font-medium truncate">{page.pageLabel}</p>
              {multiFile && (
                <p className="text-[9px] text-muted-foreground truncate">
                  {page.fileName}
                </p>
              )}
            </div>

            {/* Reorder arrows */}
            {reorderEnabled && pages.length > 1 && (
              <div className="absolute top-1/2 -translate-y-1/2 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (index > 0) movePage(index, index - 1);
                  }}
                  disabled={index === 0}
                  className="p-0.5 rounded bg-background/90 border shadow-sm hover:bg-muted disabled:opacity-30"
                >
                  <ArrowUp className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (index < pages.length - 1) movePage(index, index + 1);
                  }}
                  disabled={index === pages.length - 1}
                  className="p-0.5 rounded bg-background/90 border shadow-sm hover:bg-muted disabled:opacity-30"
                >
                  <ArrowDown className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
