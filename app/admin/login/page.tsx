"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { adminThemeLabels } from "@/components/admin/admin-theme-labels";

function BrandS() {
  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-xl bg-admin-violet/15 ring-1 ring-inset ring-admin-violet/20"
      aria-hidden
    >
      <span className="font-sans text-2xl font-bold tracking-tighter text-admin-violet">
        S
      </span>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = ["Projects", "Profile", "Chatbot"];

  return (
    <div className="relative w-full max-w-3xl px-4">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-admin-violet/8 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-admin-violet/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 0h1v40H0V0zm1 0h1v40H1V0z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/en"
          className="rounded-lg bg-admin-violet/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-admin-violet transition hover:bg-admin-violet/20"
        >
          ← View site
        </Link>
        <ThemeToggle labels={adminThemeLabels} />
      </div>

      <div className="login-card-enter login-card-loop overflow-hidden rounded-2xl border-2 border-admin-violet/15 bg-surface/80 ring-1 ring-inset ring-white/5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row">
          {/* Left: branding */}
          <div className="relative flex flex-1 flex-col justify-between overflow-hidden px-6 py-6 sm:px-8 sm:py-8">
            <div
              className="login-dots-animate pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(139 92 246 / 0.4) 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10">
              <div className="mb-4">
                <BrandS />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-admin-violet">
                Portfolio · Admin
              </p>
              <h1 className="mt-2 font-sans text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                Sign in
              </h1>
              <p className="mt-2 font-mono text-[12px] leading-relaxed text-ink-muted">
                Access the content management dashboard to edit projects, profile, and chatbot settings.
              </p>
            </div>
            <div className="relative z-10 mt-6 border-t border-admin-violet/10 pt-6">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                Access includes
              </p>
              <div className="flex flex-wrap gap-2">
                {features.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-admin-violet/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-admin-violet"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col justify-center space-y-4 px-6 py-6 sm:px-8 sm:py-8"
          >
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Welcome back
            </p>
            <h2 className="mb-4 font-sans text-lg font-medium text-ink">
              Enter your credentials to continue
            </h2>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint transition focus:border-admin-violet/50"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint"
                >
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-admin-violet transition hover:text-admin-violet/80"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint transition focus:border-admin-violet/50"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 font-mono text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-admin-violet px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white shadow-lg shadow-admin-violet/25 transition hover:bg-admin-violet/90 hover:shadow-admin-violet/30 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-12">
      <Suspense
        fallback={
          <div className="h-64 w-full max-w-3xl animate-pulse rounded-2xl border border-border bg-surface-raised/50" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
