import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const {
    user,
    logout,
    connectSpotify,
    disconnectSpotify,
    spotifyConnected,
    spotifyUser,
    tokensLoading,
    error,
    clearError,
  } = useAuth()

  return (
    <section className="view">
      <header className="view-header">
        <h1 className="view-title">Profile</h1>
        <p className="view-sub">
          Your account and Spotify connection live here.
        </p>
      </header>

      {error && (
        <div
          className="auth-error"
          role="alert"
          style={{
            maxWidth: 620,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border: 0,
              cursor: 'pointer',
              fontWeight: 800,
              color: 'inherit',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-row">
          <span>Email</span>
          <strong>{user?.email || '—'}</strong>
        </div>
        <div className="profile-row">
          <span>UID</span>
          <code>{user?.uid}</code>
        </div>
        <div className="profile-row">
          <span>Display name</span>
          <strong>{user?.displayName || '—'}</strong>
        </div>
      </div>

      <div className="profile-actions">
        {tokensLoading ? (
          <p className="muted" style={{ margin: 0 }}>
            Checking Spotify connection…
          </p>
        ) : !spotifyConnected ? (
          <button className="btn btn-spotify" onClick={connectSpotify}>
            Connect Spotify
          </button>
        ) : (
          <>
            <p className="muted" style={{ margin: 0 }}>
              Spotify connected as{' '}
              <strong>{spotifyUser?.display_name || 'listener'}</strong>. This
              Spotify account is linked to this Tunescape account only.
            </p>
            <button className="btn btn-ghost" onClick={disconnectSpotify}>
              Disconnect Spotify
            </button>
          </>
        )}
        <button className="btn btn-ghost" onClick={logout}>
          Logout
        </button>
      </div>
    </section>
  )
}