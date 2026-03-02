import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Pricing() {
  // For now, VaultSlip is completely free during beta. No tiers or limits.
  return (
    <section className="border-t border-slate-800 bg-slate-950 py-16" id="pricing">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Badge variant="success">Beta</Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
          All features. No limits. Free during beta.
        </h2>
        <p className="mt-2 text-sm text-slate-300/80">
          Upload as many receipts as you like, use AI chat, and export your data without worrying
          about plans or pricing. We’ll introduce tiers later once the product is battle‑tested.
        </p>
        <div className="mt-8 flex justify-center">
          <Card className="inline-block bg-slate-900/70 px-8 py-5 border-slate-700">
            <p className="text-sm text-slate-200">
              You’re on the <span className="font-semibold">Full Access</span> beta plan.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
