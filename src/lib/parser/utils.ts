import type { BankSource, ParseResult, TransactionInput, TransactionType } from "../types";
import { categorize } from "../categorize";

export function detectSource(filename: string): BankSource {
  const lower = filename.toLowerCase();
  if (lower.includes("bca")) return "bca";
  if (lower.includes("mandiri")) return "mandiri";
  if (lower.includes("bri")) return "bri";
  if (lower.includes("bsi")) return "bsi";
  if (lower.includes("gopay")) return "gopay";
  if (lower.includes("ovo")) return "ovo";
  if (lower.includes("dana")) return "dana";
  if (lower.includes("shopeepay") || lower.includes("spay")) return "shopeepay";
  if (lower.includes("seabank") || lower.includes("sea")) return "seabank";
  return "unknown";
}

export { categorize as guessCategory };

export function parseDate(raw: string): Date | null {
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{2})-(\d{2})-(\d{4})/,
    /(\d{2})\.(\d{2})\.(\d{4})/,
  ];

  for (const fmt of formats) {
    const m = raw.match(fmt);
    if (!m) continue;
    const [, a, b, c] = m;
    const d =
      fmt.source.startsWith("(\\d{4})")
        ? new Date(`${a}-${b}-${c}`)
        : new Date(`${c}-${b}-${a}`);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/[Rp.,\s]/g, "").replace(",", ".")) || 0;
}

export function buildTransaction(
  date: Date,
  amount: number,
  type: TransactionType,
  merchant: string,
  description: string,
  source: BankSource,
  rawText?: string
): TransactionInput {
  return {
    date,
    amount,
    type,
    merchant: merchant.trim(),
    description: description.trim(),
    category: categorize(merchant, description),
    source,
    rawText,
  };
}

export type { ParseResult };
