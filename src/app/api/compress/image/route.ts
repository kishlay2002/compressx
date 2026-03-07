import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const quality = Number(formData.get("quality") || 75);
    const format = (formData.get("format") as string) || "jpeg";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalSize = buffer.length;

    let pipeline = sharp(buffer);

    const metadata = await pipeline.metadata();
    if (metadata.width && metadata.width > 4096) {
      pipeline = pipeline.resize({ width: 4096, withoutEnlargement: true });
    }

    let outputBuffer: Buffer;

    switch (format) {
      case "webp":
        outputBuffer = await pipeline.webp({ quality }).toBuffer();
        break;
      case "png":
        outputBuffer = await pipeline
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
        break;
      case "avif":
        outputBuffer = await pipeline.avif({ quality }).toBuffer();
        break;
      default:
        outputBuffer = await pipeline
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
    }

    const compressedSize = outputBuffer.length;

    if (compressedSize >= originalSize) {
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": file.type,
          "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
          "X-Original-Size": String(originalSize),
          "X-Compressed-Size": String(originalSize),
          "X-Savings-Percent": "0",
        },
      });
    }

    const mimeMap: Record<string, string> = {
      jpeg: "image/jpeg",
      webp: "image/webp",
      png: "image/png",
      avif: "image/avif",
    };

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": mimeMap[format] || "image/jpeg",
        "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
        "X-Original-Size": String(originalSize),
        "X-Compressed-Size": String(compressedSize),
        "X-Savings-Percent": String(
          Math.round(((originalSize - compressedSize) / originalSize) * 100)
        ),
      },
    });
  } catch (error) {
    console.error("Image compression error:", error);
    return NextResponse.json(
      { error: "Compression failed" },
      { status: 500 }
    );
  }
}
