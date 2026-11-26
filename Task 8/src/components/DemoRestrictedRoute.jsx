import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from './States'

export default function DemoRestrictedRoute() {
  const { demoMode, loading } = useAuth()

  if (loading) return <LoadingState label="Checking session…" />
  if (!demoMode) return <Outlet />

  return (
    <section className="view">
      <div className="report-card">
        <div className="report-icon">🔒</div>
        <h2>Unavailable in Demo Mode</h2>
        <p>
          This feature is unavailable in Demo Mode. Please create an account
          or log in to access it.
        </p>
        <Link className="btn btn-primary btn-lg" to="/login">
          Log in
        </Link>
      </div>
    </section>
  )
}