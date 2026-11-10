"use client";

import type { ParseResult } from "../types";
import { detectSource, parseAmount, parseDate, buildTransaction } from "./utils";

export async function parsePDF(file: File): Promise<ParseResult> {
  const source = detectSource(file.name);
  const transactions: ParseResult["transactions"] = [];
  const errors: string[] = [];

  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const allLines: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      allLines.push(...pageText.split(/\n+/).map((l) => l.trim()).filter(Boolean));
    }

    for (const line of allLines) {
      const date = parseDate(line);
      const amountMatch = line.match(/(?:Rp\.?\s?|IDR\s?)([\d.,]+)/i);
      if (!date || !amountMatch) continue;

      const amount = parseAmount(amountMatch[1]);
      if (amount <= 0) continue;

      const typeRaw = line.toLowerCase();
      const type =
        typeRaw.includes("debet") || typeRaw.includes("db") || typeRaw.includes("keluar")
          ? "debit"
          : "credit";

      const merchant = line.replace(/\d{2}[/-]\d{2}[/-]\d{4}/, "")
        .replace(/(?:Rp\.?\s?|IDR\s?)[\d.,]+/gi, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 60) || "Unknown";

      transactions.push(buildTransaction(date, amount, type, merchant, line, source, line));
    }

    if (transactions.length === 0) {
      errors.push("Tidak ada transaksi terbaca dari PDF. Pastikan PDF bukan hasil scan gambar.");
    }
  } catch (e) {
    errors.push(`PDF error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { success: transactions.length > 0, transactions, errors, source };
}
