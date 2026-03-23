import Link from "next/link";
import { AdminProjectList } from "@/components/admin/project-list";

const iconClass = "h-12 w-12 shrink-0 text-admin-violet/70";

const NAV_CARDS = [
  {
    href: "/admin/profile",
    label: "Profile",
    desc: "Edit bio, social links, and contact info",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/admin/faq",
    label: "FAQ",
    desc: "Manage frequently asked questions",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/capability-map",
    label: "Capability map",
    desc: "Categories with labels and items",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    href: "/admin/learning-timeline",
    label: "Learning timeline",
    desc: "Tech/tools with year and level",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/tech-tools",
    label: "Tech & Tools",
    desc: "Master list of tech stacks and tools",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/chatbot",
    label: "Chatbot",
    desc: "Edit AI system prompt",
    icon: (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
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
            className="group relative flex h-full flex-row items-center gap-4 overflow-hidden rounded-xl border border-border bg-surface-raised p-5 transition duration-300 hover:scale-[1.02] hover:border-admin-violet/40 hover:shadow-[0_0_40px_-8px_rgba(139,92,246,0.4)] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-admin-violet before:opacity-0 before:content-[''] before:transition-opacity before:duration-300 hover:before:opacity-100 after:absolute after:right-0 after:top-0 after:h-full after:w-1 after:bg-admin-violet after:opacity-0 after:content-[''] after:transition-opacity after:duration-300 hover:after:opacity-100"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-admin-violet/10 transition-colors duration-300 group-hover:bg-admin-violet/20">
              {card.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-admin-violet">
                {card.label}
              </p>
              <p className="mt-2 font-sans text-sm text-ink-muted">
                {card.desc}
              </p>
            </div>
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
