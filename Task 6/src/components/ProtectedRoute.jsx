import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from './States'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingState label="Checking session…" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}