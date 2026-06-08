import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Link
        to={ROUTES.LANDING}
        className="mb-8 flex items-center gap-2 text-lg font-semibold"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mirror-accent/20 text-mirror-accent">
          M
        </span>
        Mirror
      </Link>

      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
