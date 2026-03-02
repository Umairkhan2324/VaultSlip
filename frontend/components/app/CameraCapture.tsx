"use client";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type CameraCaptureProps = {
  onDone: (files: File[]) => void;
  onError?: (message: string) => void;
};

export default function CameraCapture({ onDone, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<File[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = "Camera not supported in this browser.";
        setError(msg);
        onError?.(msg);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Unable to access camera. Check permissions.";
        setError(msg);
        onError?.(msg);
      }
    }
    start();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onError]);

  async function handleCapture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );
    if (!blob) return;
    const file = new File([blob], `receipt-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    setCaptured((prev) => [...prev, file]);
  }

  function handleDone() {
    onDone(captured);
  }

  function handleCancel() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onDone([]);
  }

  return (
    <Card className="mb-4 p-4">
      <p className="mb-2 text-sm font-medium text-slate-900">Camera preview</p>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <video ref={videoRef} className="h-full w-full object-contain" playsInline muted />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Frame the full receipt and avoid glare or blur for best results.
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
        <span>{captured.length} photo(s) captured</span>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={handleCapture}>
            Capture
          </Button>
          <Button type="button" onClick={handleDone}>
            Done
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}

