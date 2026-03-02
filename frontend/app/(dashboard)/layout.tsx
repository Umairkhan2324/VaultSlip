import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { getMe } from "@/lib/api";
import { SessionProvider } from "@/contexts/SessionContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/receipts", label: "Receipts" },
  { href: "/chat", label: "Chat" },
  { href: "/settings", label: "Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token } = await getServerSession();
  if (!user || !token) redirect("/sign-in");
  const me = await getMe(token).catch(() => ({ plan: "free" as const }));

  return (
    <SessionProvider token={token} me={{ ...me, plan: me.plan ?? "free" }}>
      <div className="flex min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/30">
        <aside className="hidden w-64 flex-col bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 text-emerald-50 md:flex backdrop-blur-sm border-r border-emerald-700/50">
          <div className="px-6 pt-5 pb-4">
            <div className="text-sm font-semibold tracking-tight">VaultSlip</div>
            <p className="mt-1 text-xs text-slate-400">
              Smart receipts, cleaner books.
            </p>
          </div>
          <nav className="mt-2 flex flex-1 flex-col gap-1 px-3 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center rounded-xl px-3 py-2 text-emerald-100 hover:bg-emerald-800/60 transition-all"
              >
                <span className="mr-2 h-1 w-1 rounded-full bg-transparent group-hover:bg-emerald-400" />
                <span className="group-hover:text-white">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="px-6 py-4 text-xs text-emerald-200/80">
            Plan: <span className="font-medium text-emerald-100">{me.plan ?? "free"}</span>
          </div>
        </aside>
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
        {/* Mobile bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-emerald-800/60 bg-emerald-950/95 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-[44px] min-w-[44px] flex flex-1 flex-col items-center justify-center gap-0.5 text-xs text-emerald-100 hover:bg-emerald-800/60 hover:text-white active:bg-emerald-800"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </SessionProvider>
  );
}
