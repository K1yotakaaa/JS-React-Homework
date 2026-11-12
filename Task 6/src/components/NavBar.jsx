import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Svg({ children }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const HomeIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="12" r="5.5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </Svg>
)

const AboutIcon = () => (
  <Svg>
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <circle cx="8.5" cy="11" r="2" />
    <circle cx="15.5" cy="11" r="2" />
    <path d="M7 19l1.6-3h6.8L17 19" />
  </Svg>
)

const NAV = [
  { to: '/', label: 'Home', icon: <HomeIcon />, end: true },
  { to: '/about', label: 'About', icon: <AboutIcon /> },
  { to: '/tracks', label: 'Top Tracks', icon: '♫' },
  { to: '/favorites', label: 'Favorites', icon: '★' },
  { to: '/report', label: 'Report', icon: '⤓' },
]

export default function NavBar() {
  const { user, loading, spotifyConnected, spotifyUser, logout } = useAuth()

  const avatarUrl = spotifyUser?.images?.[0]?.url || user?.photoURL
  const displayName =
    spotifyUser?.display_name ||
    user?.displayName ||
    user?.email ||
    'Listener'
  const initial = (displayName || '?')[0].toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-dot" />
        TUNESCAPE
      </div>

      {user && (
        <NavLink to="/profile" className="sidebar-user" title="Profile">
          <div className="user-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : initial}
          </div>
          <div>
            <div className="user-name">{displayName}</div>
            <div className="user-tag">
              {spotifyConnected ? 'Spotify connected' : 'Spotify not connected'}
            </div>
          </div>
        </NavLink>
      )}

      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user ? (
        <button
          className="btn btn-ghost btn-sm sidebar-exit"
          onClick={logout}
        >
          Sign out
        </button>
      ) : (
        !loading && (
          <div className="sidebar-auth">
            <NavLink to="/login" className="btn btn-ghost btn-sm">
              Login
            </NavLink>
            <NavLink to="/signup" className="btn btn-primary btn-sm">
              Signup
            </NavLink>
          </div>
        )
      )}
    </aside>
  )
}