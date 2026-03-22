import Link from "next/link";
import { AdminProjectList } from "@/components/admin/project-list";

const NAV_CARDS = [
  {
    href: "/admin/profile",
    label: "Profile",
    desc: "Edit bio, social links, and contact info",
  },
  {
    href: "/admin/faq",
    label: "FAQ",
    desc: "Manage frequently asked questions",
  },
  {
    href: "/admin/capability-map",
    label: "Capability map",
    desc: "Categories with labels (EN/TR) and items",
  },
  {
    href: "/admin/learning-timeline",
    label: "Learning timeline",
    desc: "Tech/tools with year and level",
  },
  {
    href: "/admin/chatbot",
    label: "Chatbot",
    desc: "Edit AI system prompt",
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <div>
      <header className="mb-10 overflow-hidden rounded-xl border border-admin-violet/20 bg-gradient-to-br from-admin-violet/5 via-admin-violet/10 to-admin-violet/5 px-6 py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-admin-violet">
          Admin
        </p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Welcome Soykan Eren Keskin
        </h1>
        <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
          Manage portfolio projects, profile, FAQ, and chatbot settings.
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {NAV_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-border bg-surface-raised p-5 transition hover:border-admin-violet/30 hover:bg-admin-violet/5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet">
              {card.label}
            </p>
            <p className="mt-2 font-sans text-sm text-ink-muted">
              {card.desc}
            </p>
          </Link>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet">
            Registry
          </p>
          <h2 className="mt-1 font-sans text-lg font-medium text-ink md:text-xl">
            Projects
          </h2>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-admin-violet px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-admin-violet/90 hover:shadow"
        >
          + New project
        </Link>
      </div>
      <AdminProjectList />
    </div>
  );
}
