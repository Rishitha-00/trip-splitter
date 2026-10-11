import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Holds the small "Expense added" message shown on the Expenses page.
interface UiState {
  notice: string | null;
}

const initialState: UiState = { notice: null };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setNotice(state, action: PayloadAction<string>) {
      state.notice = action.payload;
    },
    clearNotice(state) {
      state.notice = null;
    },
  },
});

export const { setNotice, clearNotice } = uiSlice.actions;
export default uiSlice.reducer;
