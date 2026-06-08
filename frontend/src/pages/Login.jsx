import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function Login() {
  return (
    <div className="rounded-xl border border-mirror-border bg-mirror-surface p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-mirror-muted">
        Sign in to continue your conversation with your future self.
      </p>

      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
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
          to={ROUTES.DASHBOARD}
          className="block w-full rounded-lg bg-mirror-accent py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
        >
          Sign in
        </Link>
      </form>

      <p className="mt-6 text-center text-sm text-mirror-muted">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="font-medium text-mirror-accent hover:text-mirror-accent-hover">
          Sign up
        </Link>
      </p>
    </div>
  )
}
