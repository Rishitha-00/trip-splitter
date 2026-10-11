// Money helpers. We store money as whole paise (integers) to avoid decimal bugs.

export const MAX_AMOUNT_PAISE = 100_000_000; // ₹10,00,000
export type RupeeParse =
  | { kind: 'ok'; paise: number }
  | { kind: 'empty' }
  | { kind: 'negative' }
  | { kind: 'too-many-decimals' }
  | { kind: 'invalid' };

/** Turns text like "1250.50" into paise (125050), or says what is wrong. */
export function parseRupees(raw: string): RupeeParse {
  const text = raw.trim().replace(/,/g, '');
  if (text === '') return { kind: 'empty' };
  if (/^-\d*\.?\d+$/.test(text)) return { kind: 'negative' };
  if (/^\d+\.\d{3,}$/.test(text)) return { kind: 'too-many-decimals' };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { kind: 'invalid' };
  const [rupees, decimals = ''] = text.split('.');
  return { kind: 'ok', paise: Number(rupees) * 100 + Number(decimals.padEnd(2, '0')) };
}

export type PercentParse =
  | { kind: 'ok'; basisPoints: number } // 33.33% = 3333 basis points
  | { kind: 'empty' }
  | { kind: 'invalid' };

/** Turns "33.33" into 3333 so we can add percentages without float errors. */
export function parsePercent(raw: string): PercentParse {
  const text = raw.trim();
  if (text === '') return { kind: 'empty' };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { kind: 'invalid' };
  return { kind: 'ok', basisPoints: Math.round(Number(text) * 100) };
}

/** 10000000 paise -> "₹1,00,000.00" (Indian digit grouping). */
export function formatINR(paise: number): string {
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  const rupees = String(Math.floor(abs / 100));
  const decimals = String(abs % 100).padStart(2, '0');
  let grouped = rupees;
  if (rupees.length > 3) {
    const lastThree = rupees.slice(-3);
    const rest = rupees.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    grouped = `${rest},${lastThree}`;
  }
  return `${sign}₹${grouped}.${decimals}`;
}
