"use client";
import { Alert } from "@/components/ui/Alert";
import { EditableReceiptCanvas, EditableReceiptCanvasProps } from "./EditableReceiptCanvas";
import Link from "next/link";

type ReceiptDetailClientProps = {
  initialReceipt: EditableReceiptCanvasProps & { needs_review?: boolean };
};

export function ReceiptDetailClient({ initialReceipt }: ReceiptDetailClientProps) {
  return (
    <div className="space-y-4">
      <Link href="/receipts" className="text-sm text-slate-500 hover:underline">
        Back to receipts
      </Link>
      {initialReceipt.needs_review && (
        <Alert variant="warning" title="This receipt needs review">
          Extraction confidence is low. You can retake a clearer photo from the{" "}
          <Link href="/dashboard" className="underline">
            dashboard
          </Link>
          .
        </Alert>
      )}
      <EditableReceiptCanvas {...initialReceipt} />
    </div>
  );
}
