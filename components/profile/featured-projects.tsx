import Link from "next/link";
import type { FeaturedProject } from "@/lib/profile/types";
import { formatProfileInstant } from "@/lib/profile/format";
import { EderHouseIcon } from "@/components/profile/icons/eder-house-icon";
import { cn } from "@/lib/utils";

type Props = {
  projects: FeaturedProject[];
};

export function FeaturedProjects({ projects }: Props) {
  return (
    <section aria-labelledby="featured-projects-heading">
      <header className="mb-6">
        <p className="gp-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--gp-coral))]">
          Selected work
        </p>
        <h2
          id="featured-projects-heading"
          className="mt-2 font-profile-sans text-2xl font-semibold tracking-tight text-[rgb(var(--gp-ink))] sm:text-3xl"
        >
          Featured Projects
        </h2>
      </header>

      <ul className="grid gap-4">
        {projects.map((project) => (
          <li key={project.id}>
            <article
              className={cn(
                "gp-cut gp-panel p-5 sm:p-6",
                project.emphasized && "gp-panel-active"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {project.emphasized ? (
                    <EderHouseIcon size="sm" title="Eder" />
                  ) : null}
                  <h3 className="font-profile-sans text-xl font-semibold text-[rgb(var(--gp-ink))]">
                    {project.title}
                  </h3>
                </div>
                {project.status ? (
                  <p className="gp-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gp-coral))]">
                    {project.status}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="gp-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gp-ink-faint))]">
                    Problem
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--gp-ink-muted))]">
                    {project.problem}
                  </p>
                </div>
                <div>
                  <p className="gp-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gp-ink-faint))]">
                    Solution
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--gp-ink-muted))]">
                    {project.solution}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="gp-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gp-ink-faint))]">
                  Architecture
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {project.architecture.map((item) => (
                    <li
                      key={item}
                      className="gp-mono border border-[rgb(var(--gp-border))] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[rgb(var(--gp-ink-muted))]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {project.showMetric ? (
                <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[rgb(var(--gp-border-subtle))] pt-4">
                  <div>
                    <p className="gp-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gp-ink-faint))]">
                      Last meaningful update
                    </p>
                    <p className="mt-1 text-sm text-[rgb(var(--gp-ink-muted))]">
                      {formatProfileInstant(project.latestMeaningfulUpdate)}
                    </p>
                  </div>
                  <div className="gp-mono text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gp-ink-faint))]">
                      {project.metricLabel}
                    </p>
                    <p
                      className={
                        project.metricValue
                          ? "mt-1 text-2xl font-semibold tabular-nums text-[rgb(var(--gp-coral))]"
                          : "mt-1 text-sm font-medium text-[rgb(var(--gp-ink-muted))]"
                      }
                    >
                      {project.metricValue ?? "Metric unavailable"}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={project.viewProjectHref}
                  className="gp-focus gp-mono inline-flex border border-[rgb(var(--gp-coral)/0.55)] bg-[rgb(var(--gp-coral)/0.12)] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--gp-ink))] transition hover:bg-[rgb(var(--gp-coral)/0.22)]"
                >
                  View Project
                </Link>
                {project.sourceHref ? (
                  <Link
                    href={project.sourceHref}
                    className="gp-focus gp-mono inline-flex border border-[rgb(var(--gp-border))] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--gp-ink-muted))] transition hover:border-[rgb(var(--gp-coral)/0.4)] hover:text-[rgb(var(--gp-ink))]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source Code
                  </Link>
                ) : null}
                {project.technicalOverviewHref ? (
                  <Link
                    href={project.technicalOverviewHref}
                    className="gp-focus gp-mono inline-flex border border-[rgb(var(--gp-border))] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--gp-ink-muted))] transition hover:border-[rgb(var(--gp-coral)/0.4)] hover:text-[rgb(var(--gp-ink))]"
                  >
                    Technical Overview
                  </Link>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
