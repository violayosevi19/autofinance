"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SummaryCard from "@/components/SummaryCard";
import TransactionTable from "@/components/TransactionTable";
import BudgetAlert from "@/components/BudgetAlert";
import { getTransactions, getMonthSummary, deleteTransaction } from "@/lib/storage";
import { getBudgets } from "@/lib/budget";
import { useApp } from "@/context/AppContext";
import type { BudgetMap } from "@/lib/budget";
import type { Transaction, MonthSummary } from "@/lib/types";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const { t } = useApp();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [budgets] = useState<BudgetMap>(() => getBudgets());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getTransactions({ month, year }),
      getMonthSummary(month, year),
    ]).then(([txs, sum]) => {
      if (cancelled) return;
      setTransactions(txs);
      setSummary(sum);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [month, year]);

  async function handleDelete(id: string) {
    await deleteTransaction(id);
    const [txs, sum] = await Promise.all([
      getTransactions({ month, year }),
      getMonthSummary(month, year),
    ]);
    setTransactions(txs);
    setSummary(sum);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t.dashboard.title}</h1>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-3 py-1.5"
          >
            {t.months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-3 py-1.5"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400 dark:text-zinc-600">{t.dashboard.loading}</div>
      ) : (
        <>
          {summary && <BudgetAlert summary={summary} budgets={budgets} />}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label={t.dashboard.totalExpense}
              value={formatRupiah(summary?.totalDebit ?? 0)}
              sub={`${t.months[(month ?? 1) - 1]} ${year}`}
              variant="danger"
            />
            <SummaryCard
              label={t.dashboard.totalIncome}
              value={formatRupiah(summary?.totalCredit ?? 0)}
              sub={`${t.months[(month ?? 1) - 1]} ${year}`}
              variant="success"
            />
            <SummaryCard
              label={t.dashboard.totalTx}
              value={String(transactions.length)}
              sub={t.dashboard.txRecorded}
            />
          </div>

          {transactions.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center flex flex-col gap-3 items-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.dashboard.noData}</p>
              <div className="flex gap-3">
                <Link href="/import" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {t.dashboard.importMutation}
                </Link>
                <span className="text-zinc-300 dark:text-zinc-700">{t.dashboard.or}</span>
                <Link href="/parser" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {t.nav.quickParse}
                </Link>
              </div>
            </div>
          )}

          <TransactionTable transactions={transactions} onDelete={handleDelete} />
        </>
      )}
    </div>
  );
}
