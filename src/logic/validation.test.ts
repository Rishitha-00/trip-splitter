import { validateExpense } from './validation';
import { sampleMembers } from '../data/sample';
import type { ExpenseFormValues } from '../types';
const today = '2026-06-01';
const valid: ExpenseFormValues = {
  description: 'Dinner',
  amount: '1000',
  paidBy: 'm1',
  date: '2026-05-30',
  category: 'Food',
  splitType: 'equal',
  equalIds: ['m1', 'm2'],
  exact: {},
  percent: {},
};
const check = (patch: Partial<ExpenseFormValues>) => validateExpense({ ...valid, ...patch }, sampleMembers, today);
describe('validateExpense', () => {
  it('accepts a valid expense and converts the amount to paise', () => {
    const result = check({});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.expense.amount).toBe(100000);
  });

  it('checks description, amount, date and category rules', () => {
    const result = check({ description: ' ', amount: '-5', date: '2026-06-02', category: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.description).toBe('Description is required');
      expect(result.errors.amount).toBe('Amount must be more than ₹0');
      expect(result.errors.date).toBe('Date cannot be in the future');
      expect(result.errors.category).toBe('Choose a category');
    }
  });

  it('limits description length, decimals and maximum amount', () => {
    const r1 = check({ description: 'x'.repeat(61) });
    const r2 = check({ amount: '10.123' });
    const r3 = check({ amount: '1000000.01' });
    expect(!r1.ok && r1.errors.description).toBeTruthy();
    expect(!r2.ok && r2.errors.amount).toBe('Amount can have at most 2 decimals');
    expect(!r3.ok && r3.errors.amount).toBe('Amount cannot be more than ₹10,00,000');
    expect(check({ amount: '1000000' }).ok).toBe(true);
  });

  it('needs at least one member for an equal split', () => {
    const result = check({ equalIds: [] });
    expect(!result.ok && result.errors.split).toBe('Select at least one member');
  });

  it('shows how much is left to assign for exact amounts', () => {
    const result = check({ amount: '100', splitType: 'exact', exact: { m1: '50', m2: '37.50' } });
    expect(!result.ok && result.errors.split).toBe('₹12.50 left to assign');
  });

  it('shows how much is over for exact amounts', () => {
    const result = check({ amount: '100', splitType: 'exact', exact: { m1: '80', m2: '30' } });
    expect(!result.ok && result.errors.split).toBe('₹10.00 over the amount');
  });

  it('accepts exact amounts that match', () => {
    expect(check({ amount: '100', splitType: 'exact', exact: { m1: '60', m2: '40' } }).ok).toBe(true);
  });

  it('requires percentages to total exactly 100', () => {
    expect(check({ splitType: 'percent', percent: { m1: '60', m2: '30' } }).ok).toBe(false);
    expect(check({ splitType: 'percent', percent: { m1: '33.33', m2: '33.33', m3: '33.34' } }).ok).toBe(true);
    const bad = check({ splitType: 'percent', percent: { m1: '101', m2: '-1' } });
    expect(!bad.ok && bad.errors.shares.m1).toBeTruthy();
    expect(!bad.ok && bad.errors.shares.m2).toBeTruthy();
  });
});
