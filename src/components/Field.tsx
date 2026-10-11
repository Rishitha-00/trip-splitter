import type { ReactNode } from 'react';

interface InputProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  // The input is built by the caller; we hand it the accessibility props.
  children: (inputProps: InputProps) => ReactNode;
}

/** A visible label + the input + the error message right under it. */
export default function Field({ id, label, error, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined })}
      {error && (
        <p id={errorId} className="error">
          {error}
        </p>
      )}
    </div>
  );
}
