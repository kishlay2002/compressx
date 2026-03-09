import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 p-4 mb-5">
          <ScrollText className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Service Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            CrushFile provides browser-based file compression, merging, splitting, and conversion tools.
            All file processing happens locally in your browser — files are never uploaded to our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may use CrushFile for lawful purposes only. You are responsible for the content
            of any files you process. Do not use the service to process illegal, harmful, or
            infringing content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Free Tier</h2>
          <p className="text-muted-foreground leading-relaxed">
            The free tier allows up to 5 file operations per day with a maximum file size of 25MB.
            These limits may be adjusted at our discretion. No account is required for the free tier.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Account Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you create an account, you are responsible for maintaining the security of your credentials.
            You must provide accurate information during registration. We reserve the right to suspend
            accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            CrushFile is provided &quot;as is&quot; without warranty of any kind. While we strive to
            maintain high quality compression, we cannot guarantee specific compression ratios or
            that output files will be suitable for all purposes. Always keep backups of your original files.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Since all processing happens in your browser, CrushFile is not responsible for any
            data loss, file corruption, or other issues that may occur during processing.
            We recommend keeping original copies of your files.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms from time to time. Continued use of the service after
            changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about these terms? Reach out at{" "}
            <a href="mailto:kishlaykashish99@gmail.com" className="text-primary hover:underline">
              kishlaykashish99@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
