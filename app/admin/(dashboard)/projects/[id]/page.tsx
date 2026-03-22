import { notFound } from "next/navigation";
import Link from "next/link";
import { ProjectForm } from "@/components/admin/project-form";
import { getProjectForAdmin } from "@/lib/db/projects";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProjectForAdmin(id);

  if (!result) notFound();

  const record = {
    ...result.record,
    publishStatus: result.status,
  };

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
          Admin · Edit
        </p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {record.title.en || record.title.tr || record.slug}
        </h1>
      </header>
      <ProjectForm projectId={result.id} initialData={record} />
    </div>
  );
}
