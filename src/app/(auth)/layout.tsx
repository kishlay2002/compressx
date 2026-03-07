import Link from "next/link";
import { Zap, Shield, FileDown, ImageDown } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
            <div className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm">
              <Zap className="h-4 w-4" />
            </div>
            CompressX
          </Link>
          <div className="space-y-8">
            <h2 className="text-4xl font-bold leading-tight">
              Compress files without<br />losing quality
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/15 p-2 backdrop-blur-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">100% Private</p>
                  <p className="text-sm text-white/70">Files never leave your browser</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/15 p-2 backdrop-blur-sm">
                  <ImageDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Up to 80% smaller</p>
                  <p className="text-sm text-white/70">Smart compression algorithms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/15 p-2 backdrop-blur-sm">
                  <FileDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">All formats supported</p>
                  <p className="text-sm text-white/70">JPEG, PNG, WebP, PDF and more</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} CompressX. All rights reserved.
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl mb-8 lg:hidden"
        >
          <div className="rounded-lg bg-primary p-1.5">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          CompressX
        </Link>
        {children}
      </div>
    </div>
  );
}
