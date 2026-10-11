import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import SplitFields from '../components/SplitFields';
import { todayISO } from '../logic/dates';
import { NO_ERRORS, validateExpense } from '../logic/validation';
import { expenseAdded } from '../store/tripSlice';
import { setNotice } from '../store/uiSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { CATEGORIES } from '../types';
import type { ExpenseFormValues } from '../types';

export default function AddExpensePage() {
  const members = useAppSelector((state) => state.trip.members);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const today = todayISO();

  // The form's own text lives in component state (only saved expenses go to Redux).
  const [values, setValues] = useState<ExpenseFormValues>({
    description: '',
    amount: '',
    paidBy: '',
    date: today,
    category: '',
    splitType: 'equal',
    equalIds: members.map((m) => m.id),
    exact: {},
    percent: {},
  });
  const [submitted, setSubmitted] = useState(false);

  function update(patch: Partial<ExpenseFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  // Checked on every render. Errors are only SHOWN after the first Save click.
  const result = validateExpense(values, members, today);
  const errors = submitted && !result.ok ? result.errors : NO_ERRORS;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (result.ok) {
      dispatch(expenseAdded(result.expense));
      dispatch(setNotice('Expense added.'));
      navigate('/');
    }
  }

  return (
    <section>
      <h1>Add expense</h1>
      <form onSubmit={handleSubmit} noValidate className="card form">
        {submitted && !result.ok && (
          <p role="alert" className="form-alert">
            Some fields need attention. Fix the errors below and save again.
          </p>
        )}

        <Field id="description" label="Description" error={errors.description}>
          {(props) => (
            <input {...props} value={values.description} onChange={(e) => update({ description: e.target.value })} />
          )}
        </Field>

        <div className="row">
          <Field id="amount" label="Amount (₹)" error={errors.amount}>
            {(props) => (
              <input
                {...props}
                inputMode="decimal"
                placeholder="1250.50"
                value={values.amount}
                onChange={(e) => update({ amount: e.target.value })}
              />
            )}
          </Field>

          <Field id="paidBy" label="Paid by" error={errors.paidBy}>
            {(props) => (
              <select {...props} value={values.paidBy} onChange={(e) => update({ paidBy: e.target.value })}>
                <option value="">Choose a member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <div className="row">
          <Field id="date" label="Date" error={errors.date}>
            {(props) => (
              <input {...props} type="date" max={today} value={values.date} onChange={(e) => update({ date: e.target.value })} />
            )}
          </Field>

          <Field id="category" label="Category" error={errors.category}>
            {(props) => (
              <select {...props} value={values.category} onChange={(e) => update({ category: e.target.value })}>
                <option value="">Choose a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <SplitFields values={values} errors={errors} members={members} onChange={update} />

        <div className="actions">
          <button type="submit" className="button primary">
            Save expense
          </button>
          <Link to="/" className="button">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
