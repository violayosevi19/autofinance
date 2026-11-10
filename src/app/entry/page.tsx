"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TransactionForm from "@/components/TransactionForm";
import { addTransactions } from "@/lib/storage";
import { useApp } from "@/context/AppContext";
import type { TransactionInput } from "@/lib/types";

export default function EntryPage() {
  const { t } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(input: TransactionInput) {
    setLoading(true);
    await addTransactions([input]);
    setLoading(false);
    setDone(true);
  }

  const btnPrimary = "text-sm px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors";
  const btnSecondary = "text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors";

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-10 text-center flex flex-col gap-4 items-center">
        <p className="text-lg font-semibold text-green-700 dark:text-green-400">{t.entry.success}</p>
        <div className="flex gap-3">
          <button onClick={() => setDone(false)} className={btnSecondary}>{t.entry.addAgain}</button>
          <button onClick={() => router.push("/")} className={btnPrimary}>{t.entry.viewDashboard}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t.entry.title}</h1>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <TransactionForm onSubmit={handleSubmit} onCancel={() => router.back()} loading={loading} />
      </div>
    </div>
  );
}
