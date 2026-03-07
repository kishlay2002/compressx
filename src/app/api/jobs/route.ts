import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, inputFilename, inputSize, outputSize, preset, pipeline } =
      await req.json();

    const compressionRatio =
      inputSize && outputSize ? Number((outputSize / inputSize).toFixed(3)) : null;

    const job = await db.job.create({
      data: {
        userId: session.user.id,
        type: type || "compress",
        status: "done",
        pipeline: pipeline || "client",
        inputFilename: inputFilename || null,
        inputSize: inputSize || null,
        outputSize: outputSize || null,
        compressionRatio,
        preset: preset || null,
      },
    });

    // Upsert daily usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db.usage.findUnique({
      where: {
        userId_date: { userId: session.user.id, date: today },
      },
    });

    if (existing) {
      await db.usage.update({
        where: { id: existing.id },
        data: {
          jobsCount: existing.jobsCount + 1,
          bytesIn: existing.bytesIn + (inputSize || 0),
          bytesOut: existing.bytesOut + (outputSize || 0),
        },
      });
    } else {
      await db.usage.create({
        data: {
          userId: session.user.id,
          date: today,
          jobsCount: 1,
          bytesIn: inputSize || 0,
          bytesOut: outputSize || 0,
        },
      });
    }

    return NextResponse.json({ id: job.id }, { status: 201 });
  } catch (error) {
    console.error("Job recording error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
