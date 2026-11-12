import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="state">
      <div className="state-icon">404</div>
      <p className="state-label">Page not found</p>
      <Link className="btn btn-primary" to="/">
        Back home
      </Link>
    </div>
  )
}