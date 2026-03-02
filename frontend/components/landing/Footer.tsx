import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
        <p className="text-slate-400 order-2 sm:order-1">
          VaultSlip • Built for teams who hate manual expenses.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 order-1 sm:order-2">
          <Link
            href="/pricing"
            className="min-h-[44px] flex items-center text-slate-300 hover:text-emerald-300 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="min-h-[44px] flex items-center text-slate-300 hover:text-emerald-300 transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
