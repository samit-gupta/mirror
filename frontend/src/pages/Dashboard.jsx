import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthAlert from '../components/auth/AuthAlert'
import FutureSelfCard from '../components/ui/FutureSelfCard'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../contexts/AuthContext'
import { getAuthErrorMessage } from '../lib/auth'
import {
  getActiveDaysCount,
  getConversationCount,
  getRecentInsights,
} from '../lib/chat'
import { getGoalSummary } from '../lib/goals'
import { getJournalCount } from '../lib/journal'
import { getProfile } from '../lib/profiles'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [insights, setInsights] = useState([])
  const [stats, setStats] = useState({
    conversations: 0,
    journals: 0,
    activeDays: 0,
  })
  const [goalStats, setGoalStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    topGoals: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const [
          userProfile,
          recentInsights,
          conversationCount,
          journalCount,
          activeDays,
          goalSummary,
        ] = await Promise.all([
          getProfile(user.id),
          getRecentInsights(user.id),
          getConversationCount(user.id),
          getJournalCount(user.id),
          getActiveDaysCount(user.id),
          getGoalSummary(user.id),
        ])

        if (cancelled) return

        setProfile(userProfile)
        setInsights(recentInsights)
        setStats({
          conversations: conversationCount,
          journals: journalCount,
          activeDays,
        })
        setGoalStats(goalSummary)
      } catch (err) {
        if (!cancelled) {
          setError(getAuthErrorMessage(err))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [user])

  const displayName =
    profile?.name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'there'

  const yearsAhead =
    profile?.future_age && profile?.current_age
      ? profile.future_age - profile.current_age
      : null

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mirror-border border-t-mirror-accent" />
          <p className="text-sm text-mirror-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {getGreeting()}, {displayName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-mirror-muted">
          Your future self is ready to talk whenever you are.
        </p>
      </header>

      <AuthAlert variant="error" message={error} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <FutureSelfCard
            name={profile ? `Future ${profile.name.split(' ')[0]}` : 'Future You'}
            timeframe={yearsAhead ? `${yearsAhead} years ahead` : 'Set up your profile'}
            description={
              profile?.dream_life?.slice(0, 200) ??
              'Complete setup to personalize your future self.'
            }
            lastActive={stats.conversations > 0 ? 'Ready to chat' : 'Waiting for you'}
          />
          <Link
            to={profile ? ROUTES.CHAT : ROUTES.SETUP}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-mirror-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
          >
            {profile ? 'Start a conversation' : 'Complete setup first'}
          </Link>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-mirror-subtle">
            Recent insights
          </h2>

          {insights.length === 0 ? (
            <div className="rounded-lg border border-dashed border-mirror-border bg-mirror-surface/50 px-4 py-6 text-center">
              <p className="text-sm text-mirror-muted">
                Chat with your future self to see insights here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {insights.map((insight) => (
                <li
                  key={insight.id}
                  className="rounded-lg border border-mirror-border bg-mirror-surface px-4 py-3"
                >
                  <p className="line-clamp-3 text-sm text-mirror-text">
                    &ldquo;{insight.text}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-mirror-subtle">{insight.date}</p>
                </li>
              ))}
            </ul>
          )}

          <Link
            to={ROUTES.JOURNAL}
            className="mt-4 block text-center text-sm text-mirror-accent hover:text-mirror-accent-hover"
          >
            View journal →
          </Link>
        </div>
      </div>

      {/* Activity Stats */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Conversations', value: stats.conversations },
          { label: 'Journal entries', value: stats.journals },
          { label: 'Days active', value: stats.activeDays },
          { label: 'Goals tracked', value: goalStats.total },
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

      {/* Goals Overview */}
      <section className="mt-8">

        {/* Section header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-mirror-text">Goals Overview</h2>
          <Link
            to={ROUTES.GOALS}
            className="text-sm text-mirror-accent transition-colors hover:text-mirror-accent-hover"
          >
            View all →
          </Link>
        </div>

        {/* Status summary cards */}
        {goalStats.total === 0 ? (
          <div className="rounded-xl border border-dashed border-mirror-border bg-mirror-surface/50 px-5 py-10 text-center">
            <p className="text-sm font-medium text-mirror-text">No goals tracked yet</p>
            <p className="mt-1 text-sm text-mirror-muted">
              Set your first goal and start tracking your progress.
            </p>
            <Link
              to={ROUTES.GOALS}
              className="mt-5 inline-block rounded-lg bg-mirror-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
            >
              Create a goal
            </Link>
          </div>
        ) : (
          <>
            {/* Three summary stat cards + optional paused badge */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {/* Total */}
              <div className="rounded-xl border border-mirror-border bg-mirror-surface p-4">
                <p className="text-2xl font-bold text-mirror-text">{goalStats.total}</p>
                <p className="mt-0.5 text-xs text-mirror-muted">Total Goals</p>
              </div>

              {/* Completed */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-2xl font-bold text-emerald-400">{goalStats.completed}</p>
                <p className="mt-0.5 text-xs text-mirror-muted">Completed</p>
              </div>

              {/* In Progress */}
              <div className="rounded-xl border border-mirror-accent/20 bg-mirror-accent/5 p-4">
                <p className="text-2xl font-bold text-mirror-accent">{goalStats.inProgress}</p>
                <p className="mt-0.5 text-xs text-mirror-muted">In Progress</p>
              </div>
            </div>

            {/* Paused badge — shown only when paused goals exist */}
            {goalStats.total - goalStats.completed - goalStats.inProgress > 0 && (
              <div className="mb-5 flex items-center gap-2">
                <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                  ⏸ {goalStats.total - goalStats.completed - goalStats.inProgress} paused
                </span>
              </div>
            )}

            {/* Active Goals subsection */}
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-medium text-mirror-text">Active Goals</h3>
              <span className="rounded-full bg-mirror-accent/15 px-2 py-0.5 text-xs font-medium text-mirror-accent">
                {goalStats.inProgress}
              </span>
            </div>

            {goalStats.topGoals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-mirror-border bg-mirror-surface/50 px-5 py-8 text-center">
                {goalStats.completed > 0 ? (
                  <>
                    <p className="text-lg">🎉</p>
                    <p className="mt-2 text-sm font-medium text-mirror-text">All goals completed!</p>
                    <p className="mt-1 text-sm text-mirror-muted">
                      Set a new goal to keep the momentum going.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-mirror-muted">No active goals right now.</p>
                  </>
                )}
                <Link
                  to={ROUTES.GOALS}
                  className="mt-4 inline-block text-sm text-mirror-accent hover:text-mirror-accent-hover"
                >
                  Go to Goals →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {goalStats.topGoals.map((goal) => (
                  <li
                    key={goal.id}
                    className="rounded-xl border border-mirror-border bg-mirror-surface px-5 py-4 transition-colors hover:border-mirror-accent/20"
                  >
                    {/* Row 1: title + category badge */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className="flex-1 text-sm font-medium leading-snug text-mirror-text">
                        {goal.title}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-mirror-accent/15 px-2.5 py-0.5 text-xs font-medium text-mirror-accent">
                          {goal.category}
                        </span>
                        <span className="rounded-full bg-mirror-accent/10 px-2.5 py-0.5 text-xs font-medium text-mirror-accent">
                          In Progress
                        </span>
                      </div>
                    </div>

                    {/* Row 2: progress bar + percentage */}
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-mirror-elevated">
                        <div
                          className="h-full rounded-full bg-mirror-accent transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="w-9 shrink-0 text-right text-xs font-medium text-mirror-muted">
                        {goal.progress}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Recently Completed subsection — renders only when completed goal objects are available */}
            {Array.isArray(goalStats.recentlyCompleted) && goalStats.recentlyCompleted.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-mirror-text">Recently Completed</h3>
                <ul className="space-y-2">
                  {goalStats.recentlyCompleted.slice(0, 3).map((goal) => (
                    <li
                      key={goal.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-emerald-400 text-sm">✓</span>
                        <span className="truncate text-sm text-mirror-text">{goal.title}</span>
                        <span className="hidden shrink-0 rounded-full bg-mirror-accent/10 px-2 py-0.5 text-xs text-mirror-muted sm:inline">
                          {goal.category}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        Completed
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
