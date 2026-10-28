import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { logout } from "@/app/actions/auth";

const LINKS = [
  ["/admin", "Orders"],
  ["/admin/menu", "Menu"],
  ["/admin/events", "Events"],
  ["/admin/connectors", "Connectors"],
  ["/admin/settings", "Settings"],
] as const;

export async function AdminChrome({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-paper">
      <header className="flex flex-wrap items-center gap-4 border-b-4 border-ink bg-ink px-4 py-3 text-star">
        <Link href="/admin" className="display text-2xl text-aloha no-underline">
          Kitchen
        </Link>
        <nav className="flex flex-wrap gap-3 text-sm font-bold uppercase">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="text-star no-underline hover:text-aloha">
              {label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="ml-auto">
          <button className="btn text-sm" type="submit">
            Sign out
          </button>
        </form>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
