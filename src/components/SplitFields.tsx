import Field from './Field';
import { formatINR, parsePercent, parseRupees } from '../logic/money';
import type { ExpenseFormValues, FormErrors, Member, SplitType } from '../types';

const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
  { value: 'equal', label: 'Equally' },
  { value: 'exact', label: 'Exact amounts' },
  { value: 'percent', label: 'Percentages' },
];

interface Props {
  values: ExpenseFormValues;
  errors: FormErrors;
  members: Member[];
  onChange: (patch: Partial<ExpenseFormValues>) => void;
}

export default function SplitFields({ values, errors, members, onChange }: Props) {
  function toggleMember(id: string) {
    const equalIds = values.equalIds.includes(id) ? values.equalIds.filter((x) => x !== id) : [...values.equalIds, id];
    onChange({ equalIds });
  }

  // Live helper text under the boxes (errors only appear after Save).
  const assignedPaise = members.reduce((sum, m) => {
    const r = parseRupees(values.exact[m.id] ?? '');
    return r.kind === 'ok' ? sum + r.paise : sum;
  }, 0);
  const assignedBasisPoints = members.reduce((sum, m) => {
    const r = parsePercent(values.percent[m.id] ?? '');
    return r.kind === 'ok' ? sum + r.basisPoints : sum;
  }, 0);

  return (
    <fieldset className="split">
      <legend>Split</legend>

      <div className="radio-row">
        {SPLIT_OPTIONS.map((option) => (
          <label key={option.value} className="choice">
            <input
              type="radio"
              name="splitType"
              checked={values.splitType === option.value}
              onChange={() => onChange({ splitType: option.value })}
            />
            {option.label}
          </label>
        ))}
      </div>

      {values.splitType === 'equal' && (
        <div className="member-grid">
          {members.map((m) => (
            <label key={m.id} className="choice">
              <input type="checkbox" checked={values.equalIds.includes(m.id)} onChange={() => toggleMember(m.id)} />
              {m.name}
            </label>
          ))}
        </div>
      )}

      {values.splitType === 'exact' && (
        <>
          <div className="member-grid">
            {members.map((m) => (
              <Field key={m.id} id={`exact-${m.id}`} label={`${m.name} (₹)`} error={errors.shares[m.id]}>
                {(props) => (
                  <input
                    {...props}
                    inputMode="decimal"
                    placeholder="0.00"
                    value={values.exact[m.id] ?? ''}
                    onChange={(e) => onChange({ exact: { ...values.exact, [m.id]: e.target.value } })}
                  />
                )}
              </Field>
            ))}
          </div>
          <p className="hint">Assigned so far: {formatINR(assignedPaise)}</p>
        </>
      )}

      {values.splitType === 'percent' && (
        <>
          <div className="member-grid">
            {members.map((m) => (
              <Field key={m.id} id={`percent-${m.id}`} label={`${m.name} (%)`} error={errors.shares[m.id]}>
                {(props) => (
                  <input
                    {...props}
                    inputMode="decimal"
                    placeholder="0"
                    value={values.percent[m.id] ?? ''}
                    onChange={(e) => onChange({ percent: { ...values.percent, [m.id]: e.target.value } })}
                  />
                )}
              </Field>
            ))}
          </div>
          <p className="hint">Total so far: {(assignedBasisPoints / 100).toFixed(2)}%</p>
        </>
      )}

      {errors.split && <p className="error">{errors.split}</p>}
    </fieldset>
  );
}
