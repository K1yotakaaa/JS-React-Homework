import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATS = [
  { value: '3', label: 'Time ranges' },
  { value: '50', label: 'Tracks per range' },
  { value: '8', label: 'Audio metrics' },
  { value: '1', label: 'Shareable PDF' },
]

const STEPS = [
  { title: 'Create an account', tag: 'Email or Google' },
  { title: 'Connect your Spotify', tag: 'From your profile' },
  { title: 'Browse, rate and export', tag: 'Anytime' },
]

const GUEST_PERKS = [
  { ok: true, text: 'Browse sample top tracks' },
  { ok: true, text: 'Explore audio DNA of each track' },
  { ok: false, text: 'Save favorites' },
  { ok: false, text: 'Profile and PDF report' },
]

const ACCOUNT_PERKS = [
  { ok: true, text: 'Your real Spotify top tracks' },
  { ok: true, text: 'Favorites synced across devices' },
  { ok: true, text: 'Play tracks inside the app' },
  { ok: true, text: 'Download your PDF Wrapped' },
]

const STACK = [
  'React',
  'React Router',
  'Vite',
  'Firebase Auth',
  'Firestore',
  'TanStack Query',
  'Spotify Web API',
  'ReccoBeats',
  '@react-pdf/renderer',
]

function PerkList({ items }) {
  return (
    <ul className="ab-perks">
      {items.map((p) => (
        <li key={p.text} className={p.ok ? 'ok' : 'no'}>
          {p.text}
        </li>
      ))}
    </ul>
  )
}

export default function AboutPage() {
  const { user } = useAuth()

  return (
    <section className="view ab-page">
      <header className="view-header">
        <h1 className="view-title">About</h1>
        <p className="view-sub">
          Spotify Wrapped, whenever you want it. Not once a year.
        </p>
      </header>

      <div className="ab-hero">
        <div className="ab-story">
          <h2>The story</h2>
          <p>
            Spotify shows your year in music exactly once. Tunescape shows it
            any time. Connect your account, browse your top tracks across
            three time ranges, rate the ones that matter, dig into each
            track&apos;s audio DNA, and export a Wrapped you can share.
          </p>
          <p>
            It started as a routing exercise and kept growing: real Spotify
            data, a PDF generator, and a Firebase account system so your
            favorites follow you between devices.
          </p>
        </div>

        <div className="ab-art" aria-hidden="true">
          <div className="ab-art-disc" />
          <div className="cassette-illustration ab-art-cassette">
            <div className="cassette-window">
              <div className="cassette-reel" />
              <div className="cassette-reel" />
            </div>
            <div className="cassette-bottom" />
          </div>
          <span className="ab-sticker ab-sticker-a">Your sound</span>
          <span className="ab-sticker ab-sticker-b">On demand</span>
        </div>
      </div>

      <div className="ab-stats">
        {STATS.map((s) => (
          <div key={s.label} className="ab-stat">
            <span className="ab-stat-value">{s.value}</span>
            <span className="ab-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="ab-section">
        <h2 className="ab-section-title">What you can do</h2>
        <div className="ab-grid">
          <Link to="/tracks" className="ab-card ab-card--green ab-card--wide">
            <span className="ab-card-icon">♫</span>
            <h3>Browse top tracks</h3>
            <p>
              Short, medium and long-term listening merged into one list.
              Search, filter by range, sort by popularity, name, artist or
              duration, and paginate.
            </p>
            <span className="ab-card-link">Open tracks →</span>
          </Link>

          <Link to="/tracks" className="ab-card">
            <span className="ab-card-icon">◈</span>
            <h3>Audio DNA</h3>
            <p>
              Danceability, energy, positivity and more, plus tempo and
              loudness for every track.
            </p>
            <span className="ab-card-link">Explore →</span>
          </Link>

          <Link to="/favorites" className="ab-card ab-card--cream">
            <span className="ab-card-icon">★</span>
            <h3>Rate &amp; remember</h3>
            <p>
              Give a track 1–5 stars, tag a mood and leave a private note.
            </p>
            <span className="ab-card-link">Open favorites →</span>
          </Link>

          <Link to="/report" className="ab-card ab-card--wide">
            <span className="ab-card-icon">⤓</span>
            <h3>PDF report</h3>
            <p>
              A printable Tunescape Wrapped with your top 10, favorite picks
              with ratings and notes, and your averaged audio features.
            </p>
            <span className="ab-card-link">Get your report →</span>
          </Link>

          <Link
            to={user ? '/profile' : '/signup'}
            className="ab-card ab-card--lilac ab-card--full"
          >
            <span className="ab-card-icon">◉</span>
            <div>
              <h3>Accounts that stay connected</h3>
              <p>
                Sign up with email or Google. Your favorites and your Spotify
                connection are tied to your account, so they are still there
                after you sign out, and on any device.
              </p>
            </div>
            <span className="ab-card-link">
              {user ? 'Open profile →' : 'Create an account →'}
            </span>
          </Link>
        </div>
      </div>

      <div className="ab-section">
        <h2 className="ab-section-title">Guest or account?</h2>
        <div className="ab-compare">
          <div className="ab-plan ab-plan--guest">
            <span className="ab-plan-tag">Demo mode</span>
            <h3>Just looking around</h3>
            <p>No sign-up needed. Everything is read-only sample data.</p>
            <PerkList items={GUEST_PERKS} />
          </div>
          <div className="ab-plan ab-plan--account">
            <span className="ab-plan-tag">Account</span>
            <h3>The full experience</h3>
            <p>Free, and takes under a minute.</p>
            <PerkList items={ACCOUNT_PERKS} />
          </div>
        </div>
      </div>

      <div className="ab-section">
        <h2 className="ab-section-title">How it works</h2>
        <ol className="ab-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="ab-step">
              <span className="ab-step-num">{i + 1}</span>
              <span className="ab-step-title">{s.title}</span>
              <span className="ab-step-tag">{s.tag}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="ab-split">
        <div className="ab-box">
          <h2 className="ab-section-title">Built with</h2>
          <div className="ab-stack">
            {STACK.map((s) => (
              <span key={s} className="ab-chip">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="ab-box">
          <h2 className="ab-section-title">Your data</h2>
          <p className="ab-box-text">
            Favorites are private to your account. Your Spotify connection is
            saved to your account too, and you can disconnect it from your
            profile at any time.
          </p>
        </div>
      </div>

      <div className="ab-cta">
        <p>
          {user
            ? 'Ready to dive back in?'
            : 'Ready to see your year in music?'}
        </p>
        <div className="ab-cta-actions">
          {user ? (
            <>
              <Link className="btn btn-primary btn-lg" to="/tracks">
                Open top tracks
              </Link>
              <Link className="btn btn-ghost btn-lg" to="/profile">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-primary btn-lg" to="/signup">
                Create an account
              </Link>
              <Link className="btn btn-ghost btn-lg" to="/login">
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}