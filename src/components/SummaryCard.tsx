"use client";

interface Props {
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "danger" | "success";
}

const VARIANTS = {
  default: "text-zinc-900 dark:text-zinc-100",
  danger: "text-red-500 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
};

export default function SummaryCard({ label, value, sub, variant = "default" }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-1">
      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold font-mono ${VARIANTS[variant]}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</span>}
    </div>
  );
}
