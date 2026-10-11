import { computeShares, describeSplit } from './split';
import type { Expense } from '../types';
const base = { id: 'x', description: 't', paidBy: 'a', date: '2026-01-01', category: 'Food' } as const;
const total = (shares: Record<string, number>) => Object.values(shares).reduce((s, n) => s + n, 0);
describe('computeShares', () => {
  it('splits ₹100 equally between 3 as 33.34 + 33.33 + 33.33', () => {
    const expense: Expense = { ...base, amount: 10000, split: { type: 'equal', memberIds: ['a', 'b', 'c'] } };
    expect(computeShares(expense)).toEqual({ a: 3334, b: 3333, c: 3333 });
  });
  it('never loses or invents a paisa (equal)', () => {
    for (const amount of [1, 2, 99, 10001, 149999]) {
      const expense: Expense = { ...base, amount, split: { type: 'equal', memberIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] } };
      expect(total(computeShares(expense))).toBe(amount);
    }
  });
  it('splits by percentage and still adds up exactly', () => {
    const expense: Expense = {
      ...base,
      amount: 149999,
      split: { type: 'percent', shares: { a: 33.33, b: 33.33, c: 33.34 } },
    };
    const shares = computeShares(expense);
    expect(total(shares)).toBe(149999);
    expect(shares).toEqual({ a: 49995, b: 49995, c: 50009 });
  });
  it('uses exact amounts as they are', () => {
    const expense: Expense = { ...base, amount: 300, split: { type: 'exact', shares: { a: 100, b: 200 } } };
    expect(computeShares(expense)).toEqual({ a: 100, b: 200 });
  });
});
describe('describeSplit', () => {
  it('describes each split type', () => {
    expect(describeSplit({ type: 'equal', memberIds: ['a', 'b', 'c', 'd'] })).toBe('Equally, 4 people');
    expect(describeSplit({ type: 'exact', shares: { a: 1 } })).toBe('Exact amounts, 1 person');
  });
});
