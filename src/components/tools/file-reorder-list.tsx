"use client";

import { useState, useCallback, useRef } from "react";
import { FileCard } from "@/components/tools/dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowDownUp,
  ListOrdered,
  X,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

interface FileReorderListProps {
  files: { name: string; size: number }[];
  onReorder: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onRestore?: (index: number) => void;
  title?: string;
  disabled?: boolean;
}

export function FileReorderList({
  files,
  onReorder,
  onRemove,
  onRestore,
  title = "Files",
  disabled = false,
}: FileReorderListProps) {
  const [reorderEnabled, setReorderEnabled] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleRemove = useCallback(
    (index: number) => {
      const fileName = files[index]?.name || "File";
      onRemove(index);
      toast(`"${fileName}" removed`, {
        action: onRestore
          ? {
              label: "Undo",
              onClick: () => onRestore(index),
            }
          : undefined,
        duration: 5000,
      });
    },
    [files, onRemove, onRestore]
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
        onReorder(dragIdx, index);
      }
      setDragIdx(null);
      setDragOverIdx(null);
    },
    [dragIdx, onReorder, reorderEnabled, disabled]
  );

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setDragOverIdx(null);
  }, []);

  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {title} ({files.length})
        </h3>
        {files.length > 1 && (
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

      {reorderEnabled && files.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Drag to reorder or use the arrow buttons
        </p>
      )}

      <div className="space-y-1.5">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            draggable={reorderEnabled && !disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-2 rounded-xl p-1.5 transition-all",
              reorderEnabled && "hover:bg-muted/50",
              dragIdx === index && "opacity-50",
              dragOverIdx === index &&
                dragIdx !== index &&
                "ring-2 ring-primary/40 bg-primary/5"
            )}
          >
            {reorderEnabled ? (
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
            ) : (
              <span className="w-4" />
            )}
            <span className="text-xs text-muted-foreground w-6 text-center font-medium tabular-nums">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <FileCard
                name={file.name}
                size={file.size}
                onRemove={() => handleRemove(index)}
              />
            </div>
            {reorderEnabled && files.length > 1 && (
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => index > 0 && onReorder(index, index - 1)}
                  disabled={index === 0 || disabled}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() =>
                    index < files.length - 1 && onReorder(index, index + 1)
                  }
                  disabled={index === files.length - 1 || disabled}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
