"use client";

import type { Category, MonthSummary } from "@/lib/types";
import type { BudgetMap } from "@/lib/budget";
import { useApp } from "@/context/AppContext";

const CATEGORIES = [
  "kuliner", "transportasi", "belanja", "tagihan", "transfer",
  "hiburan", "kesehatan", "pendidikan", "lainnya",
] as Category[];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

interface Props {
  summary: MonthSummary;
  budgets: BudgetMap;
}

export default function BudgetAlert({ summary, budgets }: Props) {
  const { t } = useApp();

  const alerts = CATEGORIES.flatMap((cat) => {
    const limit = budgets[cat];
    if (!limit) return [];
    const spent = summary.byCategory[cat] ?? 0;
    const pct = spent / limit;
    if (pct < 0.7) return [];
    return [{ cat, limit, spent, pct }];
  });

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map(({ cat, limit, spent, pct }) => {
        const over = pct >= 1;
        return (
          <div
            key={cat}
            className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-4 ${
              over
                ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20"
            }`}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className={`text-sm font-medium ${over ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>
                {over ? t.budgetAlert.over : t.budgetAlert.near} — {t.categories[cat]}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatRupiah(spent)} {t.budgetAlert.of} {formatRupiah(limit)} ({Math.round(pct * 100)}%)
              </span>
            </div>
            <div className="w-32 shrink-0">
              <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${over ? "bg-red-500" : "bg-amber-400"}`}
                  style={{ width: `${Math.min(pct * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
