import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Image",
  description:
    "Compress JPEG, PNG, and WebP images without losing visible quality. Set target file sizes. Processed locally in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
