import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3 group">
              <div className="rounded-lg bg-primary p-1.5 group-hover:shadow-md group-hover:shadow-primary/25 transition-shadow">
                <Flame className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              CrushFile
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A browser-native toolkit for compressing, merging, splitting, and converting files. Nothing leaves your device.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Tools</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/compress-image" className="hover:text-foreground transition-colors">Compress Image</Link></li>
              <li><Link href="/compress-pdf" className="hover:text-foreground transition-colors">Compress PDF</Link></li>
              <li><Link href="/merge-pdf" className="hover:text-foreground transition-colors">Merge PDF</Link></li>
              <li><Link href="/split-pdf" className="hover:text-foreground transition-colors">Split PDF</Link></li>
              <li><Link href="/convert" className="hover:text-foreground transition-colors">Convert Format</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/#how" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              <li><a href="mailto:kishlaykashish99@gmail.com" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CrushFile. All rights reserved.</p>
          <a href="mailto:kishlaykashish99@gmail.com" className="text-xs hover:text-foreground transition-colors">
            kishlaykashish99@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
