import { configureStore } from '@reduxjs/toolkit';
import { sampleExpenses, sampleMembers } from '../data/sample';
import type { Expense } from '../types';
import tripReducer from './tripSlice';
import uiReducer from './uiSlice';

// A function (not a ready-made store) so each test can get a fresh store.
export function createAppStore(expenses: Expense[] = sampleExpenses) {
  return configureStore({
    reducer: { trip: tripReducer, ui: uiReducer },
    preloadedState: { trip: { members: sampleMembers, expenses } },
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
