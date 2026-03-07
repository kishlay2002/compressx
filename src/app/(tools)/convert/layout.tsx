import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert Format",
  description:
    "Convert images between JPEG, PNG, and WebP formats. Fast, free, and processed locally in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
