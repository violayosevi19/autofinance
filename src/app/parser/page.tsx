"use client";

import { useState } from "react";
import Link from "next/link";
import TransactionTable from "@/components/TransactionTable";
import { parseText } from "@/lib/parser/text";
import { addTransactions } from "@/lib/storage";
import { useApp } from "@/context/AppContext";
import type { ParseResult, TransactionInput } from "@/lib/types";

type Step = "input" | "preview" | "done";

export default function ParserPage() {
  const { t } = useApp();
  const [text, setText] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const placeholder = `GoPay - Pembayaran berhasil\nRp 35.000 ke GoFood - McDonald's\n12/06/2026\n\nDANA Transfer Berhasil\nRp 150.000 untuk Tokopedia\n13/06/2026`;

  function handleParse() {
    if (!text.trim()) return;
    setResult(parseText(text));
    setStep("preview");
  }

  async function handleSave() {
    if (!result) return;
    setLoading(true);
    const saved = await addTransactions(result.transactions as TransactionInput[]);
    setSavedCount(saved.length);
    setStep("done");
    setLoading(false);
  }

  function reset() {
    setStep("input");
    setResult(null);
    setText("");
    setSavedCount(0);
  }

  const btnPrimary = "text-sm px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-40";
  const btnSecondary = "text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t.parser.title}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t.parser.subtitle}</p>
      </div>

      {step === "input" && (
        <div className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={12}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 font-mono"
          />
          <div className="flex justify-end">
            <button onClick={handleParse} disabled={!text.trim()} className={btnPrimary}>
              {t.parser.parse}
            </button>
          </div>
        </div>
      )}

      {step === "preview" && result && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.parser.found} <span className="font-bold">{result.transactions.length}</span> {t.parser.transactions}
              </p>
              {result.errors.length > 0 && (
                <p className="text-xs text-amber-500 mt-1">{result.errors.length} {t.parser.unread}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className={btnSecondary}>{t.parser.retry}</button>
              <button
                onClick={handleSave}
                disabled={loading || result.transactions.length === 0}
                className={btnPrimary}
              >
                {loading ? t.parser.saving : `${t.parser.save} ${result.transactions.length} ${t.parser.transactions}`}
              </button>
            </div>
          </div>

          {result.errors.length > 0 && (
            <details className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
              <summary className="cursor-pointer font-medium">{t.parser.viewErrors}</summary>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}

          <TransactionTable
            transactions={result.transactions.map((tx, i) => ({ ...tx, id: String(i), createdAt: new Date(), updatedAt: new Date() }))}
          />
        </div>
      )}

      {step === "done" && (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-10 text-center flex flex-col gap-4 items-center">
          <p className="text-lg font-semibold text-green-700 dark:text-green-400">
            {savedCount} {t.parser.success}
          </p>
          <div className="flex gap-3">
            <button onClick={reset} className={btnSecondary}>{t.parser.parseAgain}</button>
            <Link href="/" className={btnPrimary}>{t.parser.viewDashboard}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
