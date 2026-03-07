"use client";

import { CompressionResult } from "@/types";

export async function compressImageClient(
  file: File,
  quality: number = 0.75,
  maxWidth: number = 4096,
  maxHeight: number = 4096,
  outputFormat?: string
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = outputFormat || getMimeType(file);
      const qualityParam = mimeType === "image/png" ? undefined : quality;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"));
            return;
          }

          const originalSize = file.size;
          const compressedSize = blob.size;

          if (compressedSize >= originalSize && !outputFormat) {
            resolve({
              blob: file,
              originalSize,
              compressedSize: originalSize,
              savings: 0,
              savingsPercent: 0,
            });
            return;
          }

          resolve({
            blob,
            originalSize,
            compressedSize,
            savings: originalSize - compressedSize,
            savingsPercent: Math.round(
              ((originalSize - compressedSize) / originalSize) * 100
            ),
          });
        },
        mimeType,
        qualityParam
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

export async function compressImageToTargetSize(
  file: File,
  targetSizeBytes: number,
  maxWidth: number = 4096,
  maxHeight: number = 4096,
  maxIterations: number = 12
): Promise<CompressionResult> {
  const mimeType = getMimeType(file);

  // PNG doesn't support quality-based compression — convert to JPEG for target size
  const outputMime =
    mimeType === "image/png" ? "image/jpeg" : mimeType;

  // If file is already smaller than target, return as-is
  if (file.size <= targetSizeBytes) {
    return {
      blob: file,
      originalSize: file.size,
      compressedSize: file.size,
      savings: 0,
      savingsPercent: 0,
    };
  }

  // Load image once onto a canvas
  const { canvas, width, height } = await loadImageToCanvas(
    file,
    maxWidth,
    maxHeight
  );

  // Binary search on quality to hit target size
  let low = 0.01;
  let high = 1.0;
  let bestBlob: Blob | null = null;
  let bestQuality = high;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const blob = await canvasToBlob(canvas, outputMime, mid);

    if (blob.size <= targetSizeBytes) {
      bestBlob = blob;
      bestQuality = mid;
      low = mid; // try higher quality
    } else {
      high = mid; // need lower quality
    }

    // Close enough — within 5% of target
    if (
      bestBlob &&
      bestBlob.size <= targetSizeBytes &&
      bestBlob.size >= targetSizeBytes * 0.85
    ) {
      break;
    }
  }

  // If binary search didn't find a small enough result, also try scaling down
  if (!bestBlob || bestBlob.size > targetSizeBytes) {
    const scales = [0.75, 0.5, 0.35, 0.25, 0.15, 0.1];
    for (const scale of scales) {
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = Math.round(width * scale);
      scaledCanvas.height = Math.round(height * scale);
      const ctx = scaledCanvas.getContext("2d");
      if (!ctx) continue;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

      // Binary search again on the scaled canvas
      let sLow = 0.01;
      let sHigh = 0.9;
      for (let j = 0; j < 8; j++) {
        const sMid = (sLow + sHigh) / 2;
        const blob = await canvasToBlob(scaledCanvas, outputMime, sMid);
        if (blob.size <= targetSizeBytes) {
          bestBlob = blob;
          sLow = sMid;
        } else {
          sHigh = sMid;
        }
        if (
          bestBlob &&
          bestBlob.size <= targetSizeBytes &&
          bestBlob.size >= targetSizeBytes * 0.85
        ) {
          break;
        }
      }

      if (bestBlob && bestBlob.size <= targetSizeBytes) break;
    }
  }

  // Fallback: use the last blob even if over target
  if (!bestBlob) {
    bestBlob = await canvasToBlob(canvas, outputMime, 0.01);
  }

  const originalSize = file.size;
  const compressedSize = bestBlob.size;

  return {
    blob: bestBlob,
    originalSize,
    compressedSize,
    savings: Math.max(0, originalSize - compressedSize),
    savingsPercent: Math.max(
      0,
      Math.round(((originalSize - compressedSize) / originalSize) * 100)
    ),
  };
}

function loadImageToCanvas(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      resolve({ canvas, width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

function getMimeType(file: File): string {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
