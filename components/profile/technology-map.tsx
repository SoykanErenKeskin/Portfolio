"use client";

import { useState } from "react";
import type { TechMapSpec } from "@/lib/profile/types";
import { cn } from "@/lib/utils";

type Props = {
  techMap: TechMapSpec;
};

export function TechnologyMap({ techMap }: Props) {
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  return (
    <section aria-labelledby="tech-map-heading">
      <header className="mb-6">
        <p className="gp-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--gp-coral))]">
          Stack
        </p>
        <h2
          id="tech-map-heading"
          className="mt-2 font-profile-sans text-2xl font-semibold tracking-tight text-[rgb(var(--gp-ink))] sm:text-3xl"
        >
          Technology Map
        </h2>
      </header>

      <div className="gp-cut gp-panel relative overflow-hidden p-5 sm:p-8">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <div className="gp-cut-sm relative z-[2] border border-[rgb(var(--gp-coral)/0.45)] bg-[rgb(var(--gp-bg-deep))] px-4 py-3 text-center shadow-[0_0_28px_-8px_rgb(var(--gp-coral)/0.4)]">
            <p className="gp-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[rgb(var(--gp-ink))]">
              {techMap.centerLabel}
            </p>
          </div>

          <svg
            className="pointer-events-none absolute left-1/2 top-10 hidden h-[220px] w-[90%] -translate-x-1/2 md:block"
            viewBox="0 0 600 220"
            aria-hidden
          >
            <line
              className="gp-flow-line"
              x1="300"
              y1="10"
              x2="120"
              y2="120"
              stroke="rgb(var(--gp-coral) / 0.35)"
              strokeWidth="1"
            />
            <line
              className="gp-flow-line"
              x1="300"
              y1="10"
              x2="300"
              y2="120"
              stroke="rgb(var(--gp-coral) / 0.35)"
              strokeWidth="1"
              style={{ animationDelay: "0.8s" }}
            />
            <line
              className="gp-flow-line"
              x1="300"
              y1="10"
              x2="480"
              y2="120"
              stroke="rgb(var(--gp-coral) / 0.35)"
              strokeWidth="1"
              style={{ animationDelay: "1.6s" }}
            />
          </svg>

          <ul className="relative z-[1] mt-10 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techMap.clusters.map((cluster, clusterIndex) => {
              const highlighted =
                activeCluster == null || activeCluster === cluster.id;
              return (
                <li key={cluster.id}>
                  <div
                    className={cn(
                      "gp-cut-sm border border-[rgb(var(--gp-border))] bg-[rgb(var(--gp-bg-raised)/0.65)] p-4 transition duration-300 motion-reduce:transition-none",
                      highlighted
                        ? "opacity-100"
                        : "opacity-40",
                      activeCluster === cluster.id &&
                        "border-[rgb(var(--gp-coral)/0.5)] shadow-[0_0_20px_-8px_rgb(var(--gp-coral)/0.45)]"
                    )}
                    onMouseEnter={() => setActiveCluster(cluster.id)}
                    onMouseLeave={() => setActiveCluster(null)}
                    onFocusCapture={() => setActiveCluster(cluster.id)}
                    onBlurCapture={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setActiveCluster(null);
                      }
                    }}
                  >
                    <p className="gp-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gp-coral))]">
                      {cluster.label}
                    </p>
                    <ul className="mt-3 flex flex-col gap-2">
                      {cluster.nodes.map((node, nodeIndex) => (
                        <li key={node.id}>
                          <button
                            type="button"
                            className="gp-focus gp-drift flex w-full items-center gap-3 border border-[rgb(var(--gp-border-subtle))] bg-[rgb(var(--gp-bg-deep)/0.7)] px-2.5 py-2 text-left transition hover:border-[rgb(var(--gp-coral)/0.4)]"
                            style={{
                              animationDelay: `${clusterIndex * 0.4 + nodeIndex * 0.35}s`,
                            }}
                          >
                            <span
                              className="gp-mono flex h-8 w-8 shrink-0 items-center justify-center border border-[rgb(var(--gp-coral)/0.35)] text-[10px] uppercase text-[rgb(var(--gp-coral))]"
                              aria-hidden
                            >
                              {node.mark}
                            </span>
                            <span className="text-sm text-[rgb(var(--gp-ink))]">
                              {node.label}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
