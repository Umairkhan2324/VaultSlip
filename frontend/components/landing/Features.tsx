import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Features() {
  const features = [
    {
      title: "Accurate extraction",
      desc: "Vision models pull every line item and amount, with confidence built in.",
    },
    {
      title: "Batch processing",
      desc: "Upload hundreds of receipts at once; processing happens while you work.",
    },
    {
      title: "AI chat",
      desc: "Ask natural-language questions about vendors, categories, or trends.",
    },
  ];
  return (
    <section className="border-t border-slate-800/70 bg-slate-950 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Badge>Why teams pick VaultSlip</Badge>
        <h2 className="mt-4 text-xl sm:text-2xl font-semibold tracking-tight text-slate-50">
          Features that feel like magic
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Built to remove the boring parts of expense management, not just move them around.
        </p>
      </div>
      <div className="mx-auto mt-8 sm:mt-10 grid max-w-4xl gap-4 sm:gap-6 px-4 md:grid-cols-3">
        {features.map((f, i) => (
          <Card
            key={f.title}
            className="animate-float-up bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 border border-emerald-800/60 shadow-[0_18px_45px_rgba(6,78,59,0.85)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_26px_70px_rgba(5,46,32,0.95)]"
          >
            <div className="text-xs text-emerald-400/90">0{i + 1}</div>
            <h3 className="mt-3 text-lg font-semibold text-slate-50">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
