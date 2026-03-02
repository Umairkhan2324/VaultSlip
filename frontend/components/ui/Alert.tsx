"use client";
import * as React from "react";

type Variant = "info" | "success" | "warning" | "error";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  title?: string;
};

const baseClasses =
  "flex gap-2 rounded-xl border px-3 py-2 text-sm";

const variantClasses: Record<Variant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

const iconMap: Record<Variant, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "⛔",
};

export function Alert({
  variant = "info",
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    className || "",
  ].join(" ");
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={classes}
      {...props}
    >
      <span aria-hidden="true">{iconMap[variant]}</span>
      <div>
        {title && <p className="font-medium">{title}</p>}
        {children && <p className="text-xs sm:text-sm">{children}</p>}
      </div>
    </div>
  );
}

