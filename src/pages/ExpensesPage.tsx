import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { computeBalances } from '../logic/balances';
import { formatDate } from '../logic/dates';
import { formatINR } from '../logic/money';
import { describeSplit } from '../logic/split';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { expenseDeleted } from '../store/tripSlice';
import { clearNotice, setNotice } from '../store/uiSlice';
import { CATEGORIES } from '../types';
import type { Expense } from '../types';

function balanceText(paise: number): { text: string; tone: 'plus' | 'minus' | 'zero' } {
  if (paise > 0) return { text: `gets back ${formatINR(paise)}`, tone: 'plus' };
  if (paise < 0) return { text: `owes ${formatINR(-paise)}`, tone: 'minus' };
  return { text: 'settled up', tone: 'zero' };
}

export default function ExpensesPage() {
  const { members, expenses } = useAppSelector((state) => state.trip);
  const notice = useAppSelector((state) => state.ui.notice);
  const dispatch = useAppDispatch();

  const [filter, setFilter] = useState('All');
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  // Hide the "Expense added" message after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => dispatch(clearNotice()), 5000);
    return () => clearTimeout(timer);
  }, [notice, dispatch]);

  const balances = useMemo(() => computeBalances(members, expenses), [members, expenses]);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? 'Unknown';

  const visible = expenses
    .filter((e) => filter === 'All' || e.category === filter)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)); // newest first
  const visibleTotal = visible.reduce((sum, e) => sum + e.amount, 0);

  function confirmDelete() {
    if (!pendingDelete) return;
    dispatch(expenseDeleted(pendingDelete.id));
    dispatch(setNotice('Expense deleted.'));
    setPendingDelete(null);
  }

  return (
    <section>
      <h1>Expenses</h1>

      {notice && (
        <div role="status" className="notice">
          <span>{notice}</span>
          <button type="button" className="link-button" onClick={() => dispatch(clearNotice())}>
            Dismiss
          </button>
        </div>
      )}

      <h2>Balances</h2>
      <ul className="balances">
        {members.map((m) => {
          const { text, tone } = balanceText(balances[m.id] ?? 0);
          return (
            <li key={m.id} className={`balance ${tone}`}>
              <strong>{m.name}</strong>
              <span>{text}</span>
            </li>
          );
        })}
      </ul>

      <div className="toolbar">
        <h2>All expenses</h2>
        <div className="field inline">
          <label htmlFor="filter">Category</label>
          <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="empty">
          <p>No expenses yet. Add the first one to see who owes whom.</p>
          <Link to="/expenses/new" className="button primary">
            Add expense
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <p>No expenses in {filter}.</p>
          <button type="button" className="button" onClick={() => setFilter('All')}>
            Show all categories
          </button>
        </div>
      ) : (
        <>
          <p className="total">
            Total shown: <strong>{formatINR(visibleTotal)}</strong>
          </p>
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Trip expenses, newest first</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Description</th>
                  <th scope="col">Category</th>
                  <th scope="col">Paid by</th>
                  <th scope="col" className="num">
                    Amount
                  </th>
                  <th scope="col">Split</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => (
                  <tr key={e.id}>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.description}</td>
                    <td>{e.category}</td>
                    <td>{nameOf(e.paidBy)}</td>
                    <td className="num">{formatINR(e.amount)}</td>
                    <td>{describeSplit(e.split)}</td>
                    <td>
                      <button
                        type="button"
                        className="button danger small"
                        aria-label={`Delete ${e.description}`}
                        onClick={() => setPendingDelete(e)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pendingDelete && (
        <div className="overlay">
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="dialog">
            <h2 id="confirm-title">Delete this expense?</h2>
            <p>
              "{pendingDelete.description}" ({formatINR(pendingDelete.amount)}) will be removed and balances will update.
            </p>
            <div className="actions">
              <button type="button" className="button danger" onClick={confirmDelete}>
                Delete expense
              </button>
              <button type="button" className="button" autoFocus onClick={() => setPendingDelete(null)}>
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
