"use client";

import { useEffect, useState } from "react";
import TransactionTable from "@/components/TransactionTable";
import TransactionForm from "@/components/TransactionForm";
import { getTransactions, deleteTransaction, updateTransaction } from "@/lib/storage";
import { exportToCSV } from "@/lib/export";
import { useApp } from "@/context/AppContext";
import type { Transaction, TransactionInput } from "@/lib/types";

export default function TransactionsPage() {
  const { t } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);

  const SOURCE_OPTIONS = [
    { value: "", label: t.transactions.allSources },
    { value: "bca", label: "BCA" }, { value: "mandiri", label: "Mandiri" },
    { value: "bri", label: "BRI" }, { value: "bsi", label: "BSI" },
    { value: "gopay", label: "GoPay" }, { value: "ovo", label: "OVO" },
    { value: "dana", label: "Dana" }, { value: "shopeepay", label: "ShopeePay" },
    { value: "seabank", label: "SeaBank" }, { value: "manual", label: t.sources.manual },
  ];

  const CATEGORY_OPTIONS = [
    { value: "", label: t.transactions.allCategories },
    ...Object.entries(t.categories).map(([v, label]) => ({ value: v, label })),
  ];

  useEffect(() => {
    let cancelled = false;
    getTransactions({ source: source || undefined, category: category || undefined })
      .then((txs) => {
        if (cancelled) return;
        setTransactions(txs);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [source, category]);

  async function reload() {
    const txs = await getTransactions({ source: source || undefined, category: category || undefined });
    setTransactions(txs);
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id);
    reload();
  }

  async function handleEdit(input: TransactionInput) {
    if (!editing) return;
    setSaving(true);
    await updateTransaction(editing.id, input);
    setSaving(false);
    setEditing(null);
    reload();
  }

  const selectClass = "text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-3 py-1.5";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t.transactions.title}</h1>
        <div className="flex gap-2 flex-wrap justify-end">
          <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
            {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => exportToCSV(transactions)}
            disabled={transactions.length === 0}
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.transactions.exportCsv}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400 dark:text-zinc-600">{t.transactions.loading}</div>
      ) : (
        <TransactionTable transactions={transactions} onEdit={(tx) => setEditing(tx)} onDelete={handleDelete} />
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-5">{t.transactions.editTitle}</h2>
            <TransactionForm initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} loading={saving} />
          </div>
        </div>
      )}
    </div>
  );
}
