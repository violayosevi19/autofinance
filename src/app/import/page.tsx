"use client";

import { useState } from "react";
import Link from "next/link";
import UploadZone from "@/components/UploadZone";
import TransactionTable from "@/components/TransactionTable";
import { parseCSV } from "@/lib/parser/csv";
import { parsePDF } from "@/lib/parser/pdf";
import { addTransactions } from "@/lib/storage";
import { useApp } from "@/context/AppContext";
import type { ParseResult, TransactionInput } from "@/lib/types";

type Step = "upload" | "preview" | "done";

export default function ImportPage() {
  const { t } = useApp();
  const [step, setStep] = useState<Step>("upload");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  async function handleFile(file: File) {
    setLoading(true);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const parsed = ext === "pdf"
      ? await parsePDF(file)
      : parseCSV(await file.text(), file.name);
    setResult(parsed);
    setStep("preview");
    setLoading(false);
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
    setStep("upload");
    setResult(null);
    setSavedCount(0);
  }

  const btnPrimary = "text-sm px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-40";
  const btnSecondary = "text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t.import.title}</h1>

      {step === "upload" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.import.hint} <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">mutasi_bca.csv</code>).
          </p>
          {loading ? (
            <div className="text-sm text-zinc-400 p-12 text-center">{t.import.processing}</div>
          ) : (
            <UploadZone accept=".csv,.pdf" label={t.import.uploadLabel} onFile={handleFile} />
          )}
          <div className="text-xs text-zinc-400 dark:text-zinc-600 space-y-1">
            <p>{t.import.supportedBank}</p>
            <p>{t.import.supportedEwallet}</p>
          </div>
        </div>
      )}

      {step === "preview" && result && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.import.found} <span className="font-bold">{result.transactions.length}</span> {t.import.transactions}
                {" "}{t.import.from} <span className="font-bold uppercase">{result.source}</span>
              </p>
              {result.errors.length > 0 && (
                <p className="text-xs text-amber-500 mt-1">{result.errors.length} {t.import.unread}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className={btnSecondary}>{t.import.cancel}</button>
              <button
                onClick={handleSave}
                disabled={loading || result.transactions.length === 0}
                className={btnPrimary}
              >
                {loading ? t.import.saving : `${t.import.save} ${result.transactions.length} ${t.import.transactions}`}
              </button>
            </div>
          </div>

          {result.errors.length > 0 && (
            <details className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
              <summary className="cursor-pointer font-medium">{t.import.viewErrors}</summary>
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
            {savedCount} {t.import.success}
          </p>
          <div className="flex gap-3">
            <button onClick={reset} className={btnSecondary}>{t.import.importAgain}</button>
            <Link href="/" className={btnPrimary}>{t.import.viewDashboard}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
