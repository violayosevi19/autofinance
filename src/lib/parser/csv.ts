import type { BankSource, ParseResult } from "../types";
import { buildTransaction, detectSource, parseAmount, parseDate } from "./utils";

function parseCSVLines(text: string): string[][] {
  return text
    .split("\n")
    .map((line) =>
      line
        .split(",")
        .map((cell) => cell.replace(/^"|"$/g, "").trim())
    )
    .filter((row) => row.some((c) => c));
}

function parseBCA(rows: string[][]): ParseResult["transactions"] {
  const transactions: ParseResult["transactions"] = [];
  for (const row of rows) {
    const date = parseDate(row[0] ?? "");
    if (!date) continue;
    const description = row[1] ?? "";
    const debitRaw = row[2] ?? "";
    const creditRaw = row[3] ?? "";
    const debit = parseAmount(debitRaw);
    const credit = parseAmount(creditRaw);
    if (debit > 0) transactions.push(buildTransaction(date, debit, "debit", description, description, "bca", row.join(",")));
    if (credit > 0) transactions.push(buildTransaction(date, credit, "credit", description, description, "bca", row.join(",")));
  }
  return transactions;
}

function parseMandiri(rows: string[][]): ParseResult["transactions"] {
  const transactions: ParseResult["transactions"] = [];
  for (const row of rows) {
    const date = parseDate(row[0] ?? "");
    if (!date) continue;
    const description = row[2] ?? "";
    const amount = parseAmount(row[3] ?? "");
    const typeRaw = (row[4] ?? "").toLowerCase();
    const type = typeRaw.includes("db") || typeRaw.includes("debet") ? "debit" : "credit";
    if (amount > 0) transactions.push(buildTransaction(date, amount, type, description, description, "mandiri", row.join(",")));
  }
  return transactions;
}

function parseBRI(rows: string[][]): ParseResult["transactions"] {
  const transactions: ParseResult["transactions"] = [];
  for (const row of rows) {
    const date = parseDate(row[0] ?? "");
    if (!date) continue;
    const description = row[1] ?? "";
    const debit = parseAmount(row[2] ?? "");
    const credit = parseAmount(row[3] ?? "");
    if (debit > 0) transactions.push(buildTransaction(date, debit, "debit", description, description, "bri", row.join(",")));
    if (credit > 0) transactions.push(buildTransaction(date, credit, "credit", description, description, "bri", row.join(",")));
  }
  return transactions;
}

function parseBSI(rows: string[][]): ParseResult["transactions"] {
  const transactions: ParseResult["transactions"] = [];
  for (const row of rows) {
    const date = parseDate(row[0] ?? "");
    if (!date) continue;
    const description = row[2] ?? "";
    const amount = parseAmount(row[3] ?? "");
    const typeRaw = (row[4] ?? "").toLowerCase();
    const type = typeRaw.includes("db") || typeRaw.includes("keluar") ? "debit" : "credit";
    if (amount > 0) transactions.push(buildTransaction(date, amount, type, description, description, "bsi", row.join(",")));
  }
  return transactions;
}

function parseEwallet(rows: string[][], source: BankSource): ParseResult["transactions"] {
  const transactions: ParseResult["transactions"] = [];
  for (const row of rows) {
    const date = parseDate(row[0] ?? "");
    if (!date) continue;
    const merchant = row[1] ?? "";
    const description = row[2] ?? merchant;
    const amount = parseAmount(row[3] ?? "");
    const typeRaw = (row[4] ?? "").toLowerCase();
    const type =
      typeRaw.includes("keluar") || typeRaw.includes("debit") || typeRaw.includes("bayar")
        ? "debit"
        : "credit";
    if (amount > 0) transactions.push(buildTransaction(date, amount, type, merchant, description, source, row.join(",")));
  }
  return transactions;
}

const HEADER_ROWS = 5;

export function parseCSV(text: string, filename: string): ParseResult {
  const source = detectSource(filename);
  const rows = parseCSVLines(text).slice(HEADER_ROWS);
  const errors: string[] = [];
  let transactions: ParseResult["transactions"] = [];

  try {
    if (source === "bca") transactions = parseBCA(rows);
    else if (source === "mandiri") transactions = parseMandiri(rows);
    else if (source === "bri") transactions = parseBRI(rows);
    else if (source === "bsi") transactions = parseBSI(rows);
    else if (["gopay", "ovo", "dana", "shopeepay", "seabank"].includes(source))
      transactions = parseEwallet(rows, source);
    else {
      errors.push(`Format bank tidak dikenali dari nama file: ${filename}. Rename file dengan nama bank (contoh: mutasi_bca.csv)`);
    }
  } catch (e) {
    errors.push(`Parse error: ${e instanceof Error ? e.message : String(e)}`);
  }

  return { success: errors.length === 0 && transactions.length > 0, transactions, errors, source };
}
