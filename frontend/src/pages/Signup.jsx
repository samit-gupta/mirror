import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function Signup() {
  return (
    <div className="rounded-xl border border-mirror-border bg-mirror-surface p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-mirror-muted">
        Start your journey toward a clearer future.
      </p>

      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-mirror-muted">
            Full name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Alex Morgan"
            className="mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm text-mirror-text placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-mirror-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm text-mirror-text placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-mirror-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm text-mirror-text placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent"
          />
        </div>

        <Link
          to={ROUTES.SETUP}
          className="block w-full rounded-lg bg-mirror-accent py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
        >
          Create account
        </Link>
      </form>

      <p className="mt-6 text-center text-sm text-mirror-muted">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-mirror-accent hover:text-mirror-accent-hover">
          Log in
        </Link>
      </p>
    </div>
  )
}
