import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your compression history, statistics, and quick actions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
