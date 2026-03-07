import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF",
  description:
    "Extract specific pages or page ranges from a PDF. Fast, free, and processed locally in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
