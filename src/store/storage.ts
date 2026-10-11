import { sampleExpenses } from '../data/sample';
import { parseExpenses } from '../logic/parse';
import type { Expense } from '../types';

const KEY = 'trip-splitter:expenses';

/** Saved expenses, or the sample data if nothing is saved / it is unreadable. */
export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return sampleExpenses;
    const parsed: unknown = JSON.parse(raw);
    return parseExpenses(parsed) ?? sampleExpenses;
  } catch {
    return sampleExpenses;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(expenses));
  } catch {
    // Storage can be full or blocked. The app still works for this visit.
  }
}
