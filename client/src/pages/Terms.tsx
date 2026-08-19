import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

export function TermsPage() {
  usePageMeta({
    title: "Terms of Service",
    description: "Application terms for the DailyNews360 news aggregator.",
  });
  return (
    <div className="container-news max-w-3xl py-12">
      <header className="mb-10 border-b-2 border-ink pb-6 dark:border-ink/80">
        <p className="font-sans text-xs font-bold uppercase tracking-widest text-accent">
          DailyNews360 — Policy
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-wide text-ink">
          Terms of Service
        </h1>
        <p className="mt-3 font-sans text-sm text-mist">Application terms. Not legal advice.</p>
      </header>

      <div className="flex flex-col gap-8 font-serif text-[17px] leading-relaxed text-secondary">
        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">1. The service</h2>
          <p>
            DailyNews360 aggregates headlines and article links from third-party news sources.
            It is a reader-facing product and does not produce original journalism.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">2. Content and attribution</h2>
          <p>
            All news content belongs to its original publishers. We provide links to the source
            articles and do not claim ownership of any third-party reporting. Headlines,
            summaries and previews are reproduced for the purpose of aggregation and
            discovery.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">3. Your account</h2>
          <p>
            You are responsible for keeping your account credentials secure and for the activity
            that happens under your account. Do not use the service to store unlawful content or
            to attempt to disrupt the service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">4. Acceptable use</h2>
          <p>
            You agree not to abuse the service, including: scraping the API beyond reasonable
            personal use, attempting to bypass rate limits, or using the service to misrepresent
            third-party news as your own.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">5. Availability</h2>
          <p>
            News availability depends on our third-party providers. Headlines may change or
            disappear as publishers update their content. We work hard to keep the service
            reliable but do not guarantee uninterrupted availability.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">6. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, DailyNews360 is provided "as is" without
            warranties of any kind. We are not liable for damages arising from use of the
            service, the accuracy of aggregated content, or interruption of service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">7. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after
            changes means you accept the updated terms.
          </p>
        </section>

        <p className="text-xs text-mist/70">
          These are application terms for a demonstration product and are not intended as legal
          advice. For legal questions, consult a qualified professional.
        </p>

        <div>
          <Link to="/" className="text-accent hover:underline">
            ← Back to DailyNews360
          </Link>
        </div>
      </div>
    </div>
  );
}