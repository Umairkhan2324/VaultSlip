import { getServerSession } from "@/lib/session";
import { getReceipt } from "@/lib/api";
import { notFound } from "next/navigation";
import { ReceiptDetailClient } from "@/components/app/ReceiptDetailClient";

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { token } = await getServerSession();
  const receipt = (await getReceipt(token, id).catch(() => null)) as any;
  if (!receipt) notFound();

  return (
    <ReceiptDetailClient
      initialReceipt={{
        id,
        vendor: receipt.vendor,
        date: receipt.date,
        total: receipt.total,
        currency: receipt.currency,
        category: receipt.category,
        confidence: receipt.confidence,
        image_url: receipt.image_url,
        needs_review: receipt.needs_review,
        items: receipt.items || [],
      }}
    />
  );
}

