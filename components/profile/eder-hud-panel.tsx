import type { EderProfile } from "@/lib/profile/types";
import {
  formatOptionalText,
  formatProfileInstant,
  formatR2,
} from "@/lib/profile/format";
import { QuaroxCloudIcon } from "@/components/profile/icons/quarox-cloud-icon";
import { EderHouseIcon } from "@/components/profile/icons/eder-house-icon";

type Props = {
  eder: EderProfile;
};

export function EderHudPanel({ eder }: Props) {
  const r2Available = eder.globalR2 != null && Number.isFinite(eder.globalR2);
  const r2 = formatR2(eder.globalR2);

  return (
    <aside
      className="gp-cut gp-panel gp-panel-active relative overflow-hidden p-5 sm:p-6"
      aria-label="Eder live system panel"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgb(var(--gp-coral) / 0.5) 0, transparent 28%), radial-gradient(circle at 80% 70%, rgb(var(--gp-coral) / 0.35) 0, transparent 32%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="gp-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--gp-coral))]">
            Live system
          </p>
          <h2 className="mt-1 font-profile-sans text-2xl font-semibold tracking-tight text-[rgb(var(--gp-ink))] sm:text-3xl">
            {eder.projectName}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="gp-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gp-ink-muted))]">
            {eder.isActive ? "Active" : "Idle"}
          </span>
          <span
            className="gp-breathe inline-block h-2.5 w-2.5 rounded-full bg-[rgb(var(--gp-coral))] shadow-[0_0_12px_rgb(var(--gp-coral)/0.7)]"
            aria-hidden
          />
          <span className="sr-only">
            Project status: {eder.isActive ? "active" : "idle"}
          </span>
        </div>
      </div>

      <p className="relative mt-3 max-w-md text-sm leading-relaxed text-[rgb(var(--gp-ink-muted))]">
        {eder.description}
      </p>

      <div className="relative mt-6 flex min-h-[160px] items-center justify-center">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 320 160"
          aria-hidden
        >
          <line
            className="gp-flow-line"
            x1="60"
            y1="120"
            x2="160"
            y2="72"
            stroke="rgb(var(--gp-coral) / 0.45)"
            strokeWidth="1.25"
          />
          <line
            className="gp-flow-line"
            x1="260"
            y1="120"
            x2="160"
            y2="72"
            stroke="rgb(var(--gp-coral) / 0.45)"
            strokeWidth="1.25"
            style={{ animationDelay: "1.2s" }}
          />
          <line
            className="gp-flow-line"
            x1="160"
            y1="20"
            x2="160"
            y2="56"
            stroke="rgb(var(--gp-coral) / 0.35)"
            strokeWidth="1"
            style={{ animationDelay: "0.6s" }}
          />
        </svg>

        <div className="gp-drift absolute left-3 bottom-1 sm:left-8">
          <QuaroxCloudIcon className="opacity-90" title="Data node" />
        </div>
        <div
          className="gp-drift absolute right-3 bottom-1 sm:right-8"
          style={{ animationDelay: "1.4s" }}
        >
          <QuaroxCloudIcon className="opacity-90" title="Market node" />
        </div>
        <div className="relative z-[1] flex flex-col items-center">
          <EderHouseIcon size="lg" title="Eder central node" />
          <span className="gp-mono mt-2 text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gp-ink-faint))]">
            Central node
          </span>
        </div>
      </div>

      <dl className="relative mt-4 grid gap-3 border-t border-[rgb(var(--gp-border-subtle))] pt-4 sm:grid-cols-2">
        <div>
          <dt className="gp-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gp-ink-faint))]">
            Development status
          </dt>
          <dd className="mt-1 text-sm text-[rgb(var(--gp-ink))]">
            {formatOptionalText(eder.projectStatus, "Status unavailable")}
          </dd>
        </div>
        <div>
          <dt className="gp-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gp-ink-faint))]">
            Last meaningful update
          </dt>
          <dd className="mt-1 text-sm text-[rgb(var(--gp-ink))]">
            {formatProfileInstant(eder.latestMeaningfulUpdate)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="gp-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gp-ink-faint))]">
            Global model R²
          </dt>
          <dd
            className={
              r2Available
                ? "gp-mono mt-1 text-2xl font-semibold tabular-nums text-[rgb(var(--gp-coral))]"
                : "mt-1 text-sm font-medium text-[rgb(var(--gp-ink-muted))]"
            }
          >
            {r2}
          </dd>
        </div>
        <div>
          <dt className="gp-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gp-ink-faint))]">
            Snapshot updated
          </dt>
          <dd className="mt-1 text-sm text-[rgb(var(--gp-ink-muted))]">
            {formatProfileInstant(eder.snapshotUpdatedAt)}
          </dd>
        </div>
        <div>
          <dt className="gp-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gp-ink-faint))]">
            Scope
          </dt>
          <dd className="mt-1 text-sm text-[rgb(var(--gp-ink-muted))]">
            {formatOptionalText(eder.scope, "Scope unavailable")}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
