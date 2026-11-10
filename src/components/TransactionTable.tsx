"use client";

import type { Transaction } from "@/lib/types";
import { useApp } from "@/context/AppContext";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

interface Props {
  transactions: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  const { t } = useApp();

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-400 dark:text-zinc-600">
        {t.table.empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-left">
            <th className="px-4 py-3 font-medium">{t.table.date}</th>
            <th className="px-4 py-3 font-medium">{t.table.merchant}</th>
            <th className="px-4 py-3 font-medium">{t.table.category}</th>
            <th className="px-4 py-3 font-medium">{t.table.source}</th>
            <th className="px-4 py-3 font-medium text-right">{t.table.amount}</th>
            {(onEdit || onDelete) && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
            >
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                {formatDate(tx.date)}
              </td>
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">
                {tx.merchant}
              </td>
              <td className="px-4 py-3">
                <span className="inline-block rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {t.categories[tx.category] ?? tx.category}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                {t.sources[tx.source] ?? tx.source}
              </td>
              <td
                className={`px-4 py-3 text-right font-mono font-medium whitespace-nowrap ${
                  tx.type === "debit"
                    ? "text-red-500 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {tx.type === "debit" ? "-" : "+"}{formatRupiah(tx.amount)}
              </td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(tx)}
                        className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      >
                        {t.table.edit}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        {t.table.delete}
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
