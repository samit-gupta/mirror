import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthAlert from '../components/auth/AuthAlert'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../contexts/AuthContext'
import { getAuthErrorMessage, validateEmail, validatePassword } from '../lib/auth'

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm text-mirror-text placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent disabled:cursor-not-allowed disabled:opacity-60'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const redirectTo = location.state?.from?.pathname ?? ROUTES.DASHBOARD

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      await signIn({ email: email.trim(), password })
      setSuccess('Signed in successfully. Redirecting...')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-mirror-border bg-mirror-surface p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-mirror-muted">
        Sign in to continue your conversation with your future self.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthAlert variant="error" message={error} />
        <AuthAlert variant="success" message={success} />

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-mirror-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-mirror-muted">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-mirror-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
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
