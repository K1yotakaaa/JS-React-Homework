import { Link } from 'react-router-dom'

const STEPS = [
  {
    num: '01',
    title: 'Connect',
    text: 'Create an account, then link your Spotify. Or jump in with the demo and sample data.',
  },
  {
    num: '02',
    title: 'Explore',
    text: "Browse your top tracks across three time ranges and dig into each track's audio DNA.",
  },
  {
    num: '03',
    title: 'Export',
    text: 'Rate your favourites and download a shareable PDF of your Tunescape Wrapped.',
  },
]

export default function HomePage() {
  return (
    <section className="view">
      <div className="home-hero">
        <div className="home-copy">
          <span className="home-kicker">Spotify Wrapped, on demand</span>
          <h1 className="view-title">Tunescape</h1>
          <p className="view-sub">
            Your year in music, on demand. Browse your top tracks, save
            favourites, and export a shareable PDF report — anytime.
          </p>
          <div className="home-actions">
            <Link className="btn btn-primary btn-lg" to="/tracks">Browse Tracks</Link>
            <Link className="btn btn-lg" to="/about">Learn More</Link>
          </div>
        </div>

        <div className="home-art" aria-hidden="true">
          <div className="home-disc">
            <span className="home-disc-label">TUNE<br />SCAPE</span>
          </div>
          <span className="home-arm" />
          <span className="home-sticker home-sticker-a">Top tracks</span>
          <span className="home-sticker home-sticker-b">Audio DNA</span>
          <span className="home-sticker home-sticker-c">PDF report</span>
        </div>
      </div>

      <div className="home-cards">
        {STEPS.map((step) => (
          <article key={step.num} className="home-card">
            <span className="home-card-num">{step.num}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}