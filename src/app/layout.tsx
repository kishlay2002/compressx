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
    default: "CompressX — Compress PDFs & Images Online for Free",
    template: "%s | CompressX",
  },
  description:
    "Compress PDFs and images without losing quality. Privacy-first — files are processed locally in your browser. No upload required.",
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
  authors: [{ name: "CompressX" }],
  creator: "CompressX",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CompressX",
    title: "CompressX — Compress PDFs & Images Online for Free",
    description:
      "Compress PDFs and images without losing quality. Privacy-first — files processed locally in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CompressX — Compress PDFs & Images Online for Free",
    description:
      "Compress PDFs and images without losing quality. Privacy-first — files processed locally in your browser.",
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
