import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function Hero() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 md:flex-row">
        <div className="flex-1 text-center md:text-left">
          <Badge variant="success" className="mb-4">
            New • AI-powered receipt engine
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-emerald-50">
            Expense reports that
            <span className="block text-emerald-300">write themselves.</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-emerald-100/90">
            Snap a photo, drop a folder, or forward your receipts. VaultSlip turns it all into
            clean, structured data your finance stack can trust.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Button className="px-7 py-3 text-base bg-emerald-400 text-emerald-950 hover:bg-emerald-300">
              <Link href="/sign-up">Start free</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-emerald-100/80">
            No credit card required • Unlimited receipts during beta
          </p>
        </div>

        {/* Animated preview card */}
        <div className="flex-1 w-full min-w-0 mt-6 md:mt-0">
          <div className="group mx-auto w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-950/90 via-emerald-900/70 to-slate-900/90 p-[1px] shadow-[0_24px_80px_rgba(6,95,70,0.9)] ring-1 ring-emerald-500/40 backdrop-blur-xl animate-float-up overflow-hidden">
            <div className="rounded-[1.3rem] bg-slate-950/90 p-4 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1.5deg]">
            <div className="flex items-center justify-between text-xs text-emerald-100/80">
              <span className="font-medium">Live upload</span>
              <span>Batch · 24 receipts</span>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-emerald-950/60 px-3 py-2">
                <div>
                  <div className="font-medium text-emerald-50">Starbucks</div>
                  <div className="text-emerald-100/80">Coffee & snacks</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-200">$18.40</div>
                  <div className="text-[10px] text-emerald-100/70">Today · Card •••• 4242</div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 px-3 py-2">
                <div className="text-emerald-100/90">Uber · Airport run</div>
                <div className="font-semibold text-emerald-200">$32.10</div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 px-3 py-2">
                <div className="text-emerald-100/90">Hotel · 3 nights</div>
                <div className="font-semibold text-emerald-200">$612.00</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-950/60 px-3 py-2 text-xs">
              <span className="text-emerald-100/80">AI summary</span>
              <span className="font-semibold text-emerald-200">3 categories · 100% synced</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
