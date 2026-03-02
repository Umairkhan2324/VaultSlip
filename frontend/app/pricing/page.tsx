import Pricing from "@/components/landing/Pricing";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="font-semibold shrink-0">VaultSlip</Link>
          <nav className="flex flex-wrap gap-3 sm:gap-4">
            <Link href="/sign-in" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">Sign in</Link>
            <Link href="/sign-up" className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">Sign up</Link>
          </nav>
        </div>
      </header>
      <Pricing />
    </div>
  );
}
