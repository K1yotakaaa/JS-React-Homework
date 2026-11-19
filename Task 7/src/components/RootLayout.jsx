import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import NavBar from './NavBar'
import { useAuth } from '../context/AuthContext'

export default function RootLayout() {
  const { user, demoMode, spotifyConnected, spotifyExpired, tokensLoading } =
    useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="app-shell">
      <NavBar />
      <main className="main-area" ref={mainRef}>
        {demoMode && (
          <div className="demo-banner">
            <span>⚠️ DEMO MODE. Read-only.</span>
            <button onClick={() => navigate('/login')}>Log in</button>
            <span>to use your account.</span>
          </div>
        )}
        {user && !tokensLoading && !spotifyConnected && (
          <div className="demo-banner">
            <span>
              {spotifyExpired
                ? '⚠️ Your Spotify connection expired.'
                : '⚠️ Showing sample data.'}
            </span>
            <button onClick={() => navigate('/profile')}>
              {spotifyExpired ? 'Reconnect Spotify' : 'Connect Spotify'}
            </button>
            <span>to see your real listening.</span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}