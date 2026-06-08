import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import FutureSelfCard from '../components/ui/FutureSelfCard'

const recentInsights = [
  { id: 1, text: 'Focus on progress, not perfection.', date: 'Today' },
  { id: 2, text: 'The decision you are avoiding is the one that matters most.', date: 'Yesterday' },
  { id: 3, text: 'Rest is not laziness — it is preparation.', date: '3 days ago' },
]

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">Good evening, Alex</h1>
        <p className="mt-1 text-mirror-muted">
          Your future self is ready to talk whenever you are.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <FutureSelfCard />
          <Link
            to={ROUTES.CHAT}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-mirror-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
          >
            Start a conversation
          </Link>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-mirror-subtle">
            Recent insights
          </h2>
          <ul className="space-y-3">
            {recentInsights.map((insight) => (
              <li
                key={insight.id}
                className="rounded-lg border border-mirror-border bg-mirror-surface px-4 py-3"
              >
                <p className="text-sm text-mirror-text">&ldquo;{insight.text}&rdquo;</p>
                <p className="mt-1 text-xs text-mirror-subtle">{insight.date}</p>
              </li>
            ))}
          </ul>
          <Link
            to={ROUTES.JOURNAL}
            className="mt-4 block text-center text-sm text-mirror-accent hover:text-mirror-accent-hover"
          >
            View journal →
          </Link>
        </div>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Conversations', value: '12' },
          { label: 'Journal entries', value: '8' },
          { label: 'Days active', value: '24' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-mirror-border bg-mirror-surface px-5 py-4"
          >
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-mirror-muted">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
