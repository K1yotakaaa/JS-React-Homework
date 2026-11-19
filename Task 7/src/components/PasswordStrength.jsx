import { PASSWORD_RULES, getPasswordStrength } from '../utils/validation'

export default function PasswordStrength({ password }) {
  const { level, label } = getPasswordStrength(password)

  return (
    <div className="pw-help">
      <div className="pw-meter" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={n <= level ? `on lvl-${level}` : ''} />
        ))}
      </div>
      <p className="pw-meter-label" aria-live="polite">
        {password ? `Strength: ${label}` : 'Choose a strong password'}
      </p>
      <ul className="pw-rules">
        {PASSWORD_RULES.map((r) => (
          <li key={r.id} className={r.test(password) ? 'ok' : ''}>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  )
}