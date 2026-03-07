import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <div className="rounded-2xl bg-primary/10 p-6">
        <FileQuestion className="h-12 w-12 text-primary" />
      </div>
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link href="/">
        <Button className="gap-2">
          <Home className="h-4 w-4" />
          Go Home
        </Button>
      </Link>
    </div>
  );
}
