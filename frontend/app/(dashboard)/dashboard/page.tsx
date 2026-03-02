import { getServerSession } from "@/lib/session";
import UploadZone from "@/components/app/UploadZone";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardPage() {
  await getServerSession();

  return (
    <div className="space-y-8">
      <header className="animate-float-up rounded-3xl border border-emerald-700/70 bg-gradient-to-r from-emerald-900/90 via-slate-950/95 to-emerald-900/90 px-5 py-6 shadow-[0_26px_70px_rgba(6,78,59,0.9)] backdrop-blur-xl">
        <div className="space-y-3">
          <Badge variant="success">Beta • VaultSlip workspace</Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-emerald-50">
            Turn receipts into clean data in seconds.
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-emerald-100/80">
            Drag in a stack of photos or snap them with your camera. VaultSlip extracts vendors,
            dates, line items, and totals automatically.
          </p>
        </div>
      </header>
      <Card className="p-6 sm:p-7 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 shadow-[0_22px_60px_rgba(15,23,42,0.95)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-medium text-slate-50">Upload receipts</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Drag & drop up to 200 images at once, or capture new ones with your camera.
            </p>
          </div>
          <p className="text-xs text-emerald-300/80">
            Tip: Mix photos and PDFs in a single batch — we&apos;ll handle the rest.
          </p>
        </div>
        <UploadZone />
      </Card>
    </div>
  );
}
