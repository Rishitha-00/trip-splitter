import { formatINR, parsePercent, parseRupees } from './money';
describe('formatINR', () => {
  it('uses Indian digit grouping', () => {
    expect(formatINR(10000000)).toBe('₹1,00,000.00');
    expect(formatINR(2400000)).toBe('₹24,000.00');
    expect(formatINR(12345678900)).toBe('₹12,34,56,789.00');
  });
  it('always shows 2 decimals and handles small and negative values', () => {
    expect(formatINR(5)).toBe('₹0.05');
    expect(formatINR(125050)).toBe('₹1,250.50');
    expect(formatINR(-125050)).toBe('-₹1,250.50');
  });
});
describe('parseRupees', () => {
  it('converts rupees to paise', () => {
    expect(parseRupees('1250.50')).toEqual({ kind: 'ok', paise: 125050 });
    expect(parseRupees('10')).toEqual({ kind: 'ok', paise: 1000 });
    expect(parseRupees('0.5')).toEqual({ kind: 'ok', paise: 50 });
  });
  it('reports what is wrong', () => {
    expect(parseRupees('').kind).toBe('empty');
    expect(parseRupees('-5').kind).toBe('negative');
    expect(parseRupees('1.234').kind).toBe('too-many-decimals');
    expect(parseRupees('abc').kind).toBe('invalid');
  });
});

describe('parsePercent', () => {
  it('uses basis points', () => {
    expect(parsePercent('33.33')).toEqual({ kind: 'ok', basisPoints: 3333 });
    expect(parsePercent('abc').kind).toBe('invalid');
  });
});
