import { useId, useState } from 'react'

export function Field({ label, error, right, className = '', ...inputProps }) {
  const id = useId()
  const errId = `${id}-error`

  return (
    <div className="form-field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-wrap">
        <input
          id={id}
          className={`input ${right ? 'has-toggle' : ''} ${
            error ? 'invalid' : ''
          } ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errId : undefined}
          {...inputProps}
        />
        {right}
      </div>
      {error && (
        <p className="field-error" id={errId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function PasswordField(props) {
  const [show, setShow] = useState(false)
  return (
    <Field
      {...props}
      type={show ? 'text' : 'password'}
      right={
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      }
    />
  )
}