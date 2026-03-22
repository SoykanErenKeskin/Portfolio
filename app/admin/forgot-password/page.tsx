"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { adminThemeLabels } from "@/components/admin/admin-theme-labels";

function BrandS() {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-xl bg-admin-violet/15 ring-1 ring-inset ring-admin-violet/20"
      aria-hidden
    >
      <span className="font-sans text-xl font-bold tracking-tighter text-admin-violet">
        S
      </span>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-12">
      <div className="relative w-full max-w-md px-4">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/admin/login"
            className="rounded-lg bg-admin-violet/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-admin-violet transition hover:bg-admin-violet/20"
          >
            ← Back to login
          </Link>
          <ThemeToggle labels={adminThemeLabels} />
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-admin-violet/15 bg-surface/80 shadow-xl shadow-admin-violet/5 ring-1 ring-inset ring-white/5 backdrop-blur-sm">
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-6">
              <BrandS />
            </div>
            <h1 className="font-sans text-xl font-semibold tracking-tight text-ink">
              Forgot password
            </h1>
            <p className="mt-4 font-mono text-[12px] text-ink-muted">
              Password reset is not configured for this setup. Contact the site administrator.
            </p>
            <Link
              href="/admin/login"
              className="mt-6 inline-block rounded-xl bg-admin-violet/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-admin-violet transition hover:bg-admin-violet/20"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
