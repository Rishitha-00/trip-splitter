# Trip Splitter

Two-page expense splitter: React, Redux Toolkit, React Router, strict TypeScript, Vitest + React Testing Library.

## Run it

```
npm install
npm run dev        # open the printed URL
npm run typecheck  # tsc, zero errors
npm run lint       # ESLint + typescript-eslint
npm test           # Vitest
npm run build
```

**Not finished / known gaps:** none of the listed requirements are skipped. Only expenses are saved to localStorage (the five members are fixed). The delete dialog does not trap focus; it focuses "Keep it" on open.

## The paisa rule

Every share is rounded down. The leftover paise go one each to the **first people in the split**, in member-list order (the form always writes people in that order). So ₹100 between 3 = ₹33.34 + ₹33.33 + ₹33.33. One function (`allocate` in `src/logic/split.ts`) does this for equal and percent splits, so balances always add up to exactly ₹0. Percentages are handled as whole hundredths (33.33% = 3333) so there is no floating-point error.

## Three decisions

1. **Redux holds saved data, the form holds typing.** Members and expenses (plus the one-line "Expense added" message) are in Redux because several pages use them. Half-typed form text lives in `useState` inside the form, because nobody else needs it. Errors are not stored: `validateExpense` runs on every render and errors are only shown after the first Save click, so they update live and can never go stale.
2. **All rules are plain functions in `src/logic/`.** Parsing money, splitting, balances, validation and reading saved data have no React in them, so they are tested directly. Components only render and handle events. Data read from localStorage is checked field by field (`parse.ts`), so I never needed `any` or `as`.
3. **localStorage is written from the store, not from components.** `store/index.ts` subscribes to the store and saves whenever expenses change. Any component can add or delete without remembering to save. Unreadable or invalid saved data falls back to the sample data.

## With another day

- Trap focus inside the delete dialog and return focus to the row afterwards.
- Add "who pays whom" settle-up suggestions.
- Add an edit-expense screen and a test for localStorage loading and saving.

## AI use

(Edit this to be true for you.) I used an AI assistant to generate a first version of the project, then read through every file and ran the checks. I can explain each part, and I did not use AI for the live change in the follow-up.
