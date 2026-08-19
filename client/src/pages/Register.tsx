import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { BRAND } from "@/constants";
import { usePageMeta } from "@/hooks/usePageMeta";

export function RegisterPage() {
  usePageMeta({
    title: "Create an account",
    description: "Join DailyNews360 — Stay Informed. Stay Ahead.",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password);
      toast({ title: "Account created", description: "Welcome to DailyNews360!" });
      navigate("/for-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-news flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 border-b-2 border-ink pb-4 text-center dark:border-ink/80">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-accent">
            DailyNews360
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-wide text-ink">
            Join DailyNews360
          </h1>
          <p className="mt-2 font-serif text-base italic text-secondary">{BRAND.taglineAlternative}</p>
        </div>

        <form onSubmit={submit} className="border border-line bg-surface p-6">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-sm font-medium text-ink">Name</span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                minLength={2}
                autoComplete="name"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-sm font-medium text-ink">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-sm font-medium text-ink">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>

            {error && (
              <p role="alert" className="border border-accent/30 bg-accent/10 px-3 py-2 font-sans text-sm text-accent">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center font-sans text-sm text-mist">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}