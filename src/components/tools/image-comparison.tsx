"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { formatBytes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface ImageComparisonProps {
  originalFile: File;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
}

export function ImageComparison({
  originalFile,
  compressedBlob,
  originalSize,
  compressedSize,
}: ImageComparisonProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [compressedUrl, setCompressedUrl] = useState("");

  useEffect(() => {
    const oUrl = URL.createObjectURL(originalFile);
    const cUrl = URL.createObjectURL(compressedBlob);
    setOriginalUrl(oUrl);
    setCompressedUrl(cUrl);
    return () => {
      URL.revokeObjectURL(oUrl);
      URL.revokeObjectURL(cUrl);
    };
  }, [originalFile, compressedBlob]);

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setPosition((x / rect.width) * 100);
    },
    []
  );

  const handleMouseDown = useCallback(() => setIsDragging(true), []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updatePosition(e.clientX);
    };
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, updatePosition]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const savingsPercent =
    originalSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  if (!originalUrl || !compressedUrl) return null;

  return (
    <div className="rounded-2xl border overflow-hidden bg-card">
      <div
        ref={containerRef}
        className="relative w-full aspect-video cursor-col-resize select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Compressed (right / full background) */}
        <img
          src={compressedUrl}
          alt="Compressed"
          className="absolute inset-0 w-full h-full object-contain bg-muted/30"
          draggable={false}
        />

        {/* Original (left / clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={originalUrl}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain bg-muted/30"
            style={{ width: `${containerRef.current?.offsetWidth || 0}px` }}
            draggable={false}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${position}%` }}
        >
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-xl p-1.5 transition-transform",
            isDragging && "scale-110"
          )}>
            <GripVertical className="h-4 w-4 text-gray-700" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            Original
          </span>
        </div>
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            Compressed
          </span>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-sm">
        <span className="text-muted-foreground">
          {formatBytes(originalSize)} → <span className="text-green-600 font-semibold">{formatBytes(compressedSize)}</span>
        </span>
        <span className="font-semibold text-green-600">
          {savingsPercent}% smaller
        </span>
      </div>
    </div>
  );
}
