import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF",
  description:
    "Reduce PDF file size while preserving content quality. Set target file sizes. Processed locally in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
