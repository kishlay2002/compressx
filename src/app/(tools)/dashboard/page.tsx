"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/constants";
import Link from "next/link";
import {
  ImageDown,
  FileDown,
  FilePlus2,
  Scissors,
  ArrowRightLeft,
  BarChart3,
  FileStack,
  HardDrive,
  Crown,
  Clock,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

interface DashboardData {
  stats: { totalJobs: number; totalSaved: number; avgReduction: number };
  todayUsage: { jobsCount: number; bytesIn: number; bytesOut: number };
  recentJobs: {
    id: string;
    type: string;
    inputFilename: string | null;
    inputSize: number | null;
    outputSize: number | null;
    compressionRatio: number | null;
    preset: string | null;
    pipeline: string;
    createdAt: string;
  }[];
}

const quickActions = [
  {
    title: "Compress Image",
    href: "/compress-image",
    icon: ImageDown,
    gradient: "from-blue-500/15 to-cyan-500/15",
    iconColor: "text-blue-600",
  },
  {
    title: "Compress PDF",
    href: "/compress-pdf",
    icon: FileDown,
    gradient: "from-red-500/15 to-orange-500/15",
    iconColor: "text-red-600",
  },
  {
    title: "Merge PDF",
    href: "/merge-pdf",
    icon: FilePlus2,
    gradient: "from-emerald-500/15 to-green-500/15",
    iconColor: "text-emerald-600",
  },
  {
    title: "Split PDF",
    href: "/split-pdf",
    icon: Scissors,
    gradient: "from-violet-500/15 to-purple-500/15",
    iconColor: "text-violet-600",
  },
  {
    title: "Convert",
    href: "/convert",
    icon: ArrowRightLeft,
    gradient: "from-amber-500/15 to-orange-500/15",
    iconColor: "text-amber-600",
  },
];

const typeLabels: Record<string, string> = {
  "compress-image": "Image Compression",
  "compress-pdf": "PDF Compression",
  "merge-pdf": "PDF Merge",
  "split-pdf": "PDF Split",
  convert: "Format Conversion",
};

const typeIcons: Record<string, typeof ImageDown> = {
  "compress-image": ImageDown,
  "compress-pdf": FileDown,
  "merge-pdf": FilePlus2,
  "split-pdf": Scissors,
  convert: ArrowRightLeft,
};

const typeColors: Record<string, string> = {
  "compress-image": "text-blue-500",
  "compress-pdf": "text-red-500",
  "merge-pdf": "text-emerald-500",
  "split-pdf": "text-violet-500",
  convert: "text-amber-500",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setDashData(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-lg w-64" />
          <div className="h-5 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const plan = (session?.user as Record<string, unknown>)?.plan as string || "free";
  const stats = dashData?.stats || { totalJobs: 0, totalSaved: 0, avgReduction: 0 };
  const todayUsage = dashData?.todayUsage || { jobsCount: 0, bytesIn: 0, bytesOut: 0 };
  const recentJobs = dashData?.recentJobs || [];

  const firstName = session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there";

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here&apos;s an overview of your compression activity
          </p>
        </div>
        <Badge
          variant={plan === "free" ? "secondary" : "default"}
          className={cn(
            "text-sm px-4 py-1.5",
            plan !== "free" && "bg-gradient-to-r from-primary to-violet-500 border-0"
          )}
        >
          <Crown className="h-3.5 w-3.5 mr-1.5" />
          {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="overflow-hidden">
          <CardContent className="pt-5 pb-5 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 p-2.5 w-fit mb-3">
                <FileStack className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Files Compressed</p>
              <p className="text-2xl font-bold mt-0.5">{stats.totalJobs}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="pt-5 pb-5 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-br from-green-500/15 to-emerald-500/15 p-2.5 w-fit mb-3">
                <HardDrive className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Space Saved</p>
              <p className="text-2xl font-bold mt-0.5">
                {stats.totalSaved > 0 ? formatBytes(stats.totalSaved) : "0 B"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="pt-5 pb-5 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 p-2.5 w-fit mb-3">
                <TrendingDown className="h-5 w-5 text-violet-600" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Avg. Reduction</p>
              <p className="text-2xl font-bold mt-0.5">
                {stats.avgReduction > 0 ? `${stats.avgReduction}%` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="pt-5 pb-5 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 p-2.5 w-fit mb-3">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Today&apos;s Usage</p>
              <p className="text-2xl font-bold mt-0.5">{todayUsage.jobsCount}<span className="text-sm font-normal text-muted-foreground">/5</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Limits (Free plan) */}
      {plan === "free" && (
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">
                  Free Plan — {todayUsage.jobsCount}/5 files today
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Upgrade for unlimited files, batch processing &amp; server-side compression
                </p>
              </div>
            </div>
            <Link href="/#pricing" className={cn(buttonVariants({ size: "sm" }), "shrink-0 shadow-sm shadow-primary/20")}>
              Upgrade
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="flex flex-col items-center gap-3 rounded-2xl border p-5 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-300 cursor-pointer text-center group">
                <div className={`rounded-xl p-2.5 bg-gradient-to-br ${action.gradient} group-hover:shadow-md transition-shadow`}>
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <span className="text-xs font-semibold group-hover:text-primary transition-colors">{action.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            {recentJobs.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {recentJobs.length} recent
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="rounded-2xl bg-muted/50 p-5 w-fit mx-auto mb-4">
                <FileStack className="h-10 w-10 opacity-40" />
              </div>
              <p className="font-medium">No compression history yet</p>
              <p className="text-sm mt-1.5 max-w-sm mx-auto">
                Start compressing files to see your activity here
              </p>
              <Link
                href="/compress-image"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
              >
                Compress your first file
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => {
                const pct =
                  job.inputSize && job.outputSize
                    ? Math.round(
                        ((job.inputSize - job.outputSize) / job.inputSize) * 100
                      )
                    : 0;
                const JobIcon = typeIcons[job.type] || FileDown;
                const jobColor = typeColors[job.type] || "text-muted-foreground";
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-xl border p-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-muted/80 p-2 shrink-0">
                        <JobIcon className={cn("h-4 w-4", jobColor)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {job.inputFilename || typeLabels[job.type] || job.type}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(job.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {pct > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                          <TrendingDown className="h-3 w-3" />
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.inputSize ? formatBytes(job.inputSize) : "—"} → {job.outputSize ? formatBytes(job.outputSize) : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
