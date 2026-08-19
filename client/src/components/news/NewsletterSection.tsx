import * as React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { BRAND } from "@/constants";

/**
 * Newsletter / follow editorial block. A lightweight signup that stores the
 * subscription locally so the reader gets a confirmation without a backend.
 */
export function NewsletterSection() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(
    () => typeof window !== "undefined" && Boolean(window.localStorage.getItem("dn360:newsletter")),
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Check your email", description: "Please enter a valid email address." });
      return;
    }
    window.localStorage.setItem("dn360:newsletter", email);
    setSubscribed(true);
    toast({ title: "You're subscribed", description: "The morning briefing is on its way." });
  }

  return (
    <section className="mt-12 border-2 border-ink/80 p-6 dark:border-ink/60 md:p-8" aria-label="Newsletter">
      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wide text-ink">
          The Daily Briefing
        </h2>
      </div>
      <p className="mt-3 max-w-2xl font-serif text-[16px] leading-relaxed text-secondary">
        One thoughtful morning read. The day&rsquo;s biggest stories from every
        angle — delivered to your inbox, free. {BRAND.tagline}
      </p>
      {subscribed ? (
        <p className="mt-4 font-sans text-sm font-semibold text-accent">
          You&rsquo;re on the list. Your first briefing arrives tomorrow morning.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-10 flex-1 rounded-lg border border-line bg-surface px-3 font-sans text-sm text-ink placeholder:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <Button type="submit">Subscribe</Button>
        </form>
      )}
    </section>
  );
}