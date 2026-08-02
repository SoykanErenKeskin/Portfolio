import Link from "next/link";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { getProfileData } from "@/lib/profile/get-profile-data";
import type { ProfileSourceStatus } from "@/lib/profile/types";

const profileSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-profile-sans",
  display: "swap",
});

const profileMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-profile-mono",
  display: "swap",
});

export const metadata = {
  title: "GitHub Profile Preview",
};

function sourceBadgeClass(status: ProfileSourceStatus): string {
  if (status === "ok") {
    return "border-admin-teal/40 bg-admin-teal/10 text-admin-teal";
  }
  if (status === "error") {
    return "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400";
  }
  return "border-admin-amber/40 bg-admin-amber/10 text-admin-amber";
}

export default async function AdminGitHubProfilePage() {
  const data = await getProfileData();

  return (
    <div
      className={`${profileSans.variable} ${profileMono.variable} -mx-4 -my-10 md:-mx-4 md:-my-12`}
    >
      <div className="border-b border-border bg-surface px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet">
              Admin · Preview
            </p>
            <h1 className="mt-1 font-sans text-lg font-semibold text-ink">
              GitHub Profile Experience
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">
              Normalized live ProfileData via getProfileData(). Partial source
              failures use safe fallbacks — not Phase 1 mock metrics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${sourceBadgeClass(data.meta.sources.eder)}`}
            >
              Eder · {data.meta.sources.eder}
            </span>
            <span
              className={`inline-flex items-center border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${sourceBadgeClass(data.meta.sources.github)}`}
            >
              GitHub · {data.meta.sources.github}
            </span>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center border border-border bg-surface-raised px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition hover:border-admin-violet/40 hover:text-ink"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <ProfileExperience data={data} />
    </div>
  );
}
