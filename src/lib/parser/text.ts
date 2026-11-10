import type { BankSource, ParseResult } from "../types";
import { buildTransaction } from "./utils";

interface SmsPattern {
  source: BankSource;
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => ParseResult["transactions"][0] | null;
}

const PATTERNS: SmsPattern[] = [
  {
    source: "gopay",
    pattern: /GoPay[\s\S]*?(?:Pembayaran|Pembelian|Transfer)[\s\S]*?Rp\s?([\d.,]+)[\s\S]*?(?:ke|di|untuk)\s+([^\n.]+)/i,
    extract: (m) => {
      const amount = parseFloat(m[1].replace(/[.,]/g, ""));
      const merchant = m[2].trim();
      return buildTransaction(new Date(), amount, "debit", merchant, merchant, "gopay", m[0]);
    },
  },
  {
    source: "ovo",
    pattern: /OVO[\s\S]*?(?:Pembayaran|Bayar|Transfer)[\s\S]*?IDR\s?([\d.,]+)[\s\S]*?(?:ke|di|untuk|to)\s+([^\n.]+)/i,
    extract: (m) => {
      const amount = parseFloat(m[1].replace(/[.,]/g, ""));
      const merchant = m[2].trim();
      return buildTransaction(new Date(), amount, "debit", merchant, merchant, "ovo", m[0]);
    },
  },
  {
    source: "dana",
    pattern: /DANA[\s\S]*?(?:Pembayaran|Bayar|Transfer)[\s\S]*?Rp\s?([\d.,]+)[\s\S]*?(?:ke|di|untuk)\s+([^\n.]+)/i,
    extract: (m) => {
      const amount = parseFloat(m[1].replace(/[.,]/g, ""));
      const merchant = m[2].trim();
      return buildTransaction(new Date(), amount, "debit", merchant, merchant, "dana", m[0]);
    },
  },
  {
    source: "shopeepay",
    pattern: /ShopeePay[\s\S]*?(?:Pembayaran|Bayar)[\s\S]*?Rp\s?([\d.,]+)[\s\S]*?(?:ke|di|untuk)\s+([^\n.]+)/i,
    extract: (m) => {
      const amount = parseFloat(m[1].replace(/[.,]/g, ""));
      const merchant = m[2].trim();
      return buildTransaction(new Date(), amount, "debit", merchant, merchant, "shopeepay", m[0]);
    },
  },
  {
    source: "bca",
    pattern: /(?:Trx|Transaksi|Debet)[\s\S]*?Rp\s?([\d.,]+)[\s\S]*?(?:tgl|tanggal)\s+(\d{2}[/-]\d{2}[/-]\d{4})[\s\S]*?([^\n]+)/i,
    extract: (m) => {
      const amount = parseFloat(m[1].replace(/[.,]/g, ""));
      const date = new Date(m[2].split(/[/-]/).reverse().join("-"));
      const desc = m[3].trim();
      return buildTransaction(isNaN(date.getTime()) ? new Date() : date, amount, "debit", desc, desc, "bca", m[0]);
    },
  },
  {
    source: "mandiri",
    pattern: /(?:Mandiri|Livin)[\s\S]*?(?:Debet|Db|Transfer Keluar)[\s\S]*?Rp\s?([\d.,]+)[\s\S]*?(?:ke|kepada|untuk)\s+([^\n.]+)/i,
    extract: (m) => {
      const amount = parseFloat(m[1].replace(/[.,]/g, ""));
      const merchant = m[2].trim();
      return buildTransaction(new Date(), amount, "debit", merchant, merchant, "mandiri", m[0]);
    },
  },
  {
    source: "seabank",
    pattern: /SeaBank[\s\S]*?(?:Pembayaran|Transfer|Bayar)[\s\S]*?Rp\s?([\d.,]+)[\s\S]*?(?:ke|untuk)\s+([^\n.]+)/i,
    extract: (m) => {
      const amount = parseFloat(m[1].replace(/[.,]/g, ""));
      const merchant = m[2].trim();
      return buildTransaction(new Date(), amount, "debit", merchant, merchant, "seabank", m[0]);
    },
  },
];

export function parseText(rawText: string): ParseResult {
  const transactions: ParseResult["transactions"] = [];
  const errors: string[] = [];
  let detectedSource: BankSource = "unknown";

  const blocks = rawText.split(/\n{2,}/).filter((b) => b.trim());

  for (const block of blocks) {
    let matched = false;
    for (const p of PATTERNS) {
      const m = block.match(p.pattern);
      if (!m) continue;
      const t = p.extract(m);
      if (t) {
        transactions.push(t);
        detectedSource = p.source;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const amountMatch = block.match(/Rp\s?([\d.,]+)/i) ?? block.match(/IDR\s?([\d.,]+)/i);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(/[.,]/g, ""));
        const lines = block.split("\n").filter((l) => l.trim());
        const merchant = lines[0] ?? "Unknown";
        transactions.push(
          buildTransaction(new Date(), amount, "debit", merchant, block.slice(0, 100), "unknown", block)
        );
      } else {
        errors.push(`Blok tidak terbaca: "${block.slice(0, 60)}..."`);
      }
    }
  }

  return {
    success: transactions.length > 0,
    transactions,
    errors,
    source: detectedSource,
  };
}
