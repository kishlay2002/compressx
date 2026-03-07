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

  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 100,
  });

  const blob = toBlob(compressedBytes, "application/pdf");
  const originalSize = file.size;
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

  // Step 2: Rasterize & rebuild — render each page to canvas, re-encode as JPEG,
  // then create a new PDF with the rasterized pages. This is the only way to
  // achieve aggressive compression client-side since pdf-lib can't re-encode
  // embedded images.
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const numPages = pdfJsDoc.numPages;
  const targetPerPage = targetSizeBytes / numPages;

  // Binary search: try different scale/quality combos
  // Start with high quality and scale down
  const attempts = [
    { scale: 1.5, quality: 0.7 },
    { scale: 1.5, quality: 0.5 },
    { scale: 1.2, quality: 0.4 },
    { scale: 1.0, quality: 0.35 },
    { scale: 1.0, quality: 0.25 },
    { scale: 0.8, quality: 0.2 },
    { scale: 0.7, quality: 0.15 },
    { scale: 0.5, quality: 0.12 },
    { scale: 0.4, quality: 0.1 },
  ];

  let bestBlob: Blob | null = null;

  for (const { scale, quality } of attempts) {
    try {
      const newPdf = await PDFDocument.create();

      for (let p = 1; p <= numPages; p++) {
        const page = await pdfJsDoc.getPage(p);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        await page.render({ canvas, canvasContext: ctx, viewport } as never).promise;

        // Encode canvas as JPEG
        const jpegBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
            "image/jpeg",
            quality
          );
        });

        const jpegBuffer = await jpegBlob.arrayBuffer();
        const jpegImage = await newPdf.embedJpg(new Uint8Array(jpegBuffer));

        // Add page with same aspect ratio as original
        const origViewport = page.getViewport({ scale: 1 });
        const pdfPage = newPdf.addPage([origViewport.width, origViewport.height]);
        pdfPage.drawImage(jpegImage, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });
      }

      const pdfBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = toBlob(pdfBytes, "application/pdf");

      if (blob.size <= targetSizeBytes) {
        // Found a good match — use the highest quality that fits
        bestBlob = blob;
        break;
      }

      // Keep the last attempt as fallback even if over target
      bestBlob = blob;
    } catch {
      // If rendering fails for this config, try next
      continue;
    }
  }

  if (bestBlob) {
    return makeResult(file.size, bestBlob);
  }

  // Fallback: return structural-only compression
  return makeResult(file.size, toBlob(baseBytes, "application/pdf"));
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
