type ProjectSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function ProjectSection({ title, children }: ProjectSectionProps) {
  return (
    <section>
      <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        {title}
      </h2>
      <div className="font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
        {children}
      </div>
    </section>
  );
}
