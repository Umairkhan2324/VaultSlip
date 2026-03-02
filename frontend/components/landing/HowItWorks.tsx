import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HowItWorks() {
  const steps = [
    {
      title: "Upload",
      emoji: "📸",
      desc: "Drag & drop receipts or capture them with your camera. Batch uploads are welcome.",
    },
    {
      title: "Extract",
      emoji: "✨",
      desc: "AI pulls out vendors, dates, line items, and totals with confidence scores.",
    },
    {
      title: "Analyze",
      emoji: "📊",
      desc: "Search, filter, export, or chat with your data to answer any question in seconds.",
    },
  ];
  return (
    <section className="border-t border-slate-800/70 bg-slate-950 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Badge variant="success">Three steps, zero spreadsheets</Badge>
        <h2 className="mt-4 text-xl sm:text-2xl font-semibold tracking-tight text-slate-50">
          How VaultSlip works
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          From messy paper to structured, searchable data—fully automated.
        </p>
      </div>
      <div className="mx-auto mt-8 sm:mt-10 grid max-w-4xl gap-4 sm:gap-6 px-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Card
            key={s.title}
            className="animate-float-up bg-slate-900/80 p-6 border border-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.9)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_26px_70px_rgba(15,23,42,1)]"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Step {i + 1}</span>
              <span aria-hidden="true">{s.emoji}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-50">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{s.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
