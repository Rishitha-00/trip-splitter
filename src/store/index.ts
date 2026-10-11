import { createAppStore } from './createStore';
import { loadExpenses, saveExpenses } from './storage';

// The real app store. Saving lives here (not in components) so every change,
// from anywhere, is saved automatically.
export const store = createAppStore(loadExpenses());

let lastSaved = store.getState().trip.expenses;
store.subscribe(() => {
  const { expenses } = store.getState().trip;
  if (expenses !== lastSaved) {
    lastSaved = expenses;
    saveExpenses(expenses);
  }
});
