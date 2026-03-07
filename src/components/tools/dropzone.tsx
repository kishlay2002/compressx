"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { formatBytes } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  accept: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  description: string;
}

export function Dropzone({
  accept,
  maxSize = 25 * 1024 * 1024,
  multiple = false,
  onFiles,
  label,
  description,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedTypes = Object.keys(accept);

  const validateFiles = useCallback(
    (files: FileList | File[]) => {
      const valid: File[] = [];
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (!acceptedTypes.some((type) => file.type.match(type.replace("*", ".*")))) {
          setError(`"${file.name}" is not a supported file type`);
          return [];
        }
        if (file.size > maxSize) {
          setError(
            `"${file.name}" exceeds the ${formatBytes(maxSize)} size limit`
          );
          return [];
        }
        valid.push(file);
      }

      if (!multiple && valid.length > 1) {
        return [valid[0]];
      }

      setError(null);
      return valid;
    },
    [acceptedTypes, maxSize, multiple]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = validateFiles(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [validateFiles, onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = validateFiles(e.target.files);
      if (files.length > 0) onFiles(files);
      e.target.value = "";
    },
    [validateFiles, onFiles]
  );

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-14 transition-all duration-300 cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01] shadow-xl shadow-primary/10"
            : "border-muted-foreground/20 hover:border-primary/40 hover:bg-gradient-to-b hover:from-primary/[0.03] hover:to-transparent"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={acceptedTypes.join(",")}
          multiple={multiple}
          onChange={handleChange}
        />
        <div className="flex flex-col items-center gap-5 text-center">
          <div className={cn(
            "rounded-2xl p-5 transition-all duration-300",
            isDragging
              ? "bg-primary/15 scale-110"
              : "bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/15 group-hover:to-primary/10 group-hover:shadow-lg group-hover:shadow-primary/10"
          )}>
            <Upload className={cn(
              "h-8 w-8 transition-colors",
              isDragging ? "text-primary" : "text-primary/70 group-hover:text-primary"
            )} />
          </div>
          <div>
            <p className="text-lg font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              Max {formatBytes(maxSize)}
            </span>
            {multiple && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                Multiple files
              </span>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-destructive bg-destructive/5 rounded-lg px-4 py-2.5">
          <X className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

interface FileCardProps {
  name: string;
  size: number;
  onRemove: () => void;
}

export function FileCard({ name, size, onRemove }: FileCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
      <FileIcon className="h-8 w-8 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
