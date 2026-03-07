import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get aggregate stats
    const jobs = await db.job.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const totalJobs = jobs.length;
    const totalBytesIn = jobs.reduce((s, j) => s + (j.inputSize || 0), 0);
    const totalBytesOut = jobs.reduce((s, j) => s + (j.outputSize || 0), 0);
    const totalSaved = totalBytesIn - totalBytesOut;
    const avgReduction =
      totalBytesIn > 0
        ? Math.round(((totalBytesIn - totalBytesOut) / totalBytesIn) * 100)
        : 0;

    // Today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsage = await db.usage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    // Recent jobs (last 10)
    const recentJobs = jobs.slice(0, 10).map((j) => ({
      id: j.id,
      type: j.type,
      inputFilename: j.inputFilename,
      inputSize: j.inputSize,
      outputSize: j.outputSize,
      compressionRatio: j.compressionRatio,
      preset: j.preset,
      pipeline: j.pipeline,
      createdAt: j.createdAt,
    }));

    return NextResponse.json({
      stats: {
        totalJobs,
        totalSaved,
        avgReduction,
      },
      todayUsage: {
        jobsCount: todayUsage?.jobsCount || 0,
        bytesIn: todayUsage?.bytesIn || 0,
        bytesOut: todayUsage?.bytesOut || 0,
      },
      recentJobs,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
