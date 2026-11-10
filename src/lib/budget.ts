import type { Category } from "./types";

export type BudgetMap = Partial<Record<Category, number>>;

const KEY = "autofinance_budget";

export function getBudgets(): BudgetMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as BudgetMap;
  } catch {
    return {};
  }
}

export function saveBudgets(budgets: BudgetMap): void {
  localStorage.setItem(KEY, JSON.stringify(budgets));
}

export function setBudget(category: Category, amount: number): void {
  const current = getBudgets();
  if (amount <= 0) {
    delete current[category];
  } else {
    current[category] = amount;
  }
  saveBudgets(current);
}
