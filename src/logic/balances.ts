import type { Expense, Member } from '../types';
import { computeShares } from './split';

/**
 * balance = what the member paid - their share of every expense.
 * Positive = gets money back. Negative = owes money. Values are in paise.
 */
export function computeBalances(members: Member[], expenses: Expense[]): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const member of members) balances[member.id] = 0;

  for (const expense of expenses) {
    balances[expense.paidBy] = (balances[expense.paidBy] ?? 0) + expense.amount;
    for (const [memberId, share] of Object.entries(computeShares(expense))) {
      balances[memberId] = (balances[memberId] ?? 0) - share;
    }
  }
  return balances;
}
