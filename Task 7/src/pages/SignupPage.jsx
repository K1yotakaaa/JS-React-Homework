import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Field, PasswordField } from '../components/FormFields'
import PasswordStrength from '../components/PasswordStrength'
import { validateSignup, NAME_MAX } from '../utils/validation'

export default function SignupPage() {
  const { signup, loginWithGoogle, error, clearError, user, loading } =
    useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/profile', { replace: true })
  }, [loading, user, navigate])

  const errors = validateSignup({ name, email, password, confirm })
  const shown = (field) =>
    touched[field] || submitted ? errors[field] : undefined
  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }))
  const onChange = (setter) => (e) => {
    setter(e.target.value)
    if (error) clearError()
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const firstInvalid = Object.keys(errors)[0]
    if (firstInvalid) {
      e.currentTarget.elements[firstInvalid]?.focus()
      return
    }

    setBusy(true)
    try {
      await signup(email.trim(), password, name.trim())
    } catch {
    } finally {
      setBusy(false)
    }
  }

  const onGoogle = async () => {
    setBusy(true)
    try {
      await loginWithGoogle()
    } catch {
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-art">
          <div className="brand-mark">
            <span className="brand-dot" />
            TUNESCAPE
          </div>

          <div className="cassette-illustration">
            <div className="cassette-window">
              <div className="cassette-reel" />
              <div className="cassette-reel" />
            </div>
            <div className="cassette-bottom" />
          </div>

          <h1 className="auth-title">
            Create your <span className="text-glow">account</span>
          </h1>
          <p className="auth-sub">
            One account, your favorites everywhere. Connect Spotify after
            signup to unlock real data.
          </p>
        </div>

        <div className="auth-body">
          <Link to="/" className="auth-back" onClick={clearError}>
            ← Back
          </Link>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <Field
              label="Display name"
              name="name"
              autoComplete="nickname"
              placeholder="Optional"
              maxLength={NAME_MAX + 10}
              value={name}
              onChange={onChange(setName)}
              onBlur={touch('name')}
              error={shown('name')}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={onChange(setEmail)}
              onBlur={touch('email')}
              error={shown('email')}
            />
            <div>
              <PasswordField
                label="Password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange(setPassword)}
                onBlur={touch('password')}
                error={shown('password')}
              />
              {(password.length > 0 || touched.password) && (
                <PasswordStrength password={password} />
              )}
            </div>
            <PasswordField
              label="Confirm password"
              name="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={onChange(setConfirm)}
              onBlur={touch('confirm')}
              error={shown('confirm')}
            />
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <button
            className="btn btn-spotify btn-lg"
            type="button"
            onClick={onGoogle}
            disabled={busy}
          >
            Sign up with Google
          </button>

          <p className="auth-note">
            Already registered?{' '}
            <Link to="/login" onClick={clearError}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}