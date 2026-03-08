"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Zap,
  Shield,
  Gauge,
  ImageDown,
  FileDown,
  FilePlus2,
  Scissors,
  ArrowRightLeft,
  Check,
  Lock,
  Globe,
  Cpu,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const tools = [
  {
    title: "Compress Image",
    description: "JPEG, PNG, WebP — reduce size up to 80%",
    icon: ImageDown,
    href: "/compress-image",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600",
  },
  {
    title: "Compress PDF",
    description: "Shrink PDFs while keeping content crisp",
    icon: FileDown,
    href: "/compress-pdf",
    gradient: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-600",
  },
  {
    title: "Merge PDF",
    description: "Combine multiple PDFs into one",
    icon: FilePlus2,
    href: "/merge-pdf",
    gradient: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-600",
  },
  {
    title: "Split PDF",
    description: "Extract pages from a PDF",
    icon: Scissors,
    href: "/split-pdf",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-600",
  },
  {
    title: "Convert Format",
    description: "JPEG, PNG, WebP and more",
    icon: ArrowRightLeft,
    href: "/convert",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
  },
];

const features = [
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Files are processed locally in your browser. They never leave your device.",
  },
  {
    icon: Gauge,
    title: "Lightning Fast",
    description:
      "Near-native speed compression using advanced browser technology.",
  },
  {
    icon: Shield,
    title: "Quality Preserved",
    description:
      "Smart algorithms analyze content to find the optimal compression point.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "No installation needed. Works on any modern browser, any device.",
  },
  {
    icon: Cpu,
    title: "Batch Processing",
    description:
      "Compress dozens of files at once. Download as a single ZIP file.",
  },
  {
    icon: Zap,
    title: "100% Free Tier",
    description:
      "Compress up to 5 files per day for free. No sign-up required.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for occasional use",
    features: [
      "5 files per day",
      "25MB max per file",
      "Client-side processing",
      "All compression tools",
      "3 quality presets",
    ],
    cta: "Get Started",
    href: "/compress-image",
    popular: false,
  },
  {
    name: "Pro",
    price: "$8",
    period: "/month",
    description: "For power users and professionals",
    features: [
      "Unlimited files",
      "500MB max per file",
      "Server-side processing",
      "Batch processing",
      "Format conversion",
      "Priority support",
    ],
    cta: "Coming Soon",
    href: "#",
    popular: true,
    disabled: true,
  },
  {
    name: "Business",
    price: "$24",
    period: "/month",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "2GB max per file",
      "API access (10k calls/mo)",
      "Team accounts (10 seats)",
      "White-label option",
      "Dedicated support",
    ],
    cta: "Coming Soon",
    href: "#",
    popular: false,
    disabled: true,
  },
];

const stats = [
  { value: "100%", label: "Client-side processing" },
  { value: "~70%", label: "Avg. size reduction" },
  { value: "Zero", label: "Files uploaded to servers" },
  { value: "Free", label: "No sign-up required" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.15),transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium border border-primary/20 bg-primary/5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Files never leave your device
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Compress files{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-400 bg-clip-text text-transparent">
                without compromise
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The fastest, most private way to reduce file sizes. Advanced
              compression running directly in your browser — no upload required.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/compress-image" className={cn(buttonVariants({ size: "lg" }), "text-base px-8 h-12 shadow-lg shadow-primary/25")}>
                <ImageDown className="h-5 w-5 mr-2" />
                Compress Image
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link href="/compress-pdf" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "text-base px-8 h-12 border-2")}>
                <FileDown className="h-5 w-5 mr-2" />
                Compress PDF
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 relative" id="tools">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">All-in-one toolkit</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">All the tools you need</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Compress, merge, split, and convert — all in one place
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 cursor-pointer group overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.gradient} rounded-full -translate-y-12 translate-x-12 opacity-50 group-hover:opacity-80 transition-opacity`} />
                    <div className="relative">
                      <div className={`inline-flex rounded-xl p-3 bg-gradient-to-br ${tool.gradient} mb-4`}>
                        <tool.icon className={`h-6 w-6 ${tool.iconColor}`} />
                      </div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="mt-3 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Try now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Why choose us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Why CompressX?</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Built different from other compression tools
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="group rounded-2xl border bg-card/50 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/20">
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 w-fit mb-4 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 relative" id="pricing">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              Start for free. Upgrade when you need more.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10 md:scale-105"
                    : "hover:border-primary/30"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-indigo-400" />
                )}
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    {plan.popular && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                  <div className="mt-6 mb-8">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  {plan.disabled ? (
                    <div
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full h-11 text-base opacity-60 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      {plan.cta}
                    </div>
                  ) : (
                    <Link
                      href={plan.href}
                      className={cn(
                        buttonVariants({ variant: plan.popular ? "default" : "outline" }),
                        "w-full h-11 text-base",
                        plan.popular && "shadow-lg shadow-primary/25"
                      )}
                    >
                      {plan.cta}
                    </Link>
                  )}
                  <ul className="mt-8 space-y-3.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="rounded-full bg-green-500/10 p-0.5">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(120,80,255,0.12),transparent)]" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to compress?</h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              No sign-up required. Just drop your files and get smaller files
              instantly. It&apos;s that simple.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/compress-image" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base shadow-lg shadow-primary/25")}>
                Start Compressing Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
