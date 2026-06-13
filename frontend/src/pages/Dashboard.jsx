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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const [userProfile, recentInsights, conversationCount, journalCount, activeDays] =
          await Promise.all([
            getProfile(user.id),
            getRecentInsights(user.id),
            getConversationCount(user.id),
            getJournalCount(user.id),
            getActiveDaysCount(user.id),
          ])

        if (cancelled) return

        setProfile(userProfile)
        setInsights(recentInsights)
        setStats({
          conversations: conversationCount,
          journals: journalCount,
          activeDays,
        })
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

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Conversations', value: stats.conversations },
          { label: 'Journal entries', value: stats.journals },
          { label: 'Days active', value: stats.activeDays },
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
