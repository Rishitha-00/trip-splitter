import sampleJson from './sample-data.json';
import { parseExpenses } from '../logic/parse';
import type { Expense, Member } from '../types';
export const sampleMembers: Member[] = sampleJson.members;
export const sampleExpenses: Expense[] = parseExpenses(sampleJson.expenses) ?? [];
