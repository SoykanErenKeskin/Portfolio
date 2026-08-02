import Image from "next/image";
import type { EderProfile, ProfileIdentity } from "@/lib/profile/types";
import { EderHudPanel } from "@/components/profile/eder-hud-panel";

type Props = {
  identity: ProfileIdentity;
  eder: EderProfile;
};

export function ProfileHero({ identity, eder }: Props) {
  return (
    <section aria-labelledby="profile-hero-heading" className="relative">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-40"
        aria-hidden
      >
        <svg className="h-full w-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
          {Array.from({ length: 18 }).map((_, i) => {
            const x = 40 + i * 52;
            const density = i / 17;
            return (
              <g key={i} opacity={0.15 + density * 0.55}>
                <line
                  className="gp-flow-line"
                  x1={x}
                  y1="20"
                  x2={x + 30 + density * 40}
                  y2="380"
                  stroke="rgb(var(--gp-coral))"
                  strokeWidth={0.6 + density * 0.8}
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="gp-cut gp-panel relative overflow-hidden">
        <Image
          src="/brand/thequarox-logo.png"
          alt=""
          width={280}
          height={48}
          className="pointer-events-none absolute bottom-4 right-4 w-36 rounded-2xl opacity-[0.06] sm:w-48"
          aria-hidden
        />

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:pr-8">
            <p className="gp-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--gp-ink-faint))]">
              Personal system
            </p>
            <h1
              id="profile-hero-heading"
              className="mt-4 max-w-xl font-profile-sans text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-tight text-[rgb(var(--gp-ink))]"
            >
              {identity.name}
            </h1>
            <p className="mt-4 max-w-md font-profile-sans text-base text-[rgb(var(--gp-ink-muted))] sm:text-lg">
              {identity.role}
            </p>
            <p className="mt-5 max-w-lg border-l border-[rgb(var(--gp-coral)/0.5)] pl-4 font-profile-sans text-lg font-medium leading-snug text-[rgb(var(--gp-ink))] sm:text-xl">
              {identity.statement}
            </p>
          </div>

          <div className="border-t border-[rgb(var(--gp-border-subtle))] p-4 sm:p-5 lg:border-l lg:border-t-0">
            <EderHudPanel eder={eder} />
          </div>
        </div>
      </div>
    </section>
  );
}
