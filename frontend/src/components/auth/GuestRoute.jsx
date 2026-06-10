import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ROUTES } from '../../constants/routes'
import AuthLoading from './AuthLoading'

export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoading />
  }

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
