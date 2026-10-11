import type { Expense, Split } from '../types';

/*
 * PAISA RULE (used everywhere): every share is rounded down first. The paise
 * left over are handed out one each to the FIRST people in the split, in the
 * order they are listed (the form always lists people in member order).
 * Example: ₹100 between 3 people = ₹33.34 + ₹33.33 + ₹33.33.
 */
function allocate(amount: number, weights: [string, number][], totalWeight: number): Record<string, number> {
  const result: Record<string, number> = {};
  let assigned = 0;
  for (const [id, weight] of weights) {
    const share = Math.floor((amount * weight) / totalWeight);
    result[id] = share;
    assigned += share;
  }
  let leftover = amount - assigned;
  for (const [id] of weights) {
    if (leftover <= 0) break;
    result[id] += 1;
    leftover -= 1;
  }
  return result;
}

/** How many paise each member owes for one expense (member id -> paise). */
export function computeShares(expense: Expense): Record<string, number> {
  const { split, amount } = expense;
  switch (split.type) {
    case 'equal': {
      const weights = split.memberIds.map((id): [string, number] => [id, 1]);
      return weights.length === 0 ? {} : allocate(amount, weights, weights.length);
    }
    case 'exact':
      return { ...split.shares };
    case 'percent': {
      // 33.33% -> 3333 basis points, so 100% is always exactly 10000.
      const weights = Object.entries(split.shares).map(([id, pct]): [string, number] => [id, Math.round(pct * 100)]);
      return allocate(amount, weights, 10000);
    }
  }
}

/** Short text for the table, e.g. "Equally, 4 people". */
export function describeSplit(split: Split): string {
  const count = split.type === 'equal' ? split.memberIds.length : Object.keys(split.shares).length;
  const people = `${count} ${count === 1 ? 'person' : 'people'}`;
  if (split.type === 'equal') return `Equally, ${people}`;
  if (split.type === 'exact') return `Exact amounts, ${people}`;
  return `Percentages, ${people}`;
}
