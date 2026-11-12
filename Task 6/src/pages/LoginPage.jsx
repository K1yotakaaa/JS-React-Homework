import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Field, PasswordField } from '../components/FormFields'
import { validateLogin } from '../utils/validation'

export default function LoginPage() {
  const { login, loginWithGoogle, error, clearError, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/profile', { replace: true })
  }, [loading, user, navigate])

  const errors = validateLogin({ email, password })
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
      await login(email.trim(), password)
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
            Welcome <span className="text-glow">back</span>
          </h1>
          <p className="auth-sub">
            Sign in to browse your top tracks, save favorites, and download a
            shareable PDF report.
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
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={onChange(setEmail)}
              onBlur={touch('email')}
              error={shown('email')}
            />
            <PasswordField
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange(setPassword)}
              onBlur={touch('password')}
              error={shown('password')}
            />
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <button
            className="btn btn-spotify btn-lg"
            type="button"
            onClick={onGoogle}
            disabled={busy}
          >
            Continue with Google
          </button>

          <p className="auth-note">
            No account?{' '}
            <Link to="/signup" onClick={clearError}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}