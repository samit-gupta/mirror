import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import FutureSelfCard from '../components/ui/FutureSelfCard'

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-mirror-accent">
            AI-powered self-reflection
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Talk to your{' '}
            <span className="bg-gradient-to-r from-mirror-accent to-mirror-accent-hover bg-clip-text text-transparent">
              future self
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-mirror-muted sm:text-xl">
            Mirror helps you have meaningful conversations with the person you are becoming —
            gain perspective, clarity, and guidance from a wiser version of you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={ROUTES.SIGNUP}
              className="w-full rounded-xl bg-mirror-accent px-8 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover sm:w-auto"
            >
              Start your journey
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="w-full rounded-xl border border-mirror-border px-8 py-3.5 text-center text-sm font-medium text-mirror-text transition-colors hover:bg-mirror-elevated sm:w-auto"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Preview card */}
      <section className="border-y border-mirror-border-subtle bg-mirror-surface/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-lg">
            <FutureSelfCard />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">
          How Mirror works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-mirror-muted">
          Three simple steps to connect with the wisdom of your future self.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Define your future',
              body: 'Tell Mirror who you want to become — your goals, values, and the timeline you envision.',
            },
            {
              step: '02',
              title: 'Start a conversation',
              body: 'Chat with your future self about decisions, doubts, and the path ahead.',
            },
            {
              step: '03',
              title: 'Reflect & grow',
              body: 'Journal your insights and track how your perspective evolves over time.',
            },
          ].map((feature) => (
            <div
              key={feature.step}
              className="rounded-xl border border-mirror-border bg-mirror-surface p-6"
            >
              <span className="text-sm font-mono text-mirror-accent">{feature.step}</span>
              <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mirror-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-mirror-border-subtle py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Your future self is waiting
          </h2>
          <p className="mt-4 text-mirror-muted">
            Begin a conversation that could change how you see yourself today.
          </p>
          <Link
            to={ROUTES.SIGNUP}
            className="mt-8 inline-block rounded-xl bg-mirror-accent px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
          >
            Create free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-mirror-border-subtle py-8 text-center text-sm text-mirror-subtle">
        © {new Date().getFullYear()} Mirror. Placeholder content.
      </footer>
    </div>
  )
}
