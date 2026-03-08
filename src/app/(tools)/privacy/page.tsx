import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex rounded-2xl bg-gradient-to-br from-green-500/15 to-emerald-500/15 p-4 mb-5">
          <Shield className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Our Core Promise</h2>
          <p className="text-muted-foreground leading-relaxed">
            CompressX is built with privacy as a foundation, not an afterthought. Your files are processed
            entirely in your browser using client-side technology. <strong>We never upload, store, or
            have access to any files you compress, merge, split, or convert.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">What We Don&apos;t Collect</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              We never see, access, or store the files you process
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              Files are processed in your browser and never leave your device
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              No file content is transmitted to our servers
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">What We May Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            If you create an account, we store:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/60 mt-1">•</span>
              Your name and email address (for authentication)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/60 mt-1">•</span>
              Basic usage metadata (file count, sizes — never file contents)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/60 mt-1">•</span>
              Standard web analytics (page views, anonymized)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use essential cookies for authentication sessions only. We do not use
            tracking cookies or sell any data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you sign in with Google, Google&apos;s privacy policy applies to the authentication
            process. We only receive your name and email — never your Google password.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about privacy? Reach out at{" "}
            <a href="mailto:privacy@compressx.app" className="text-primary hover:underline">
              privacy@compressx.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
