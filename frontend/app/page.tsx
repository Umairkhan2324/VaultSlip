import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-slate-50">
      {/* Top hero band with layered gradient mesh */}
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900/95 via-slate-950/95 to-slate-950">
        <div className="pointer-events-none absolute inset-x-0 top-[-20%] h-[420px] bg-[radial-gradient(circle_at_10%_0,_rgba(52,211,153,0.5),_transparent_60%),radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.45),_transparent_55%),radial-gradient(circle_at_50%_120%,_rgba(16,185,129,0.55),_transparent_60%)] opacity-90" />
        <div className="relative">
          <header className="relative border-b border-emerald-800/60">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:py-4">
              <Link
                href="/"
                className="text-base font-semibold tracking-tight shrink-0 text-emerald-50 hover:text-emerald-200 transition-colors"
              >
                VaultSlip
              </Link>
              <nav className="flex items-center gap-2 sm:gap-3 text-sm">
                <Link
                  href="/sign-in"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-emerald-100/90 hover:text-white rounded-lg px-3"
                >
                  Sign in
                </Link>
                <Button className="min-h-[44px] bg-emerald-400 text-emerald-950 hover:bg-emerald-300 shrink-0 shadow-[0_10px_35px_rgba(16,185,129,0.55)] hover:-translate-y-0.5 transition-transform">
                  <Link href="/sign-up" className="block py-2 px-3">
                    Get started
                  </Link>
                </Button>
              </nav>
            </div>
          </header>
          <Hero />
        </div>
      </div>
      {/* Light themed body */}
      <HowItWorks />
      <Features />
      <section className="border-t border-slate-800/70 bg-slate-950/90 py-12 sm:py-16">
        <h2 className="mb-6 text-center text-xl sm:text-2xl font-semibold text-slate-50 px-4">
          FAQ
        </h2>
        <div className="mx-auto max-w-2xl space-y-4 px-4 sm:px-6 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/40">
            <h3 className="font-medium text-slate-50">
              What file types are supported?
            </h3>
            <p className="mt-1">
              For upload: JPG, JPEG, PNG, and PDF (max 1 MB per file). For bulk import: CSV and XLSX.
              You can upload up to 200 files per batch.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/40">
            <h3 className="font-medium text-slate-50">What does VaultSlip do?</h3>
            <p className="mt-1">
              VaultSlip is a receipt digitization and AI conversation system: upload receipts, get
              structured data (vendor, date, items, total), edit in a canvas view, and chat with AI
              over your expense data.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/40">
            <h3 className="font-medium text-slate-50">Is my data secure?</h3>
            <p className="mt-1">
              Yes. Data is stored in your organization and never shared. We use Supabase (auth, DB,
              storage) and Mistral for AI extraction and chat, with standard security practices and
              no secrets in the frontend.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
