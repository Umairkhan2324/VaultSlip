"use client";
import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  const classes = [
    "rounded-2xl border border-slate-200 bg-white shadow-sm",
    className || "",
  ].join(" ");
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

