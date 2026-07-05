import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthAlert from '../components/auth/AuthAlert'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../contexts/AuthContext'
import { getAuthErrorMessage } from '../lib/auth'
import { formatJournalDate } from '../lib/journal'
import { getMemories } from '../lib/memories'

export default function Memories() {
  const { user } = useAuth()

  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Single load function used by both the mount effect and the Refresh button.
  // Keeping it outside the effect ensures the button calls the exact same path
  // as the initial load, with no stale-closure differences.
  const loadMemories = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const data = await getMemories(user.id)
      setMemories(data)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadMemories()

    // Silent re-fetch when the tab becomes visible — no spinner.
    async function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return
      try {
        const data = await getMemories(user.id)
        setMemories(data)
      } catch {
        // Non-fatal — user still sees the last-loaded data.
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [loadMemories, user])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Memory Vault</h1>
          <p className="mt-1 text-mirror-muted">
            Core aspirations and goals that shape your conversations with your Future Self.
          </p>
        </div>
        <button
          onClick={loadMemories}
          disabled={loading}
          aria-label="Refresh memories"
          className="mt-1 flex shrink-0 items-center gap-1.5 rounded-lg border border-mirror-border bg-mirror-surface px-3 py-1.5 text-xs font-medium text-mirror-muted transition-colors hover:border-mirror-accent/40 hover:text-mirror-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      <AuthAlert variant="error" message={error} />

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mirror-border border-t-mirror-accent" />
          <p className="text-sm text-mirror-muted">Retrieving your memories...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-mirror-border bg-mirror-surface/50 p-10 text-center">
          <p className="text-sm font-medium text-mirror-text">No memories recorded yet</p>
          <p className="mt-2 text-sm text-mirror-muted">
            Set up your profile to establish the goals and dreams that guide your Future Self.
          </p>
          <Link
            to={ROUTES.SETUP}
            className="mt-6 inline-block rounded-lg bg-mirror-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
          >
            Go to Setup
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <article
              key={memory.id}
              className="rounded-xl border border-mirror-border bg-mirror-surface p-5 transition-colors hover:border-mirror-accent/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-mirror-accent/15 px-2.5 py-0.5 text-xs font-medium text-mirror-accent capitalize">
                  {memory.memory_type === 'goal' ? 'Goal' : memory.memory_type}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-mirror-subtle">Importance</span>
                  <span className="rounded bg-mirror-elevated px-1.5 py-0.5 text-xs font-semibold text-mirror-muted">
                    {memory.importance}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mirror-text sm:text-base">
                {memory.content}
              </p>
              <div className="mt-4 border-t border-mirror-border-subtle pt-3 text-right">
                <time className="text-xs text-mirror-subtle" dateTime={memory.created_at}>
                  Captured on {formatJournalDate(memory.created_at)}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
