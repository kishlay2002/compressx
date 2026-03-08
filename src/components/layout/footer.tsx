import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/40">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg mb-4 group">
              <div className="rounded-lg bg-primary p-1.5 group-hover:shadow-md group-hover:shadow-primary/25 transition-shadow">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              CompressX
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compress PDFs and images with zero quality loss. Privacy-first — files processed locally in your browser.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Tools</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/compress-image" className="hover:text-primary transition-colors">Compress Image</Link></li>
              <li><Link href="/compress-pdf" className="hover:text-primary transition-colors">Compress PDF</Link></li>
              <li><Link href="/merge-pdf" className="hover:text-primary transition-colors">Merge PDF</Link></li>
              <li><Link href="/split-pdf" className="hover:text-primary transition-colors">Split PDF</Link></li>
              <li><Link href="/convert" className="hover:text-primary transition-colors">Convert Format</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Sign in</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CompressX. All rights reserved.</p>
          <p className="text-xs">Built with privacy in mind. Your files stay on your device.</p>
        </div>
      </div>
    </footer>
  );
}
