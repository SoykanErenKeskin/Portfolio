import type { Locale } from "@/types/locale";
import type { TechnicalBlock as TechnicalBlockType } from "@/types/project";

export function TechnicalBlock({
  blocks,
  locale,
}: {
  blocks: TechnicalBlockType[];
  locale: Locale;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {blocks.map((block) => (
        <div
          key={block.key}
          className="panel-edge overflow-hidden bg-surface-raised p-4"
        >
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {block.label[locale]}
          </h3>
          <p className="font-sans text-sm leading-relaxed text-ink-muted">
            {block.content[locale]}
          </p>
        </div>
      ))}
    </div>
  );
}
