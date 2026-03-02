"use client";

// TEMP: plans disabled – always show feature content.
export default function TierGuard({
  children,
}: {
  feature: string;
  plan: string;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
