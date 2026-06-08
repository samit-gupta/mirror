import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

export default function Navbar({ variant = 'marketing' }) {
  const isApp = variant === 'app'

  return (
    <header className="sticky top-0 z-50 border-b border-mirror-border-subtle bg-mirror-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          to={ROUTES.LANDING}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-mirror-text"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mirror-accent/20 text-mirror-accent">
            M
          </span>
          Mirror
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {isApp ? (
            <Link
              to={ROUTES.DASHBOARD}
              className="text-sm text-mirror-muted transition-colors hover:text-mirror-text"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="rounded-lg px-3 py-2 text-sm text-mirror-muted transition-colors hover:text-mirror-text"
              >
                Log in
              </Link>
              <Link
                to={ROUTES.SIGNUP}
                className="rounded-lg bg-mirror-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-mirror-accent-hover"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
