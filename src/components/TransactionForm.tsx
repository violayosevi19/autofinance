"use client";

import { useState } from "react";
import type { Transaction, TransactionInput, BankSource, Category, TransactionType } from "@/lib/types";
import { useApp } from "@/context/AppContext";

const CATEGORY_KEYS: Category[] = [
  "kuliner", "transportasi", "belanja", "tagihan", "transfer",
  "hiburan", "kesehatan", "pendidikan", "lainnya",
];

const SOURCE_KEYS: BankSource[] = [
  "manual", "bca", "mandiri", "bri", "bsi",
  "gopay", "ovo", "dana", "shopeepay", "seabank",
];

function toDateInput(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

function emptyForm(): TransactionInput {
  return {
    date: new Date(),
    amount: 0,
    type: "debit",
    merchant: "",
    description: "",
    category: "lainnya",
    source: "manual",
  };
}

interface Props {
  initial?: Transaction;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function TransactionForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { t } = useApp();
  const [form, setForm] = useState<TransactionInput>(
    initial
      ? {
          date: initial.date,
          amount: initial.amount,
          type: initial.type,
          merchant: initial.merchant,
          description: initial.description,
          category: initial.category,
          source: initial.source,
        }
      : emptyForm()
  );
  const [error, setError] = useState("");

  function set<K extends keyof TransactionInput>(key: K, value: TransactionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.merchant.trim()) return setError(t.form.errorMerchant);
    if (form.amount <= 0) return setError(t.form.errorAmount);
    setError("");
    await onSubmit(form);
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.form.date}</label>
          <input
            type="date"
            value={toDateInput(form.date)}
            onChange={(e) => set("date", new Date(e.target.value))}
            className={inputClass}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.form.type}</label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value as TransactionType)}
            className={inputClass}
          >
            <option value="debit">{t.form.debit}</option>
            <option value="credit">{t.form.credit}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.form.amount}</label>
          <input
            type="number"
            min={1}
            value={form.amount || ""}
            onChange={(e) => set("amount", Number(e.target.value))}
            placeholder="50000"
            className={inputClass}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.form.merchant}</label>
          <input
            type="text"
            value={form.merchant}
            onChange={(e) => set("merchant", e.target.value)}
            placeholder={t.form.merchantPlaceholder}
            className={inputClass}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.form.category}</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as Category)}
            className={inputClass}
          >
            {CATEGORY_KEYS.map((c) => (
              <option key={c} value={c}>{t.categories[c]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.form.source}</label>
          <select
            value={form.source}
            onChange={(e) => set("source", e.target.value as BankSource)}
            className={inputClass}
          >
            {SOURCE_KEYS.map((s) => (
              <option key={s} value={s}>{t.sources[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.form.description}</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={t.form.descriptionPlaceholder}
          className={inputClass}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {t.form.cancel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="text-sm px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-40"
        >
          {loading ? t.form.saving : initial ? t.form.saveEdit : t.form.addNew}
        </button>
      </div>
    </form>
  );
}
