import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const steps = [
  { id: 1, label: 'Profile', active: true },
  { id: 2, label: 'Goals', active: false },
  { id: 3, label: 'Future self', active: false },
]

export default function Setup() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-mirror-accent">Onboarding</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Meet your future self</h1>
        <p className="mt-2 text-mirror-muted">
          Tell us a bit about who you are and who you want to become.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {steps.map((step) => (
          <div key={step.id} className="flex-1">
            <div
              className={`h-1 rounded-full ${
                step.active ? 'bg-mirror-accent' : 'bg-mirror-border'
              }`}
            />
            <p className="mt-2 text-xs text-mirror-subtle">{step.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-mirror-border bg-mirror-surface p-6 sm:p-8">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="display-name" className="block text-sm font-medium text-mirror-muted">
              What should your future self call you?
            </label>
            <input
              id="display-name"
              type="text"
              placeholder="Alex"
              className="mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent"
            />
          </div>

          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-mirror-muted">
              How far into the future?
            </label>
            <select
              id="timeframe"
              className="mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent"
              defaultValue="5"
            >
              <option value="1">1 year ahead</option>
              <option value="5">5 years ahead</option>
              <option value="10">10 years ahead</option>
            </select>
          </div>

          <div>
            <label htmlFor="aspiration" className="block text-sm font-medium text-mirror-muted">
              Describe the person you want to become
            </label>
            <textarea
              id="aspiration"
              rows={4}
              placeholder="Calm, focused, financially independent, deeply connected to the people I love..."
              className="mt-1.5 w-full resize-none rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent"
            />
          </div>

          <Link
            to={ROUTES.DASHBOARD}
            className="block w-full rounded-lg bg-mirror-accent py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
          >
            Continue to dashboard
          </Link>
        </form>
      </div>
    </div>
  )
}
