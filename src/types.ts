// All the shapes of data used in the app live here.
export const CATEGORIES = ['Food', 'Travel', 'Stay', 'Activities', 'Other'] as const;
export type Category = (typeof CATEGORIES)[number];
export interface Member {
  id: string;
  name: string;
}
// A "discriminated union": the `type` field tells us which shape we have.
export type Split =
  | { type: 'equal'; memberIds: string[] }
  | { type: 'exact'; shares: Record<string, number> } // paise per member
  | { type: 'percent'; shares: Record<string, number> }; // percent per member

export type SplitType = Split['type'];
export interface Expense {
  id: string;
  description: string;
  amount: number; // in paise (₹1,250.50 = 125050)
  paidBy: string; // member id
  date: string; // YYYY-MM-DD
  category: Category;
  split: Split;
}
// An expense before the app gives it an id.
export type NewExpense = Omit<Expense, 'id'>;
// What the form holds while the user types: everything is text.
export interface ExpenseFormValues {
  description: string;
  amount: string;
  paidBy: string;
  date: string;
  category: string;
  splitType: SplitType;
  equalIds: string[];
  exact: Record<string, string>; // member id -> typed rupees
  percent: Record<string, string>; // member id -> typed percent
}
export interface FormErrors {
  description?: string;
  amount?: string;
  paidBy?: string;
  date?: string;
  category?: string;
  split?: string; // problem with the split as a whole
  shares: Record<string, string>; // problem with one member's box
}
