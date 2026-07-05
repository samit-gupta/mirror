import { useCallback, useEffect, useState } from 'react'
import AuthAlert from '../components/auth/AuthAlert'
import { useAuth } from '../contexts/AuthContext'
import { getAuthErrorMessage } from '../lib/auth'
import {
  createJournal,
  getJournal,
  getJournals,
  JOURNAL_MOODS,
  mapJournalForList,
  MOOD_COLORS,
  updateJournal,
} from '../lib/journal'
import { extractAndStoreJournalMemories } from '../lib/journalMemory'

const inputClassName =
  'mt-2 w-full rounded-2xl border-2 border-mirror-border bg-mirror-surface/60 px-5 py-3.5 text-[15px] text-mirror-text placeholder:text-mirror-subtle shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-mirror-accent/70 focus:bg-mirror-surface focus:outline-none focus:ring-4 focus:ring-mirror-accent/10 disabled:cursor-not-allowed disabled:opacity-60'

export default function Journal() {
  const { user } = useAuth()

  const [entries, setEntries] = useState([])
  const [view, setView] = useState('list')
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState({ title: '', content: '', mood: 'Reflective' })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadEntries = useCallback(async () => {
    if (!user) return

    const rows = await getJournals(user.id)
    setEntries(rows.map(mapJournalForList))
  }, [user])

  useEffect(() => {
    if (!user) return

    let cancelled = false

    async function init() {
      setLoading(true)
      setError('')

      try {
        await loadEntries()
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

    init()

    return () => {
      cancelled = true
    }
  }, [user, loadEntries])

  async function openEntry(journalId) {
    setError('')
    setSuccess('')

    try {
      const journal = await getJournal(journalId, user.id)

      if (!journal) {
        setError('Journal entry not found.')
        return
      }

      setSelectedId(journal.id)
      setDraft({
        title: journal.title,
        content: journal.content,
        mood: journal.mood,
      })
      setView('edit')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    }
  }

  async function handleNewEntry() {
    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const journal = await createJournal(user.id)
      await loadEntries()
      setSelectedId(journal.id)
      setDraft({
        title: journal.title,
        content: journal.content,
        mood: journal.mood,
      })
      setView('edit')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  async function handleSave(event) {
    event.preventDefault()

    if (!selectedId) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateJournal(selectedId, user.id, draft)
      await loadEntries()
      setSuccess('Entry saved.')

      // Fire-and-forget: extract long-term insights in the background.
      // Not awaited — extraction never blocks or interrupts the save UX.
      extractAndStoreJournalMemories(user.id, selectedId, draft.content)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    setView('list')
    setSelectedId(null)
    setDraft({ title: '', content: '', mood: 'Reflective' })
    setSuccess('')
    setError('')
  }

  if (view === 'edit') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <button
          type="button"
          onClick={handleBack}
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-mirror-border bg-mirror-surface px-4 py-2 text-sm font-medium text-mirror-muted shadow-sm transition-all duration-200 hover:border-mirror-accent/30 hover:bg-mirror-elevated hover:text-mirror-text hover:shadow"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Back to entries
        </button>

        <div className="rounded-3xl border border-mirror-border bg-mirror-surface/60 p-6 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-12">
          <form onSubmit={handleSave} className="space-y-8">
            <AuthAlert variant="error" message={error} />
            <AuthAlert variant="success" message={success} />

            <div className="space-y-2">
              <label htmlFor="journal-title" className="block text-sm font-semibold uppercase tracking-wider text-mirror-muted">
                Title
              </label>
              <input
                id="journal-title"
                type="text"
                value={draft.title}
                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Give this entry a meaningful title"
                disabled={saving}
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="journal-mood" className="block text-sm font-semibold uppercase tracking-wider text-mirror-muted">
                Mood
              </label>
              <select
                id="journal-mood"
                value={draft.mood}
                onChange={(event) => setDraft((prev) => ({ ...prev, mood: event.target.value }))}
                disabled={saving}
                className={inputClassName}
              >
                {JOURNAL_MOODS.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="journal-content" className="block text-sm font-semibold uppercase tracking-wider text-mirror-muted">
                Entry
              </label>
              <textarea
                id="journal-content"
                rows={14}
                value={draft.content}
                onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="Write your reflections here..."
                disabled={saving}
                className={`${inputClassName} min-h-[350px] resize-y leading-relaxed`}
              />
            </div>

            <div className="mt-10 flex flex-col-reverse gap-3 border-t border-mirror-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="w-full rounded-2xl px-6 py-3.5 text-sm font-bold text-mirror-muted transition-colors hover:bg-mirror-elevated hover:text-mirror-text disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-mirror-accent px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mirror-accent/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-mirror-text sm:text-4xl">
            Journal
          </h1>
          <p className="mt-2 text-base text-mirror-muted">
            Insights and reflections from your conversations.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewEntry}
          disabled={loading || creating}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-mirror-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mirror-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="relative flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            {creating ? 'Creating...' : 'New Entry'}
          </span>
        </button>
      </header>

      <AuthAlert variant="error" message={error} />

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mirror-border border-t-mirror-accent" />
          <p className="text-sm text-mirror-muted">Loading journal entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-mirror-border bg-mirror-surface/40 px-6 py-24 text-center backdrop-blur-sm sm:px-12">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mirror-elevated shadow-sm">
            <svg className="h-8 w-8 text-mirror-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-mirror-text sm:text-2xl">Your log is empty</h2>
          <p className="mx-auto mt-3 max-w-md text-base text-mirror-muted">
            Capture your thoughts, insights, and reflections from talking with your future self. Begin your journey today.
          </p>
          <button
            type="button"
            onClick={handleNewEntry}
            disabled={creating}
            className="group relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-xl bg-mirror-accent px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mirror-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative flex items-center gap-2">
              {creating ? 'Creating...' : 'Start your first entry'}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {entries.map((entry) => (
            <article
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => openEntry(entry.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openEntry(entry.id)
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-mirror-border bg-mirror-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-mirror-accent/30 hover:shadow-lg hover:shadow-mirror-accent/5 sm:p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-mirror-accent/0 via-mirror-accent/0 to-mirror-accent/0 transition-colors duration-500 group-hover:to-mirror-accent/5" />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      MOOD_COLORS[entry.mood] ?? MOOD_COLORS.Reflective
                    }`}
                  >
                    {entry.mood}
                  </span>
                  <time className="text-xs font-medium text-mirror-subtle">{entry.date}</time>
                </div>
                
                <h2 className="mt-5 text-xl font-bold text-mirror-text transition-colors duration-200 group-hover:text-mirror-accent sm:text-2xl">
                  {entry.title}
                </h2>
                
                <p className="mt-3 text-sm leading-relaxed text-mirror-muted line-clamp-3 sm:text-base">
                  {entry.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
