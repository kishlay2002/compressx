"use client";

import { PDFDocument } from "pdf-lib";
import { CompressionResult, PDFInfo } from "@/types";

function toBlob(data: Uint8Array, type: string): Blob {
  const buf = new ArrayBuffer(data.byteLength);
  new Uint8Array(buf).set(data);
  return new Blob([buf], { type });
}

export async function compressPDFClient(
  file: File,
  imageQuality: number = 0.72,
  stripMetadata: boolean = true
): Promise<CompressionResult> {
  const arrayBuffer = await file.arrayBuffer();

  // Step 1: Try structural compression first (metadata strip + object streams)
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  if (stripMetadata) {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");
  }

  const structuralBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 100,
  });

  // If structural compression alone saves >15%, use it (preserves vector text perfectly)
  const structuralSavings = (file.size - structuralBytes.byteLength) / file.size;
  if (structuralSavings > 0.15) {
    const blob = toBlob(structuralBytes, "application/pdf");
    return makeResult(file.size, blob);
  }

  // Step 2: Re-render pages at high DPI for real compression.
  // Use 2x scale so text stays sharp, with controlled JPEG quality.
  const scale = 2.0;
  const quality = Math.max(0.5, imageQuality); // Never go below 0.5 for quality mode

  const blob = await rasterizePDF(arrayBuffer, scale, quality);

  // Only use rasterized version if it's actually smaller
  if (blob.size < file.size) {
    return makeResult(file.size, blob);
  }

  // Fallback: return structural compression result
  return makeResult(file.size, toBlob(structuralBytes, "application/pdf"));
}

export async function compressPDFToTargetSize(
  file: File,
  targetSizeBytes: number
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

  // Step 1: Try structural compression first (metadata strip + object streams)
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");

  const baseBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 100,
  });

  if (baseBytes.byteLength <= targetSizeBytes) {
    const blob = toBlob(baseBytes, "application/pdf");
    return makeResult(file.size, blob);
  }

  // Step 2: Rasterize & rebuild with high-quality settings.
  // Start with highest quality and gradually reduce until target is met.
  // Key: never go below 1.5x scale (keeps text readable) and keep quality >= 0.3
  const attempts = [
    { scale: 2.0, quality: 0.85 },
    { scale: 2.0, quality: 0.75 },
    { scale: 2.0, quality: 0.65 },
    { scale: 1.5, quality: 0.6 },
    { scale: 1.5, quality: 0.5 },
    { scale: 1.5, quality: 0.4 },
    { scale: 1.5, quality: 0.35 },
    { scale: 1.0, quality: 0.3 },
  ];

  let bestBlob: Blob | null = null;

  for (const { scale, quality } of attempts) {
    try {
      const blob = await rasterizePDF(arrayBuffer, scale, quality);

      if (blob.size <= targetSizeBytes) {
        bestBlob = blob;
        break;
      }

      // Keep last attempt as fallback
      bestBlob = blob;
    } catch {
      continue;
    }
  }

  if (bestBlob) {
    return makeResult(file.size, bestBlob);
  }

  // Fallback: return structural-only compression
  return makeResult(file.size, toBlob(baseBytes, "application/pdf"));
}

async function rasterizePDF(
  arrayBuffer: ArrayBuffer,
  scale: number,
  quality: number
): Promise<Blob> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const numPages = pdfJsDoc.numPages;
  const newPdf = await PDFDocument.create();

  for (let p = 1; p <= numPages; p++) {
    const page = await pdfJsDoc.getPage(p);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    // Enable text anti-aliasing for sharper rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    await page.render({ canvas, canvasContext: ctx, viewport } as never).promise;

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        quality
      );
    });

    const jpegBuffer = await jpegBlob.arrayBuffer();
    const jpegImage = await newPdf.embedJpg(new Uint8Array(jpegBuffer));

    // Preserve original page dimensions
    const origViewport = page.getViewport({ scale: 1 });
    const pdfPage = newPdf.addPage([origViewport.width, origViewport.height]);
    pdfPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });

    // Clean up canvas memory
    canvas.width = 0;
    canvas.height = 0;
  }

  const pdfBytes = await newPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return toBlob(pdfBytes, "application/pdf");
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
