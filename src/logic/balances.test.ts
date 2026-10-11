import { computeBalances } from './balances';
import { sampleExpenses, sampleMembers } from '../data/sample';
import type { Expense, Member } from '../types';

describe('computeBalances', () => {
  it('adds up to exactly zero for the sample data', () => {
    const balances = computeBalances(sampleMembers, sampleExpenses);
    expect(Object.values(balances).reduce((s, n) => s + n, 0)).toBe(0);
  });

  it('lets the payer sit outside the split', () => {
    const members: Member[] = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ];
    const groceries: Expense = {
      id: '1',
      description: 'Groceries',
      amount: 10000,
      paidBy: 'a',
      date: '2026-01-01',
      category: 'Food',
      split: { type: 'equal', memberIds: ['b', 'c'] },
    };
    expect(computeBalances(members, [groceries])).toEqual({ a: 10000, b: -5000, c: -5000 });
  });

  it('keeps the total at zero when paise do not divide evenly', () => {
    const members: Member[] = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ];
    const expense: Expense = {
      id: '1',
      description: 'Dinner',
      amount: 10000,
      paidBy: 'a',
      date: '2026-01-01',
      category: 'Food',
      split: { type: 'equal', memberIds: ['a', 'b', 'c'] },
    };
    const balances = computeBalances(members, [expense]);
    expect(balances).toEqual({ a: 6666, b: -3333, c: -3333 });
  });
});
