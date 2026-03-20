import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectRecord } from "@/types/project";

type MetaRow = { label: string; value: string };

export function ProjectMetaPanel({
  locale,
  messages: m,
  project: p,
}: {
  locale: Locale;
  messages: Messages;
  project: ProjectRecord;
}) {
  const year = p.date.slice(0, 4);
  const status = p.status?.[locale] ?? m.projectDetail.statusCompleted;

  const rows: MetaRow[] = [];
  if (p.domain) rows.push({ label: m.projectDetail.metaDomain, value: p.domain[locale] });
  if (p.focus) rows.push({ label: m.projectDetail.metaFocus, value: p.focus[locale] });
  rows.push({ label: m.projectDetail.metaStack, value: p.tech.join(", ") });
  if (p.tools.length > 0) rows.push({ label: m.projectDetail.metaTools, value: p.tools.join(", ") });
  rows.push({ label: m.projectDetail.metaStatus, value: status });
  rows.push({ label: m.projectDetail.metaYear, value: year });

  return (
    <div className="panel-edge overflow-hidden bg-surface-raised">
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex gap-4 px-4 py-3 sm:grid sm:grid-cols-[minmax(0,6rem)_1fr]"
          >
            <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              {row.label}
            </dt>
            <dd className="min-w-0 font-mono text-[11px] text-ink">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
