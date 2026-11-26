import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useServedFromCache } from '../lib/cacheStatus'

export function NetworkBadge({ compact = false }) {
  const online = useOnlineStatus()
  return (
    <span
      className={`net-badge ${online ? 'online' : 'offline'} ${compact ? 'compact' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="net-dot" aria-hidden="true" />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}

export default function ConnectivityIndicator() {
  const online = useOnlineStatus()
  const fromCache = useServedFromCache()
  const queryClient = useQueryClient()

  if (online && !fromCache) return null

  if (!online) {
    return (
      <div className="connectivity-indicator" role="status" aria-live="polite">
        <span className="connectivity-dot" aria-hidden="true" />
        <span className="connectivity-text">
          {fromCache
            ? 'You are offline - viewing cached data.'
            : 'You are offline - showing cached data where available.'}
        </span>
        <Link to="/offline" className="connectivity-link">
          Details
        </Link>
      </div>
    )
  }

  return (
    <div className="connectivity-indicator cached" role="status" aria-live="polite">
      <span className="connectivity-dot" aria-hidden="true" />
      <span className="connectivity-text">Showing saved data.</span>
      <button
        type="button"
        className="connectivity-link"
        onClick={() => queryClient.invalidateQueries()}
      >
        Refresh
      </button>
    </div>
  )
}