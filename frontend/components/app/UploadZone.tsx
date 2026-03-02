"use client";
import { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import { uploadReceipts, getBatch } from "@/lib/api";
import CameraCapture from "@/components/app/CameraCapture";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes for large batches

export default function UploadZone() {
  const { token } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle");
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);
  const router = useRouter();

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  async function handleUpload() {
    if (files.length === 0) return;
    setError("");
    setSkippedFiles([]);
    setStatus("uploading");
    try {
      const data = await uploadReceipts(token, files);
      if (Array.isArray(data?.skipped) && data.skipped.length > 0) {
        setSkippedFiles(
          data.skipped
            .map((s: { filename?: string }) => s.filename)
            .filter((name: unknown): name is string => typeof name === "string" && !!name)
        );
      }
      setStatus("processing");
      const batchId = data.batch_id;
      const start = Date.now();
      pollTimeoutRef.current = setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setStatus("idle");
        setError("Processing is taking longer than expected. Check the receipts page for results.");
      }, POLL_TIMEOUT_MS);
      intervalRef.current = setInterval(async () => {
        try {
          if (Date.now() - start >= POLL_TIMEOUT_MS) return;
          const batch = await getBatch(token, batchId);
          if (batch.status === "done" || batch.status === "partial") {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
            setStatus("done");
            setFiles([]);
            const processed = batch.processed ?? 0;
            const failed = batch.failed ?? 0;
            if (failed > 0) {
              const params = new URLSearchParams({ partial: "1", processed: String(processed), failed: String(failed) });
              const reason = (batch as { failure_reason?: string }).failure_reason;
              if (reason) params.set("reason", reason);
              router.push(`/receipts?${params.toString()}`);
            } else {
              router.push("/receipts");
            }
            router.refresh();
          }
        } catch (e) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
          pollTimeoutRef.current = null;
          setStatus("idle");
          setError(
            e instanceof Error
              ? e.message
              : "Unable to check upload status. Please try again."
          );
        }
      }, POLL_INTERVAL_MS);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-4">
      {showCamera && (
        <CameraCapture
          onDone={(captured) => {
            if (captured.length) {
              setFiles((prev) => [...prev, ...captured]);
              setError("");
            }
            setShowCamera(false);
          }}
          onError={(msg) => {
            setCameraError(msg);
            setShowCamera(false);
          }}
        />
      )}
      <div
        {...getRootProps()}
        className={[
          "flex min-h-[140px] sm:min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 sm:px-6 sm:py-10 text-center transition-colors touch-manipulation",
          isDragActive
            ? "border-emerald-500 bg-emerald-50/80 shadow-lg shadow-emerald-500/20"
            : "border-emerald-300 bg-emerald-50/40 hover:border-emerald-400 backdrop-blur-sm",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-slate-800">
          {isDragActive ? "Drop files here" : "Drag & drop receipt images or PDFs, or tap to select"}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          JPG, PNG, PDF • up to 1MB each • {files.length} file(s) selected
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={status !== "idle" || files.length === 0}
          className="min-h-[44px]"
        >
          {status === "uploading"
            ? "Uploading…"
            : status === "processing"
            ? "Processing in background…"
            : "Upload"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setCameraError("");
            setShowCamera(true);
          }}
          className="min-h-[44px]"
        >
          Use camera
        </Button>
      </div>
      {cameraError && (
        <Alert variant="warning" title="Camera issue">
          {cameraError}
        </Alert>
      )}
      {skippedFiles.length > 0 && (
        <Alert variant="warning" title="Some files were skipped">
          These files do not look like receipts: {skippedFiles.join(", ")}.
        </Alert>
      )}
      {error && (
        <Alert variant="error" title="Upload problem">
          {error}
        </Alert>
      )}
    </div>
  );
}
