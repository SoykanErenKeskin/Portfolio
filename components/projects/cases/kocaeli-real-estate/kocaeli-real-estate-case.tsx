import Link from "next/link";
import { ProjectCaseHeader } from "@/components/projects/detail/project-case-header";
import { ProjectMetaPanel } from "@/components/projects/detail/project-meta-panel";
import { RelatedProjects } from "@/components/projects/detail/related-projects";
import { CaseAccordion } from "@/components/projects/cases/shared/case-accordion";
import {
  DensityEmptyState,
  DensityHeatmap,
} from "@/components/projects/cases/kocaeli-real-estate/charts/density-heatmap";
import { CountyVolumeBars } from "@/components/projects/cases/kocaeli-real-estate/charts/county-volume-bars";
import { ListingGrowthCharts } from "@/components/projects/cases/kocaeli-real-estate/charts/listing-growth";
import { ExperimentTimeline } from "@/components/projects/cases/kocaeli-real-estate/charts/experiment-timeline";
import { PredictionBandFigure } from "@/components/projects/cases/kocaeli-real-estate/charts/prediction-band";
import { getAvailableScreenshots } from "@/components/projects/cases/kocaeli-real-estate/screenshots";
import { kocaeliCopy } from "@/content/cases/kocaeli-real-estate/copy";
import { isValidLink } from "@/lib/project-images";
import { withLocale } from "@/lib/paths";
import { validateDensityForChart } from "@/lib/kocaeli-real-estate/snapshot-schema";
import type { ResolvedKocaeliSnapshot } from "@/lib/kocaeli-real-estate/get-snapshot";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectRecord } from "@/types/project";

function fmtMetric(n: number, locale: Locale, digits = 3): string {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtInt(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);
}

function fmtPct(mape: number, locale: Locale): string {
  return `${fmtMetric(mape * 100, locale, 1)}%`;
}

export function KocaeliRealEstateCase({
  locale,
  messages: m,
  project: p,
  prevProject,
  nextProject,
  snapshot,
}: {
  locale: Locale;
  messages: Messages;
  project: ProjectRecord;
  prevProject: ProjectRecord | null;
  nextProject: ProjectRecord | null;
  snapshot: ResolvedKocaeliSnapshot;
}) {
  const data = snapshot.data;
  const densityCheck = validateDensityForChart(data);
  const screenshots = getAvailableScreenshots();
  const g = data.globalMetrics;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <ProjectCaseHeader locale={locale} messages={m} project={p} />

      <div className="mt-8 space-y-8">
        <ProjectMetaPanel locale={locale} messages={m} project={p} />

        {/* Data provenance badge */}
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          {snapshot.source === "live"
            ? `${m.kocaeliCase.liveSnapshot} · ${m.kocaeliCase.dataAsOf} ${snapshot.asOf}`
            : `${m.kocaeliCase.referenceData} · ${m.kocaeliCase.dataAsOf} ${snapshot.asOf}`}
          {" · "}
          {snapshot.snapshotVersion}
        </p>

        {/* Compact hero metrics */}
        <div className="panel-edge divide-y divide-border bg-surface-raised">
          <div className="grid gap-0 sm:grid-cols-3 sm:divide-x sm:divide-border">
            <MetricCell
              label={kocaeliCopy.metricGlobalR2[locale]}
              value={fmtMetric(g.r2, locale, 3)}
            />
            <MetricCell
              label={kocaeliCopy.metricGlobalMape[locale]}
              value={fmtPct(g.mape, locale)}
            />
            <MetricCell
              label={kocaeliCopy.metricSaleRental[locale]}
              value={`${fmtInt(data.dataset.saleTotal, locale)} + ${fmtInt(data.dataset.rentalTotal, locale)}`}
            />
          </div>
          <p className="px-4 py-3 font-sans text-[13px] leading-relaxed text-ink-muted">
            {kocaeliCopy.heroMetricsNote[locale]}
          </p>
        </div>

        {/* Outcomes */}
        <section>
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.outcomesTitle[locale]}
          </h2>
          <ul className="list-disc space-y-2 pl-5 font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
            {kocaeliCopy.outcomes.map((o, i) => (
              <li key={i}>{o[locale]}</li>
            ))}
          </ul>
          <div className="mt-4 border border-border-subtle bg-surface-raised/60 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              {kocaeliCopy.remainsHardTitle[locale]}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-sans text-[13px] text-ink-muted">
              {kocaeliCopy.remainsHard.map((o, i) => (
                <li key={i}>{o[locale]}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Density chart */}
        <section>
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.densityTitle[locale]}
          </h2>
          <p className="mb-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint">
            {kocaeliCopy.densityFigure[locale]}
          </p>
          {densityCheck.ok ? (
            <DensityHeatmap
              density={densityCheck.density}
              locale={locale}
              messages={m}
            />
          ) : (
            <DensityEmptyState locale={locale} messages={m} />
          )}
          {densityCheck.ok ? (
            <ul className="mt-4 list-disc space-y-1 pl-5 font-sans text-[13px] text-ink-muted">
              {kocaeliCopy.densityReadNotes.map((n, i) => (
                <li key={i}>{n[locale]}</li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* Problem */}
        <section>
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.problemTitle[locale]}
          </h2>
          <div className="space-y-3 font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
            {kocaeliCopy.problemBlocks.map((b, i) => (
              <p key={i} className="border-l border-border pl-3">
                {b[locale]}
              </p>
            ))}
          </div>
        </section>

        {/* System overview */}
        <section>
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.systemTitle[locale]}
          </h2>
          <p className="mb-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint">
            {kocaeliCopy.systemFigure[locale]}
          </p>
          <ol className="panel-edge divide-y divide-border bg-surface-raised">
            {kocaeliCopy.systemSteps.map((step, i) => (
              <li
                key={i}
                className="flex gap-3 px-4 py-2.5 font-mono text-[11px] text-ink"
              >
                <span className="shrink-0 text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step[locale]}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
            {kocaeliCopy.systemUserFlow[locale]}
          </p>
        </section>

        {/* Dataset */}
        <section>
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.datasetTitle[locale]}
          </h2>
          <p className="mb-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint">
            {kocaeliCopy.datasetFigure[locale]}
          </p>
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <CountyVolumeBars
              snapshot={data}
              locale={locale}
              messages={m}
            />
            <p className="font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
              {kocaeliCopy.datasetNarrative[locale]}
            </p>
          </div>
        </section>

        {/* Listing growth (optional block from snapshot) */}
        {data.listingGrowth ? (
          <section>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {kocaeliCopy.growthTitle[locale]}
            </h2>
            <ListingGrowthCharts
              growth={data.listingGrowth}
              locale={locale}
            />
          </section>
        ) : null}

        {/* Innovations */}
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.innovationsTitle[locale]}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="panel-edge bg-surface-raised p-4">
              <h3 className="font-mono text-[11px] text-ink">
                {kocaeliCopy.siteIdentityTitle[locale]}
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-4 font-sans text-[13px] text-ink-muted">
                {kocaeliCopy.siteIdentityBody.map((b, i) => (
                  <li key={i}>{b[locale]}</li>
                ))}
              </ul>
            </div>
            <div className="panel-edge bg-surface-raised p-4">
              <h3 className="font-mono text-[11px] text-ink">
                {kocaeliCopy.duplexTitle[locale]}
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-4 font-sans text-[13px] text-ink-muted">
                {kocaeliCopy.duplexBody.map((b, i) => (
                  <li key={i}>{b[locale]}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <CaseAccordion title={kocaeliCopy.siteIdentityFeaturesTitle[locale]}>
              <ul className="flex flex-wrap gap-2">
                {kocaeliCopy.siteIdentityFeatures.map((f) => (
                  <li
                    key={f}
                    className="border border-border px-2 py-1 font-mono text-[10px] text-ink-muted"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </CaseAccordion>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.timelineTitle[locale]}
          </h2>
          <p className="mb-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint">
            {kocaeliCopy.timelineFigure[locale]}
          </p>
          <div className="panel-edge bg-surface-raised px-4">
            <ExperimentTimeline locale={locale} />
          </div>
        </section>

        {/* Results */}
        <section>
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.resultsTitle[locale]}
          </h2>
          <p className="mb-4 font-sans text-sm text-ink-muted md:text-[15px]">
            {kocaeliCopy.resultsLead[locale]}
          </p>
          <div className="panel-edge divide-y divide-border bg-surface-raised font-mono text-[11px]">
            <ResultRow
              label={kocaeliCopy.resultLabels.experiment[locale]}
              value={data.model.experimentId}
            />
            <ResultRow
              label={kocaeliCopy.resultLabels.scope[locale]}
              value={data.model.scope}
            />
            <ResultRow label="R²" value={fmtMetric(g.r2, locale, 6)} />
            <ResultRow label="MAPE" value={fmtMetric(g.mape, locale, 6)} />
            <ResultRow
              label={kocaeliCopy.resultLabels.varianceRatio[locale]}
              value={fmtMetric(g.varianceRatio, locale, 6)}
            />
            <ResultRow
              label={kocaeliCopy.resultLabels.evaluationRows[locale]}
              value={fmtInt(g.evaluationRows, locale)}
            />
            <ResultRow
              label={kocaeliCopy.resultLabels.leakagePass[locale]}
              value={String(g.leakagePass)}
            />
            {data.audit ? (
              <ResultRow
                label={kocaeliCopy.resultLabels.severeMergeWarnings[locale]}
                value={String(data.audit.severeMergeWarnings)}
              />
            ) : null}
          </div>
          {data.referenceMetrics && data.deltaVsReference ? (
            <p className="mt-3 font-sans text-[13px] text-ink-muted">
              {kocaeliCopy.resultLabels.vsReference[locale]}{" "}
              {data.referenceMetrics.label ?? data.referenceMetrics.experimentId}
              : R² {data.deltaVsReference.r2 >= 0 ? "+" : ""}
              {fmtMetric(data.deltaVsReference.r2, locale, 5)}, MAPE{" "}
              {fmtMetric(data.deltaVsReference.mape, locale, 5)}
              {data.deltaVsReference.varianceRatioImproved
                ? `; ${kocaeliCopy.resultLabels.varianceImproved[locale]}`
                : ""}
            </p>
          ) : null}
          <div className="mt-4 space-y-2">
            {data.countyEvaluation && data.countyEvaluation.length > 0 ? (
              <CaseAccordion
                title={kocaeliCopy.resultLabels.countyResults[locale]}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[240px] text-left font-mono text-[11px]">
                    <thead>
                      <tr className="border-b border-border text-ink-faint">
                        <th className="py-2 pr-4 font-normal">
                          {kocaeliCopy.resultLabels.countyColumn[locale]}
                        </th>
                        <th className="py-2 pr-4 font-normal">R²</th>
                        <th className="py-2 font-normal">MAPE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.countyEvaluation.map((row) => (
                        <tr
                          key={row.county}
                          className="border-b border-border-subtle text-ink-muted"
                        >
                          <td className="py-2 pr-4 text-ink">{row.county}</td>
                          <td className="py-2 pr-4">
                            {fmtMetric(row.r2, locale, 6)}
                          </td>
                          <td className="py-2">
                            {fmtMetric(row.mape, locale, 6)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CaseAccordion>
            ) : null}
            {data.audit ? (
              <CaseAccordion title={kocaeliCopy.resultLabels.mergeAudit[locale]}>
                <p>
                  {kocaeliCopy.resultLabels.severeMergeWarnings[locale]}:{" "}
                  {data.audit.severeMergeWarnings}.{" "}
                  {kocaeliCopy.resultLabels.possibleBadMerges[locale]}:{" "}
                  {data.audit.possibleBadMerges}
                  {data.audit.possibleBadMerges > 0
                    ? ` (${kocaeliCopy.resultLabels.nonBlockingManualReview[locale]})`
                    : ""}
                  .
                </p>
              </CaseAccordion>
            ) : null}
          </div>
        </section>

        {/* Product band */}
        <section>
          <h2 className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.productBandTitle[locale]}
          </h2>
          <p className="mb-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint">
            {kocaeliCopy.productBandFigure[locale]}
          </p>
          <PredictionBandFigure locale={locale} messages={m} />
          <p className="mt-4 font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
            {kocaeliCopy.productBandNarrative[locale]}
          </p>
        </section>

        {/* Product proof: only when assets exist */}
        {screenshots.length > 0 ? (
          <section>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {kocaeliCopy.productProofTitle[locale]}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {screenshots.map((shot) => (
                <figure key={shot.id} className="panel-edge bg-surface-raised p-2">
                  <div className="border border-border bg-surface p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shot.src}
                      alt={shot.alt[locale]}
                      className="mx-auto max-h-64 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="mt-2 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    {shot.caption[locale]}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {/* Limitations */}
        <section>
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {kocaeliCopy.limitationsTitle[locale]}
          </h2>
          <ul className="mb-4 list-disc space-y-2 pl-5 font-sans text-sm text-ink-muted md:text-[15px]">
            {kocaeliCopy.limitations.map((l, i) => (
              <li key={i}>{l[locale]}</li>
            ))}
          </ul>
          <CaseAccordion title={kocaeliCopy.rejectedTitle[locale]}>
            <ul className="list-disc space-y-2 pl-4">
              {kocaeliCopy.rejectedItems.map((item, i) => (
                <li key={i}>{item[locale]}</li>
              ))}
            </ul>
          </CaseAccordion>
        </section>

        {/* Footer actions: repo only if project-specific URL */}
        <section className="flex flex-wrap gap-4 border-t border-border pt-6 font-mono text-[11px]">
          {isValidLink(p.links?.github) ? (
            <a
              href={p.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-ink-muted underline-offset-4 transition hover:text-accent hover:underline"
            >
              {m.kocaeliCase.viewRepository}
            </a>
          ) : null}
          <Link
            href={withLocale(locale, "/contact")}
            className="text-ink-muted underline-offset-4 transition hover:text-accent hover:underline"
          >
            {m.kocaeliCase.contact}
          </Link>
        </section>

        <RelatedProjects
          prev={prevProject}
          next={nextProject}
          locale={locale}
          messages={m}
        />
      </div>
    </article>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm text-ink">{value}</p>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
      <span className="text-ink-faint">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
