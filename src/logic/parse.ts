import { CATEGORIES } from '../types';
import type { Expense, Split } from '../types';
// Data from JSON / localStorage is "unknown". These functions check it
// piece by piece, so TypeScript can trust the result without `as` casts.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNumberMap(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every((n) => typeof n === 'number' && Number.isFinite(n));
}
function parseSplit(value: unknown): Split | null {
  if (!isRecord(value)) return null;
  const { type, memberIds, shares } = value;
  if (type === 'equal' && Array.isArray(memberIds) && memberIds.every((id): id is string => typeof id === 'string')) {
    return { type: 'equal', memberIds };
  }
  if ((type === 'exact' || type === 'percent') && isNumberMap(shares)) {
    return { type, shares };
  }
  return null;
}

function parseExpense(value: unknown): Expense | null {
  if (!isRecord(value)) return null;
  const { id, description, amount, paidBy, date, category } = value;
  const split = parseSplit(value.split);
  const knownCategory = CATEGORIES.find((c) => c === category);
  if (
    typeof id !== 'string' ||
    typeof description !== 'string' ||
    typeof amount !== 'number' ||
    !Number.isInteger(amount) ||
    typeof paidBy !== 'string' ||
    typeof date !== 'string' ||
    !knownCategory ||
    !split
  ) {
    return null;
  }
  return { id, description, amount, paidBy, date, category: knownCategory, split };
}

/** Returns the expenses if EVERY item is valid, otherwise null. */
export function parseExpenses(value: unknown): Expense[] | null {
  if (!Array.isArray(value)) return null;
  const expenses: Expense[] = [];
  for (const item of value) {
    const expense = parseExpense(item);
    if (!expense) return null;
    expenses.push(expense);
  }
  return expenses;
}
