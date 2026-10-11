import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { sampleExpenses, sampleMembers } from '../data/sample';
import type { Expense, Member, NewExpense } from '../types';

interface TripState {
  members: Member[];
  expenses: Expense[];
}

const initialState: TripState = { members: sampleMembers, expenses: sampleExpenses };

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    expenseAdded: {
      // `prepare` creates the id, so the reducer itself stays predictable.
      reducer(state, action: PayloadAction<Expense>) {
        state.expenses.unshift(action.payload);
      },
      prepare(expense: NewExpense) {
        return { payload: { id: makeId(), ...expense } };
      },
    },
    expenseDeleted(state, action: PayloadAction<string>) {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },
  },
});

export const { expenseAdded, expenseDeleted } = tripSlice.actions;
export default tripSlice.reducer;
