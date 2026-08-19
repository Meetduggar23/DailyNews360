import { usePageMeta } from "@/hooks/usePageMeta";

export function PrivacyPage() {
  usePageMeta({
    title: "Privacy Policy",
    description: "How DailyNews360 stores and uses your data.",
  });
  return (
    <div className="container-news max-w-3xl py-12">
      <header className="mb-10 border-b-2 border-ink pb-6 dark:border-ink/80">
        <p className="font-sans text-xs font-bold uppercase tracking-widest text-accent">
          DailyNews360 — Policy
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 font-sans text-sm text-mist">Last updated: August 2026</p>
      </header>

      <div className="flex flex-col gap-8 font-serif text-[17px] leading-relaxed text-secondary">
        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">What data we store</h2>
          <p>
            DailyNews360 stores only the data required to operate the service:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong className="text-ink">Account</strong> — your name, email address and a
              securely hashed password.
            </li>
            <li>
              <strong className="text-ink">Bookmarks</strong> — stories you save, linked to your
              account.
            </li>
            <li>
              <strong className="text-ink">Preferences</strong> — the news categories you select
              for your feed.
            </li>
            <li>
              <strong className="text-ink">Reading history</strong> — the articles you open,
              along with their category and source, used to personalize your feed.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">Anonymous browsing</h2>
          <p>
            You can browse news without an account. Anonymous bookmarks and recent searches are
            stored only in your browser's local storage on this device and are never sent to our
            servers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">Local storage</h2>
          <p>
            We use your browser's local storage to remember your theme preference, recent
            searches, and bookmarks for signed-out visitors. You can clear this data at any time
            from Settings → Privacy → Clear local data.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">Third-party APIs</h2>
          <p>
            DailyNews360 fetches headlines from third-party news APIs. When you request news,
            our server queries those providers on your behalf. We do not sell, rent or share
            your personal data with these providers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">Your control</h2>
          <p>
            You can review and delete your reading history, change your interests, update your
            profile, or sign out at any time from Settings. To delete your account entirely,
            contact us through the channels listed on the site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-serif text-xl font-bold text-ink">Security</h2>
          <p>
            Passwords are hashed before storage and never kept in plain text. Sessions use
            signed, secure cookies. We apply standard HTTP security headers and rate limiting.
          </p>
        </section>

        <p className="text-xs text-mist/70">
          This page describes how the application currently behaves. It is not legal advice, and
          we only promise what we can actually enforce in this codebase.
        </p>
      </div>
    </div>
  );
}