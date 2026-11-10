"use client";

import { useState } from "react";
import { getBudgets, saveBudgets } from "@/lib/budget";
import { useApp } from "@/context/AppContext";
import type { BudgetMap } from "@/lib/budget";
import type { Category } from "@/lib/types";

const CATEGORY_KEYS: Category[] = [
  "kuliner", "transportasi", "belanja", "tagihan", "transfer",
  "hiburan", "kesehatan", "pendidikan", "lainnya",
];

function toRaw(n: number): string {
  return n > 0 ? String(n) : "";
}

export default function BudgetPage() {
  const { t } = useApp();
  const [budgets, setBudgets] = useState<BudgetMap>(() => getBudgets());
  const [saved, setSaved] = useState(false);

  function handleChange(cat: Category, val: string) {
    const n = parseInt(val.replace(/\D/g, ""), 10);
    setBudgets((prev) => {
      const next = { ...prev };
      if (!val || isNaN(n) || n <= 0) delete next[cat];
      else next[cat] = n;
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    saveBudgets(budgets);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t.budget.title}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t.budget.subtitle}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
        {CATEGORY_KEYS.map((cat) => (
          <div key={cat} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t.categories[cat]}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{t.categoryDesc[cat]}</p>
            </div>
            <div className="relative w-44 shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={toRaw(budgets[cat] ?? 0)}
                onChange={(e) => handleChange(cat, e.target.value)}
                placeholder={t.budget.noLimit}
                className={`${inputClass} pl-8 text-right`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end items-center gap-4">
        {saved && <span className="text-sm text-green-600 dark:text-green-400">{t.budget.saved}</span>}
        <button
          onClick={handleSave}
          className="text-sm px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          {t.budget.save}
        </button>
      </div>
    </div>
  );
}
