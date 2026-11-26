import { useState } from 'react'

export default function UpdatePrompt({
  updateReady,
  onActivate,
  offlineReady,
  onDismissOfflineReady,
}) {
  const [later, setLater] = useState(false)

  if (updateReady && !later) {
    return (
      <div className="update-prompt" role="status" aria-live="polite">
        <span className="update-text">A new version of Tunescape is available.</span>
        <div className="update-actions">
          <button type="button" className="btn btn-primary update-btn" onClick={onActivate}>
            Reload
          </button>
          <button type="button" className="btn" onClick={() => setLater(true)}>
            Later
          </button>
        </div>
      </div>
    )
  }

  if (offlineReady) {
    return (
      <div className="update-prompt" role="status" aria-live="polite">
        <span className="update-text">Tunescape is ready to work offline.</span>
        <div className="update-actions">
          <button type="button" className="btn" onClick={onDismissOfflineReady}>
            OK
          </button>
        </div>
      </div>
    )
  }

  return null
}