import type { Locale } from "@/types/locale";
import type { ProjectDataTable as ProjectDataTableType } from "@/types/project";

function computeMetricSpans(rows: { metric: string }[]): number[] {
  const spans: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const m = rows[i].metric;
    if (i === 0 || m !== rows[i - 1].metric) {
      let count = 1;
      while (i + count < rows.length && rows[i + count].metric === m) count++;
      spans.push(count);
    } else {
      spans.push(0);
    }
  }
  return spans;
}

export function ProjectDataTable({
  table,
  locale,
}: {
  table: ProjectDataTableType;
  locale: Locale;
}) {
  const title = table.title?.[locale];
  const metricSpans = computeMetricSpans(table.rows);
  const hasGroupHeader = table.columnGroups && table.columnGroups.length > 0;

  return (
    <section>
      {title && (
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {title}
        </h2>
      )}
      <div className="panel-edge overflow-x-auto bg-surface-raised">
        <table className="w-full min-w-[32rem] border-collapse font-mono text-[11px]">
          <thead>
            {hasGroupHeader && (
              <tr className="border-b border-border">
                <th
                  rowSpan={2}
                  className="bg-surface px-3 py-2.5 text-left font-medium uppercase tracking-wider text-ink-faint"
                >
                  Metric
                </th>
                <th
                  rowSpan={2}
                  className="border-l border-border bg-surface px-3 py-2.5 text-left font-medium uppercase tracking-wider text-ink-faint"
                >
                  Scenario
                </th>
                {table.columnGroups!.map((g) => (
                  <th
                    key={g.label}
                    colSpan={g.colspan}
                    className="whitespace-nowrap border-l border-border bg-surface px-3 py-2 text-center font-medium uppercase tracking-wider text-ink-faint"
                  >
                    {g.label}
                  </th>
                ))}
              </tr>
            )}
            <tr className="border-b border-border">
              {!hasGroupHeader && (
                <>
                  <th className="bg-surface px-3 py-2.5 text-left font-medium uppercase tracking-wider text-ink-faint">
                    Metric
                  </th>
                  <th className="bg-surface px-3 py-2.5 text-left font-medium uppercase tracking-wider text-ink-faint">
                    Scenario
                  </th>
                </>
              )}
              {table.columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap border-l border-border bg-surface px-3 py-2.5 text-center font-medium uppercase tracking-wider text-ink-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr
                key={`${row.metric}-${row.scenario}-${i}`}
                className="border-b border-border-subtle transition hover:bg-surface/60"
              >
                {metricSpans[i] > 0 && (
                  <td
                    rowSpan={metricSpans[i]}
                    className="px-3 py-2 align-middle text-ink-muted"
                  >
                    {row.metric}
                  </td>
                )}
                <td className="border-l border-border-subtle px-3 py-2 text-ink">
                  {row.scenario}
                </td>
                {row.values.map((val, j) => (
                  <td
                    key={j}
                    className="whitespace-nowrap border-l border-border-subtle px-3 py-2 text-right tabular-nums text-ink"
                  >
                    {String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
