import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CrushFile — Crush PDFs & Images Instantly, Free & Private",
    template: "%s | CrushFile",
  },
  description:
    "Crush file sizes in your browser. Compress, merge, split, and convert PDFs & images — 100% private, nothing ever uploaded.",
  keywords: [
    "compress pdf",
    "compress image",
    "reduce pdf size",
    "image compressor",
    "pdf compressor",
    "merge pdf",
    "split pdf",
    "convert image",
    "free compression tool",
    "browser-based compression",
  ],
  authors: [{ name: "CrushFile" }],
  creator: "CrushFile",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CrushFile",
    title: "CrushFile — Crush PDFs & Images Instantly, Free & Private",
    description:
      "Crush file sizes in your browser. 100% private — nothing ever uploaded.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrushFile — Crush PDFs & Images Instantly, Free & Private",
    description:
      "Crush file sizes in your browser. 100% private — nothing ever uploaded.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
