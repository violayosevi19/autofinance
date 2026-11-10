import type { Transaction } from "./types";

const CATEGORY_LABEL: Record<string, string> = {
  kuliner: "Kuliner",
  transportasi: "Transportasi",
  belanja: "Belanja",
  tagihan: "Tagihan",
  transfer: "Transfer",
  hiburan: "Hiburan",
  kesehatan: "Kesehatan",
  pendidikan: "Pendidikan",
  lainnya: "Lainnya",
};

function esc(val: string): string {
  if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
  return val;
}

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function exportToCSV(transactions: Transaction[], filename = "autofinance_export.csv"): void {
  const header = ["Tanggal", "Tipe", "Merchant", "Kategori", "Sumber", "Nominal", "Deskripsi"];
  const rows = transactions.map((t) => [
    fmtDate(t.date),
    t.type === "debit" ? "Pengeluaran" : "Pemasukan",
    t.merchant,
    CATEGORY_LABEL[t.category] ?? t.category,
    t.source.toUpperCase(),
    String(t.amount),
    t.description,
  ]);

  const csv = [header, ...rows].map((row) => row.map(esc).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
