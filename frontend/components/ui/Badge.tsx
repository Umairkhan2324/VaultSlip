"use client";
import * as React from "react";

type Variant = "default" | "success" | "warning" | "danger";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const baseClasses =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

const variantClasses: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-800",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    className || "",
  ].join(" ");
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

