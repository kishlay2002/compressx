"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ImageDown,
  FileDown,
  FilePlus2,
  Scissors,
  ArrowRightLeft,
  Check,
  ArrowRight,
  EyeOff,
  Layers,
  Mail,
  HardDriveDownload,
  ShieldCheck,
  Workflow,
  MonitorSmartphone,
  Flame,
} from "lucide-react";

const tools = [
  {
    title: "Crush Images",
    desc: "JPEG, PNG, WebP — up to 80% smaller",
    icon: ImageDown,
    href: "/compress-image",
    accent: "from-indigo-500 to-blue-400",
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Crush PDFs",
    desc: "Shrink documents, keep them crisp",
    icon: FileDown,
    href: "/compress-pdf",
    accent: "from-rose-500 to-pink-400",
    bg: "bg-rose-500/10",
    text: "text-rose-500 dark:text-rose-400",
  },
  {
    title: "Merge PDFs",
    desc: "Combine files with page-level reorder",
    icon: FilePlus2,
    href: "/merge-pdf",
    accent: "from-teal-500 to-emerald-400",
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
  },
  {
    title: "Split PDF",
    desc: "Extract pages or ranges instantly",
    icon: Scissors,
    href: "/split-pdf",
    accent: "from-violet-500 to-purple-400",
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    title: "Convert",
    desc: "Switch between JPEG, PNG & WebP",
    icon: ArrowRightLeft,
    href: "/convert",
    accent: "from-sky-500 to-cyan-400",
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
  },
];

const promises = [
  {
    icon: EyeOff,
    title: "100 % on-device",
    description: "Files never leave your browser. We can't see them even if we tried.",
  },
  {
    icon: HardDriveDownload,
    title: "Nothing to install",
    description: "Works on every modern browser — Chrome, Safari, Firefox, Edge, mobile included.",
  },
  {
    icon: Layers,
    title: "Page-level control",
    description: "Drag-and-drop thumbnails to reorder or remove individual pages before processing.",
  },
  {
    icon: Workflow,
    title: "Batch mode",
    description: "Drop dozens of files at once and download them all in a single ZIP.",
  },
  {
    icon: ShieldCheck,
    title: "No account wall",
    description: "Every tool works for free, right now, with zero sign-up friction.",
  },
  {
    icon: MonitorSmartphone,
    title: "Automatic dark mode",
    description: "Adapts to your system theme or toggle it manually from the navbar.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ━━━ HERO ━━━ */}
      <section className="relative isolate overflow-hidden">
        {/* gradient orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-400/15 blur-[100px]" />

        <div className="container mx-auto px-4 pt-28 pb-24 md:pt-40 md:pb-36 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <Flame className="h-3.5 w-3.5" />
              Free &amp; 100 % private — nothing leaves your browser
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05]">
              Crush your files
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                not your privacy
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Compress images &amp; PDFs, merge documents, split pages, convert formats
              — all processed <strong>on your device</strong>. No servers. No uploads. Ever.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/compress-pdf"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-13 px-8 text-base font-semibold shadow-lg shadow-primary/30 rounded-xl"
                )}
              >
                Crush a PDF
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link
                href="/compress-image"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-13 px-8 text-base font-semibold border-2 rounded-xl"
                )}
              >
                Crush an Image
              </Link>
            </div>

            {/* trust strip */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {["Client-side only", "No sign-up", "Dark mode", "Works offline"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ TOOLS GRID ━━━ */}
      <section className="py-24" id="tools">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need in one place
            </h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
              Five tools. Zero tab-hopping. All free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="group">
                <div className="relative rounded-2xl border bg-card p-6 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 overflow-hidden">
                  {/* subtle gradient corner */}
                  <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${tool.accent} opacity-20 group-hover:opacity-40 transition-opacity blur-xl`} />
                  <div className="relative">
                    <div className={cn("rounded-xl p-3 w-fit mb-4", tool.bg)}>
                      <tool.icon className={cn("h-6 w-6", tool.text)} />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {tool.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Open tool <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* bonus card — CTA */}
            <div className="relative rounded-2xl border-2 border-dashed border-primary/20 p-6 flex flex-col items-center justify-center text-center bg-primary/[0.03]">
              <p className="text-sm font-medium text-primary">More tools coming</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
                PDF → Word, watermark, OCR and more on the roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section className="py-24 bg-muted/30 border-y" id="how">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Three steps. That&apos;s it.
            </h2>
            <p className="text-muted-foreground mt-3 text-lg">
              No installs, no account, no waiting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                num: "1",
                title: "Drop your files",
                desc: "Drag PDFs or images into the browser. Supports batch uploads.",
              },
              {
                num: "2",
                title: "Tweak settings",
                desc: "Pick quality, reorder pages, set a target size — or use the defaults.",
              },
              {
                num: "3",
                title: "Download results",
                desc: "Grab optimized files instantly. Multiple files? One-click ZIP.",
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-black shadow-lg shadow-primary/25">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ WHY CRUSHFILE ━━━ */}
      <section className="py-24" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Why CrushFile?
            </h2>
            <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
              Other tools upload your files. We don&apos;t. Here&apos;s what else makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {promises.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20"
              >
                <div className="rounded-xl bg-primary/10 p-2.5 w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PRICING ━━━ */}
      <section className="py-24 bg-muted/30 border-y" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
              Start free. Upgrade when you need more power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="rounded-3xl border-2 border-primary/20 bg-card p-8 shadow-xl shadow-primary/5 flex flex-col">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider w-fit mb-4">
                Current plan
              </span>
              <h3 className="text-2xl font-bold">Free</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-black">$0</span>
                <span className="text-muted-foreground ml-1">/mo</span>
              </div>
              <ul className="space-y-3 flex-1">
                {[
                  "All 5 tools unlocked",
                  "Up to 25 MB per file",
                  "5 operations / day",
                  "Client-side processing",
                  "Page reorder & removal",
                  "Dark & light themes",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <div className="rounded-full bg-emerald-500/10 p-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/compress-image"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full h-12 text-base font-semibold mt-8 rounded-xl shadow-lg shadow-primary/25"
                )}
              >
                Start crushing files
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>

            {/* Pro — Coming Soon */}
            <div className="relative rounded-3xl border bg-card p-8 flex flex-col opacity-80">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block rounded-full bg-violet-500/90 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-2xl font-bold mt-2">Pro</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-black">$8</span>
                <span className="text-muted-foreground ml-1">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">For power users and professionals</p>
              <ul className="space-y-3 flex-1">
                {[
                  "Unlimited files",
                  "500 MB max per file",
                  "Server-side processing",
                  "Batch processing",
                  "Format conversion",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <div className="rounded-full bg-emerald-500/10 p-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full h-12 text-base mt-8 rounded-xl opacity-60 cursor-not-allowed pointer-events-none"
                )}
              >
                Coming Soon
              </div>
            </div>

            {/* Business — Coming Soon */}
            <div className="relative rounded-3xl border bg-card p-8 flex flex-col opacity-80">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block rounded-full bg-violet-500/90 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-2xl font-bold mt-2">Business</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-black">$24</span>
                <span className="text-muted-foreground ml-1">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">For teams and organizations</p>
              <ul className="space-y-3 flex-1">
                {[
                  "Everything in Pro",
                  "2 GB max per file",
                  "API access (10k calls/mo)",
                  "Team accounts (10 seats)",
                  "White-label option",
                  "Dedicated support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <div className="rounded-full bg-emerald-500/10 p-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full h-12 text-base mt-8 rounded-xl opacity-60 cursor-not-allowed pointer-events-none"
                )}
              >
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ CONTACT ━━━ */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="rounded-3xl border bg-card p-10 md:p-14 max-w-2xl mx-auto">
            <Mail className="h-10 w-10 text-primary mx-auto mb-5" />
            <h2 className="text-2xl md:text-3xl font-bold">
              Got feedback?
            </h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Bug reports, feature requests, or just a friendly hello — we read every message.
            </p>
            <a
              href="mailto:kishlaykashish99@gmail.com"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-6 h-12 px-8 text-base rounded-xl font-medium"
              )}
            >
              kishlaykashish99@gmail.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
