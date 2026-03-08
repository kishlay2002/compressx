"use client";

/**
 * AI-powered text enhancement for compressed PDF pages.
 *
 * This module provides an optional AI enhancement step that can be applied
 * to rasterized PDF pages to improve text readability after compression.
 *
 * Two approaches are supported:
 *
 * 1. **Client-side contrast enhancement** (free, always available)
 *    - Adaptive contrast boost that makes text darker and backgrounds lighter
 *    - Effectively increases perceived sharpness without any API calls
 *
 * 2. **API-based AI upscaling** (optional, requires API key)
 *    - Sends page images to an AI super-resolution API
 *    - Returns enhanced images with sharper text and cleaner edges
 *    - Supports: Replicate (Real-ESRGAN), Cloudflare AI, or custom endpoint
 */

// ─── Client-side adaptive contrast enhancement ─────────────────────────────
// Boosts text contrast: makes dark pixels (text) darker, light pixels (bg) lighter.
// This is perceptually similar to what AI enhancement does for text-heavy content.

export function enhanceTextContrast(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength: number = 0.3 // 0 = no effect, 1 = maximum
) {
  if (w === 0 || h === 0) return;

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // S-curve contrast: pushes mid-tones toward black or white
  // This makes text crisper by increasing the contrast between text and background
  const factor = 1 + strength * 2; // 1.0 to 3.0

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const val = data[i + c] / 255;
      // S-curve: steeper midtone transition
      const enhanced = ((val - 0.5) * factor + 0.5);
      data[i + c] = Math.min(255, Math.max(0, Math.round(enhanced * 255)));
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ─── API-based AI enhancement ───────────────────────────────────────────────
// This sends page images to an external AI API for super-resolution upscaling.
// The enhanced image is then used in the PDF instead of the raw rasterized one.

export interface AIEnhanceConfig {
  provider: "replicate" | "cloudflare" | "custom";
  apiKey: string;
  endpoint?: string; // required for "custom" provider
}

export async function aiEnhanceImage(
  imageBlob: Blob,
  config: AIEnhanceConfig
): Promise<Blob> {
  switch (config.provider) {
    case "replicate":
      return enhanceViaReplicate(imageBlob, config.apiKey);
    case "cloudflare":
      return enhanceViaCloudflare(imageBlob, config.apiKey);
    case "custom":
      if (!config.endpoint) throw new Error("Custom endpoint URL required");
      return enhanceViaCustom(imageBlob, config.apiKey, config.endpoint);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

async function enhanceViaReplicate(imageBlob: Blob, apiKey: string): Promise<Blob> {
  // Real-ESRGAN via Replicate API — upscales and sharpens images
  const base64 = await blobToBase64(imageBlob);

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
      input: {
        image: base64,
        scale: 2,
        face_enhance: false,
      },
    }),
  });

  if (!response.ok) throw new Error(`Replicate API error: ${response.status}`);

  const prediction = await response.json();

  // Poll for result
  let result = prediction;
  while (result.status === "starting" || result.status === "processing") {
    await new Promise((r) => setTimeout(r, 1000));
    const poll = await fetch(result.urls.get, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    result = await poll.json();
  }

  if (result.status !== "succeeded") throw new Error("AI enhancement failed");

  // Download enhanced image
  const enhanced = await fetch(result.output);
  return enhanced.blob();
}

async function enhanceViaCloudflare(imageBlob: Blob, apiKey: string): Promise<Blob> {
  // Cloudflare AI — image super-resolution
  const formData = new FormData();
  formData.append("file", imageBlob);

  const response = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    }
  );

  if (!response.ok) throw new Error(`Cloudflare AI error: ${response.status}`);
  return response.blob();
}

async function enhanceViaCustom(
  imageBlob: Blob,
  apiKey: string,
  endpoint: string
): Promise<Blob> {
  const formData = new FormData();
  formData.append("image", imageBlob);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) throw new Error(`Custom API error: ${response.status}`);
  return response.blob();
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
