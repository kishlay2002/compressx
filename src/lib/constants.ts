import { CompressionPreset } from "@/types";

export const COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    label: "Light",
    description: "Perfect quality — metadata strip + structural optimization",
    value: "light",
    jpegQuality: 85,
    pngQuality: 90,
    pdfImageQuality: 85,
    stripMetadata: false,
  },
  {
    label: "Balanced",
    description: "Great quality — text stays perfect, images compressed",
    value: "balanced",
    jpegQuality: 72,
    pngQuality: 75,
    pdfImageQuality: 60,
    stripMetadata: true,
  },
  {
    label: "Maximum",
    description: "Smallest size — text perfect, images aggressively compressed",
    value: "maximum",
    jpegQuality: 55,
    pngQuality: 55,
    pdfImageQuality: 35,
    stripMetadata: true,
  },
];

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

export const ACCEPTED_PDF_TYPES = ["application/pdf"];

export const MAX_FREE_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_PRO_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const FREE_DAILY_LIMIT = 5;

export const TOOLS = [
  {
    id: "compress-image",
    title: "Compress Image",
    description: "Reduce image file size without losing quality",
    icon: "ImageDown",
    href: "/compress-image",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce PDF file size while preserving content",
    icon: "FileDown",
    href: "/compress-pdf",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDFs into one document",
    icon: "FilePlus2",
    href: "/merge-pdf",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract pages from a PDF document",
    icon: "Scissors",
    href: "/split-pdf",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: "convert",
    title: "Convert Format",
    description: "Convert images between JPEG, PNG, WebP, and more",
    icon: "ArrowRightLeft",
    href: "/convert",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
] as const;

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
