import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { BRAND } from "@/constants";
import { usePageMeta } from "@/hooks/usePageMeta";

export function LoginPage() {
  usePageMeta({
    title: "Sign in",
    description: "Sign in to DailyNews360 — Stay Informed. Stay Ahead.",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      toast({ title: "Login successful", description: `Welcome back!` });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-news flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-3xl font-bold text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-mist">{BRAND.taglineAlternative}</p>
        </div>

        <form onSubmit={submit} className="rounded-xl bg-surface p-6 shadow-card">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Email</span>
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
              <span className="text-sm font-medium text-ink">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p role="alert" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">
                {error}
              </p>
            )}

            <Button type="submit" disabled={busy} className="w-full">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-mist">
          New to DailyNews360?{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  );
}