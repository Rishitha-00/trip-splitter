import { CATEGORIES } from '../types';
import type { ExpenseFormValues, FormErrors, Member, NewExpense, Split } from '../types';
import { MAX_AMOUNT_PAISE, formatINR, parsePercent, parseRupees } from './money';
export const NO_ERRORS: FormErrors = { shares: {} };
export type ValidationResult = { ok: true; expense: NewExpense } | { ok: false; errors: FormErrors };
function validateAmount(raw: string): { paise: number | null; error?: string } {
  const result = parseRupees(raw);
  switch (result.kind) {
    case 'empty':
      return { paise: null, error: 'Amount is required' };
    case 'negative':
      return { paise: null, error: 'Amount must be more than ₹0' };
    case 'too-many-decimals':
      return { paise: null, error: 'Amount can have at most 2 decimals' };
    case 'invalid':
      return { paise: null, error: 'Enter a valid amount, like 1250.50' };
    case 'ok':
      if (result.paise <= 0) return { paise: null, error: 'Amount must be more than ₹0' };
      if (result.paise > MAX_AMOUNT_PAISE) return { paise: null, error: 'Amount cannot be more than ₹10,00,000' };
      return { paise: result.paise };
  }
}

interface SplitCheck {
  split: Split | null; // the clean split, or null if something is wrong
  error?: string; // problem with the split as a whole
  shares: Record<string, string>; // problems with single boxes
}

function validateSplit(values: ExpenseFormValues, members: Member[], amount: number | null): SplitCheck {
  if (values.splitType === 'equal') {
    const memberIds = members.filter((m) => values.equalIds.includes(m.id)).map((m) => m.id);
    if (memberIds.length === 0) return { split: null, error: 'Select at least one member', shares: {} };
    return { split: { type: 'equal', memberIds }, shares: {} };
  }

  if (values.splitType === 'exact') {
    const shares: Record<string, number> = {};
    const boxErrors: Record<string, string> = {};
    let total = 0;
    for (const member of members) {
      const result = parseRupees(values.exact[member.id] ?? '');
      if (result.kind === 'empty') continue; // an empty box counts as ₹0
      if (result.kind === 'ok') {
        if (result.paise > 0) shares[member.id] = result.paise;
        total += result.paise;
      } else if (result.kind === 'negative') {
        boxErrors[member.id] = 'Amount cannot be negative';
      } else if (result.kind === 'too-many-decimals') {
        boxErrors[member.id] = 'Use at most 2 decimals';
      } else {
        boxErrors[member.id] = 'Enter a valid amount';
      }
    }
    if (Object.keys(boxErrors).length > 0) return { split: null, shares: boxErrors };
    if (amount === null) return { split: null, shares: {} }; // amount error is already shown
    if (total !== amount) {
      const diff = amount - total;
      const error = diff > 0 ? `${formatINR(diff)} left to assign` : `${formatINR(-diff)} over the amount`;
      return { split: null, error, shares: {} };
    }
    return { split: { type: 'exact', shares }, shares: {} };
  }

  const shares: Record<string, number> = {};
  const boxErrors: Record<string, string> = {};
  let totalBasisPoints = 0;
  for (const member of members) {
    const result = parsePercent(values.percent[member.id] ?? '');
    if (result.kind === 'empty') continue;
    if (result.kind === 'ok' && result.basisPoints <= 10000) {
      if (result.basisPoints > 0) shares[member.id] = result.basisPoints / 100;
      totalBasisPoints += result.basisPoints;
    } else {
      boxErrors[member.id] = 'Enter 0 to 100, up to 2 decimals';
    }
  }
  if (Object.keys(boxErrors).length > 0) return { split: null, shares: boxErrors };
  if (totalBasisPoints !== 10000) {
    const error = `Percentages add up to ${(totalBasisPoints / 100).toFixed(2)}%, they must total 100%`;
    return { split: null, error, shares: {} };
  }
  return { split: { type: 'percent', shares }, shares: {} };
}

function hasErrors(errors: FormErrors): boolean {
  const { shares, ...fieldErrors } = errors;
  return Object.values(fieldErrors).some(Boolean) || Object.keys(shares).length > 0;
}

/** Checks the whole form. Returns the clean expense, or every error found. */
export function validateExpense(values: ExpenseFormValues, members: Member[], today: string): ValidationResult {
  const errors: FormErrors = { shares: {} };

  const description = values.description.trim();
  if (description === '') errors.description = 'Description is required';
  else if (description.length > 60) errors.description = 'Description must be 60 characters or fewer';

  const amount = validateAmount(values.amount);
  if (amount.error) errors.amount = amount.error;

  if (!members.some((m) => m.id === values.paidBy)) errors.paidBy = 'Choose who paid';

  if (values.date === '') errors.date = 'Date is required';
  else if (values.date > today) errors.date = 'Date cannot be in the future';

  const category = CATEGORIES.find((c) => c === values.category);
  if (!category) errors.category = 'Choose a category';

  const splitCheck = validateSplit(values, members, amount.paise);
  if (splitCheck.error) errors.split = splitCheck.error;
  errors.shares = splitCheck.shares;

  if (!hasErrors(errors) && amount.paise !== null && category && splitCheck.split) {
    return {
      ok: true,
      expense: {
        description,
        amount: amount.paise,
        paidBy: values.paidBy,
        date: values.date,
        category,
        split: splitCheck.split,
      },
    };
  }
  return { ok: false, errors };
}
