import Link from "next/link";
import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted transition hover:text-admin-violet"
        >
          ← Back to projects
        </Link>
      </div>
      <header className="mb-10 border-b border-border pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">
          Admin · New
        </p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          New project
        </h1>
      </header>
      <ProjectForm projectId={null} />
    </div>
  );
}
