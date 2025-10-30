"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SortValue = "new" | "old" | "top";

type SortControlsProps = {
  value: SortValue;
  onChange: (v: SortValue) => void;
  className?: string;
};

export function SortControls({ value, onChange, className }: SortControlsProps) {
  const baseBtn =
    "h-7 px-3 shadow-none border-0 text-xs font-medium transition-colors";
  const active =
    "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900";
  const inactive =
    "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60";

  const item = (v: SortValue, label: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={value === v}
      onClick={() => onChange(v)}
      className={cn(baseBtn, value === v ? active : inactive)}
    >
      {label}
    </Button>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900",
        className
      )}
      role="tablist"
      aria-label="Sort comments"
    >
      {item("new", "Newest")}
      {item("old", "Oldest")}
      {item("top", "Top")}
    </div>
  );
}


