import type {
  Transaction,
  TransactionInput,
  MonthSummary,
  Category,
} from "./types";

const DB_NAME = "autofinance";
const DB_VERSION = 1;
const STORE = "transactions";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("date", "date");
        store.createIndex("source", "source");
        store.createIndex("category", "category");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function serialize(t: Transaction): Transaction {
  return {
    ...t,
    date: new Date(t.date),
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  };
}

export async function addTransactions(
  inputs: TransactionInput[],
): Promise<Transaction[]> {
  const db = await openDB();
  const now = new Date();

  const transactions: Transaction[] = inputs.map((input) => ({
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }));

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    transactions.forEach((t) => store.put(t));
    tx.oncomplete = () => resolve(transactions);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getTransactions(filters?: {
  month?: number;
  year?: number;
  source?: string;
  category?: string;
}): Promise<Transaction[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();

    req.onsuccess = () => {
      let results: Transaction[] = req.result.map(serialize);

      if (filters?.month !== undefined && filters?.year !== undefined) {
        results = results.filter((t) => {
          const d = new Date(t.date);
          return (
            d.getMonth() + 1 === filters.month &&
            d.getFullYear() === filters.year
          );
        });
      }
      if (filters?.source)
        results = results.filter((t) => t.source === filters.source);
      if (filters?.category)
        results = results.filter((t) => t.category === filters.category);

      results.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      resolve(results);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function updateTransaction(
  id: string,
  patch: Partial<TransactionInput>,
): Promise<Transaction> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      if (!getReq.result)
        return reject(new Error(`Transaction ${id} not found`));
      const updated: Transaction = {
        ...getReq.result,
        ...patch,
        updatedAt: new Date(),
      };
      store.put(updated);
      tx.oncomplete = () => resolve(serialize(updated));
      tx.onerror = () => reject(tx.error);
    };
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMonthSummary(
  month: number,
  year: number,
): Promise<MonthSummary> {
  const transactions = await getTransactions({ month, year });

  const byCategory = {} as Record<Category, number>;
  let totalDebit = 0;
  let totalCredit = 0;

  for (const t of transactions) {
    if (t.type === "debit") totalDebit += t.amount;
    else totalCredit += t.amount;

    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  }

  return { month, year, totalDebit, totalCredit, byCategory };
}
