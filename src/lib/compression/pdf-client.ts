"use client";

import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { CompressionResult, PDFInfo } from "@/types";
import { aiEnhanceImage, AIEnhanceConfig } from "./ai-enhance";

function toBlob(data: Uint8Array, type: string): Blob {
  const buf = new ArrayBuffer(data.byteLength);
  new Uint8Array(buf).set(data);
  return new Blob([buf], { type });
}

// Selectively re-compress embedded JPEG images in a PDF.
// Vector text, fonts, and graphics stay UNTOUCHED — only raster images are compressed.
// This is how professional PDF compressors (iLovePDF, SmallPDF) work.
async function recompressImages(
  pdfDoc: Awaited<ReturnType<typeof PDFDocument.load>>,
  quality: number
): Promise<number> {
  const context = pdfDoc.context;
  let compressed = 0;

  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;

    const dict = obj.dict;

    // Must be an Image XObject
    if (dict.get(PDFName.of("Subtype")) !== PDFName.of("Image")) continue;

    // Only handle JPEG images (DCTDecode filter) — skip PNG/TIFF/etc
    const filter = dict.get(PDFName.of("Filter"));
    if (!filter || filter !== PDFName.of("DCTDecode")) continue;

    const jpegData = obj.contents;
    if (!jpegData || jpegData.byteLength < 500) continue;

    try {
      // Decode original JPEG → canvas → re-encode at lower quality
      const blob = new Blob([new Uint8Array(jpegData)], { type: "image/jpeg" });
      const bitmap = await createImageBitmap(blob);

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      if (bitmap.close) bitmap.close();

      const newBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          "image/jpeg",
          quality
        );
      });

      const newData = new Uint8Array(await newBlob.arrayBuffer());

      // Only replace if at least 5% smaller (avoid re-encoding for no gain)
      if (newData.byteLength < jpegData.byteLength * 0.95) {
        const newStream = PDFRawStream.of(obj.dict, newData);
        context.assign(ref, newStream);
        compressed++;
      }

      canvas.width = 0;
      canvas.height = 0;
    } catch {
      continue;
    }
  }

  return compressed;
}

export async function compressPDFClient(
  file: File,
  imageQuality: number = 0.72,
  stripMetadata: boolean = true,
  aiConfig?: AIEnhanceConfig
): Promise<CompressionResult> {
  const arrayBuffer = await file.arrayBuffer();

  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  // Step 1: Strip metadata
  if (stripMetadata) {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");
  }

  // Step 2: Selectively re-compress embedded JPEG images
  // Vector text stays PERFECT — only raster images get compressed
  await recompressImages(pdfDoc, imageQuality);

  // Step 3: Save with object streams (structural compression)
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 100,
  });

  const blob = toBlob(compressedBytes, "application/pdf");
  return makeResult(file.size, blob);
}

export async function compressPDFToTargetSize(
  file: File,
  targetSizeBytes: number,
  aiConfig?: AIEnhanceConfig
): Promise<CompressionResult> {
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

  const arrayBuffer = await file.arrayBuffer();

  // Step 1: Structural compression + selective image re-compression
  // Try progressively lower image quality to reach target while keeping text perfect
  const qualities = [0.7, 0.5, 0.35, 0.2, 0.1];

  for (const q of qualities) {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");

    await recompressImages(pdfDoc, q);

    const bytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 100,
    });

    if (bytes.byteLength <= targetSizeBytes) {
      return makeResult(file.size, toBlob(bytes, "application/pdf"));
    }
  }

  // Step 2: If selective compression can't reach target, fall back to rasterization
  // This is the only way to hit very aggressive targets (e.g., 1.4MB → 140KB)
  const scales = [2.0, 1.5, 1.0, 0.75, 0.5];
  let bestBlob: Blob | null = null;

  for (const scale of scales) {
    let rendered: { canvases: HTMLCanvasElement[]; origDims: { w: number; h: number }[] } | null = null;
    try {
      rendered = await renderPagesToCanvases(arrayBuffer, scale);
    } catch {
      continue;
    }

    // Quick check: can this scale reach the target at lowest quality?
    const lowestBlob = await canvasesToPDF(rendered.canvases, rendered.origDims, 0.08);
    if (lowestBlob.size > targetSizeBytes) {
      rendered.canvases.forEach((c) => { c.width = 0; c.height = 0; });
      continue;
    }

    // Binary search on quality: 7 iterations → ~0.7% precision
    let lo = 0.08;
    let hi = 0.95;
    let fitBlob: Blob = lowestBlob;

    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2;
      const blob = await canvasesToPDF(rendered.canvases, rendered.origDims, mid);
      if (blob.size <= targetSizeBytes) {
        fitBlob = blob;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    bestBlob = fitBlob;
    rendered.canvases.forEach((c) => { c.width = 0; c.height = 0; });
    break;
  }

  if (bestBlob) {
    return makeResult(file.size, bestBlob);
  }

  // Fallback: return best selective compression
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  await recompressImages(pdfDoc, 0.1);
  const fallbackBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
  return makeResult(file.size, toBlob(fallbackBytes, "application/pdf"));
}

// Cache for pdfjs document to avoid reloading during binary search
let _pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjsLib() {
  if (!_pdfjsLib) {
    _pdfjsLib = await import("pdfjs-dist");
    _pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }
  return _pdfjsLib;
}

// Render pages to canvases at a given scale (reusable across quality levels)
async function renderPagesToCanvases(
  arrayBuffer: ArrayBuffer,
  scale: number
): Promise<{ canvases: HTMLCanvasElement[]; origDims: { w: number; h: number }[] }> {
  const pdfjsLib = await getPdfjsLib();
  const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const numPages = pdfJsDoc.numPages;
  const canvases: HTMLCanvasElement[] = [];
  const origDims: { w: number; h: number }[] = [];

  for (let p = 1; p <= numPages; p++) {
    const page = await pdfJsDoc.getPage(p);
    const viewport = page.getViewport({ scale });
    const origViewport = page.getViewport({ scale: 1 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    await page.render({ canvas, canvasContext: ctx, viewport } as never).promise;

    canvases.push(canvas);
    origDims.push({ w: origViewport.width, h: origViewport.height });
  }

  return { canvases, origDims };
}

// Build PDF from pre-rendered canvases at a given JPEG quality
async function canvasesToPDF(
  canvases: HTMLCanvasElement[],
  origDims: { w: number; h: number }[],
  quality: number
): Promise<Blob> {
  const newPdf = await PDFDocument.create();

  for (let i = 0; i < canvases.length; i++) {
    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvases[i].toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        quality
      );
    });

    const jpegBuffer = await jpegBlob.arrayBuffer();
    const jpegImage = await newPdf.embedJpg(new Uint8Array(jpegBuffer));

    const pdfPage = newPdf.addPage([origDims[i].w, origDims[i].h]);
    pdfPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: origDims[i].w,
      height: origDims[i].h,
    });
  }

  const pdfBytes = await newPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return toBlob(pdfBytes, "application/pdf");
}

async function rasterizePDF(
  arrayBuffer: ArrayBuffer,
  scale: number,
  quality: number
): Promise<Blob> {
  const { canvases, origDims } = await renderPagesToCanvases(arrayBuffer, scale);
  const blob = await canvasesToPDF(canvases, origDims, quality);

  // Clean up canvases
  canvases.forEach((c) => { c.width = 0; c.height = 0; });

  return blob;
}

function makeResult(originalSize: number, blob: Blob): CompressionResult {
  const compressedSize = blob.size;
  return {
    blob,
    originalSize,
    compressedSize,
    savings: Math.max(0, originalSize - compressedSize),
    savingsPercent: Math.max(
      0,
      Math.round(((originalSize - compressedSize) / originalSize) * 100)
    ),
  };
}

// Extract page thumbnails from a PDF for the reorder UI
export interface PageThumbnail {
  fileIndex: number;
  fileName: string;
  pageIndex: number; // 0-based within the source PDF
  pageLabel: string;
  thumbnail: string; // data URL
  width: number;
  height: number;
}

export async function extractPageThumbnails(
  file: File,
  fileIndex: number,
  thumbScale: number = 0.3
): Promise<PageThumbnail[]> {
  const pdfjsLib = await getPdfjsLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const pages: PageThumbnail[] = [];

  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale: thumbScale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport } as never).promise;

    const thumbnail = canvas.toDataURL("image/jpeg", 0.6);

    pages.push({
      fileIndex,
      fileName: file.name,
      pageIndex: p - 1,
      pageLabel: `Page ${p}`,
      thumbnail,
      width: viewport.width,
      height: viewport.height,
    });

    canvas.width = 0;
    canvas.height = 0;
  }

  return pages;
}

// Rebuild a single PDF with pages in a custom order (for page reorder within one file)
export async function reorderPDFPages(
  file: File,
  pageOrder: number[] // 0-based page indices in desired order
): Promise<File> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(sourcePdf, pageOrder);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const bytes = await newPdf.save();
  const blob = toBlob(bytes, "application/pdf");
  return new File([blob], file.name, { type: "application/pdf" });
}

// Merge multiple PDFs with custom page-level ordering
// Each entry specifies which file and which page to include
export async function mergeWithPageOrder(
  files: File[],
  pageOrder: { fileIndex: number; pageIndex: number }[]
): Promise<Blob> {
  // Load all source PDFs
  const sourcePdfs = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      return PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    })
  );

  const newPdf = await PDFDocument.create();

  for (const { fileIndex, pageIndex } of pageOrder) {
    const [copiedPage] = await newPdf.copyPages(sourcePdfs[fileIndex], [pageIndex]);
    newPdf.addPage(copiedPage);
  }

  const bytes = await newPdf.save();
  return toBlob(bytes, "application/pdf");
}

export async function getPDFInfo(file: File): Promise<PDFInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle() || undefined,
    author: pdfDoc.getAuthor() || undefined,
    hasImages: true,
  };
}

export async function mergePDFs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return toBlob(mergedBytes, "application/pdf");
}

export async function splitPDF(
  file: File,
  pageRanges: { start: number; end: number }[]
): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });
  const results: Blob[] = [];

  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create();
    const indices = [];
    for (let i = range.start; i <= range.end && i < sourcePdf.getPageCount(); i++) {
      indices.push(i);
    }
    const pages = await newPdf.copyPages(sourcePdf, indices);
    pages.forEach((page) => newPdf.addPage(page));
    const bytes = await newPdf.save();
    results.push(toBlob(bytes, "application/pdf"));
  }

  return results;
}
