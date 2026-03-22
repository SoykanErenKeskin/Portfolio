import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { signOut } from "@/auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { adminThemeLabels } from "@/components/admin/admin-theme-labels";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-admin-violet/30 bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <Link
              href="/admin/dashboard"
              className="group flex min-w-0 flex-col"
            >
              <span className="truncate font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-admin-violet">
                Portfolio · Admin
              </span>
              <span className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                Content management
              </span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/en"
              className="rounded-lg bg-admin-violet/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-admin-violet transition hover:bg-admin-violet/20"
            >
              View site
            </Link>
            <ThemeToggle labels={adminThemeLabels} />
            <span className="hidden font-mono text-[10px] text-ink-faint sm:inline sm:max-w-[200px] sm:truncate">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-border-subtle bg-surface-raised px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted transition hover:border-admin-violet/50 hover:bg-admin-violet/10 hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-12">{children}</main>
    </>
  );
}
