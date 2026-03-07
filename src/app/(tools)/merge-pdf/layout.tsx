import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF",
  description:
    "Combine multiple PDF files into a single document. Fast, free, and processed locally in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
