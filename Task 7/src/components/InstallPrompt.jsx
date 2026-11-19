import { useEffect, useState } from 'react'

const DISMISS_KEY = 'tunescape_install_dismissed'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault()
      setDeferred(event)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferred || dismissed) return null

  const install = async () => {
    deferred.prompt()
    const choice = await Promise.resolve(deferred.userChoice).catch(() => null)
    if (choice && choice.outcome === 'accepted') setDeferred(null)
  }

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }

  return (
    <div className="install-prompt" role="status" aria-live="polite">
      <span className="install-text">
        Install Tunescape for a faster, offline-friendly experience.
      </span>
      <div className="install-actions">
        <button type="button" className="btn btn-primary" onClick={install}>
          Install
        </button>
        <button type="button" className="btn" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  )
}