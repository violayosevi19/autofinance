export type BankSource =
  | "bca"
  | "mandiri"
  | "bri"
  | "bsi"
  | "gopay"
  | "ovo"
  | "dana"
  | "shopeepay"
  | "seabank"
  | "manual"
  | "unknown";

export type TransactionType = "debit" | "credit";

export type Category =
  | "kuliner"
  | "transportasi"
  | "belanja"
  | "tagihan"
  | "transfer"
  | "hiburan"
  | "kesehatan"
  | "pendidikan"
  | "lainnya";

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: TransactionType;
  merchant: string;
  description: string;
  category: Category;
  source: BankSource;
  rawText?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;

export interface MonthSummary {
  month: number;
  year: number;
  totalDebit: number;
  totalCredit: number;
  byCategory: Record<Category, number>;
}

export interface ParseResult {
  success: boolean;
  transactions: TransactionInput[];
  errors: string[];
  source: BankSource;
}
