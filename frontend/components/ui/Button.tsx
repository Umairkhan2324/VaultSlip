"use client";
import * as React from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

const variantClasses: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30",
  secondary:
    "bg-white/90 text-slate-900 border border-emerald-200 hover:bg-emerald-50/80 backdrop-blur-sm",
  ghost: "bg-transparent text-slate-700 hover:bg-emerald-50/50",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    className || "",
  ].join(" ");
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

