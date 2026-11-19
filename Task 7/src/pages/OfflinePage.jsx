import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnlineStatus, recheckConnection } from '../hooks/useOnlineStatus'

export default function OfflinePage() {
  const online = useOnlineStatus()
  const navigate = useNavigate()
  const [retrying, setRetrying] = useState(false)
  const [failed, setFailed] = useState(false)

  const leave = useCallback(() => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (!online) return undefined
    const timer = setTimeout(leave, 600)
    return () => clearTimeout(timer)
  }, [online, leave])

  const handleRetry = async () => {
    setRetrying(true)
    setFailed(false)
    const ok = await recheckConnection()
    setRetrying(false)
    if (ok) leave()
    else setFailed(true)
  }

  return (
    <div className="view offline-view">
      <div className="offline-card">
        <div className="offline-icon" aria-hidden="true">📡</div>
        <h1 className="view-title">You're offline</h1>
        <p className="view-sub">
          Tunescape needs a connection for fresh data. Pages and public data you've
          already visited remain available.
        </p>
        <button
          type="button"
          className="btn btn-primary offline-retry"
          onClick={handleRetry}
          disabled={retrying}
        >
          {retrying ? 'Checking…' : 'Retry connection'}
        </button>
        <p className="offline-status" aria-live="polite">
          {online
            ? 'Back online — restoring…'
            : failed
              ? 'Still offline. Please try again.'
              : 'No connection detected'}
        </p>
      </div>
    </div>
  )
}