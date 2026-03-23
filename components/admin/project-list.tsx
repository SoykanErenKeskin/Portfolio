"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProjectRecord } from "@/types/project";

type ProjectWithStatus = ProjectRecord & { publishStatus?: "DRAFT" | "PUBLISHED" };

export function AdminProjectList() {
  const [projects, setProjects] = useState<ProjectWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setProjects)
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-admin-violet/20 bg-admin-violet/5 px-4 py-6">
        <span className="h-2 w-2 animate-pulse rounded-full bg-admin-violet" />
        <p className="font-mono text-sm text-ink-muted">Loading projects…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border-2 border-red-400/30 bg-red-500/10 p-4 font-mono text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-admin-violet/30 bg-admin-violet/5 px-6 py-12 text-center">
        <p className="font-mono text-sm text-ink-muted">No projects yet.</p>
        <Link
          href="/admin/projects/new"
          className="mt-2 inline-flex rounded-lg bg-admin-violet/20 px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-admin-violet transition hover:bg-admin-violet/30"
        >
          Create your first project
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border-2 border-admin-violet/20 bg-surface-raised shadow-sm">
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr className="bg-admin-violet/10">
            <th className="px-4 py-3.5 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-admin-violet">
              Project
            </th>
            <th className="px-4 py-3.5 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-admin-violet">
              Status
            </th>
            <th className="px-4 py-3.5 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-admin-violet">
              Date
            </th>
            <th className="px-4 py-3.5 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-admin-violet">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {projects.map((p) => (
            <tr key={p.id} className="transition hover:bg-admin-violet/5">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="font-sans text-sm font-medium text-ink transition hover:text-admin-violet"
                >
                  {p.title.en || p.title.tr || p.slug || p.id}
                </Link>
                {p.featured && (
                  <span className="ml-2 rounded-md bg-admin-amber/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-admin-amber">
                    Featured
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                    p.publishStatus === "PUBLISHED"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {p.publishStatus === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">
                {p.date}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="rounded px-2 py-1 font-mono text-[11px] text-admin-violet transition hover:bg-admin-violet/15"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
