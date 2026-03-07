export interface CompressionPreset {
  label: string;
  description: string;
  value: "light" | "balanced" | "maximum";
  jpegQuality: number;
  pngQuality: number;
  pdfImageQuality: number;
  stripMetadata: boolean;
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  compressedSize?: number;
  compressedBlob?: Blob;
  status: "pending" | "compressing" | "done" | "error";
  progress: number;
  error?: string;
  previewUrl?: string;
  compressedPreviewUrl?: string;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  savings: number;
  savingsPercent: number;
}

export interface PDFInfo {
  pageCount: number;
  title?: string;
  author?: string;
  hasImages: boolean;
}

export type ToolType =
  | "compress-image"
  | "compress-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "convert";

export interface UserPlan {
  name: "free" | "pro" | "business";
  maxFileSize: number;
  dailyLimit: number;
  batchEnabled: boolean;
  serverProcessing: boolean;
}

export const PLANS: Record<string, UserPlan> = {
  free: {
    name: "free",
    maxFileSize: 25 * 1024 * 1024,
    dailyLimit: 5,
    batchEnabled: false,
    serverProcessing: false,
  },
  pro: {
    name: "pro",
    maxFileSize: 500 * 1024 * 1024,
    dailyLimit: Infinity,
    batchEnabled: true,
    serverProcessing: true,
  },
  business: {
    name: "business",
    maxFileSize: 2 * 1024 * 1024 * 1024,
    dailyLimit: Infinity,
    batchEnabled: true,
    serverProcessing: true,
  },
};
