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
  'mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm text-mirror-text placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent disabled:cursor-not-allowed disabled:opacity-60'

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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 text-sm text-mirror-muted transition-colors hover:text-mirror-text"
        >
          ← Back to journal
        </button>

        <div className="rounded-xl border border-mirror-border bg-mirror-surface p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-5">
            <AuthAlert variant="error" message={error} />
            <AuthAlert variant="success" message={success} />

            <div>
              <label htmlFor="journal-title" className="block text-sm font-medium text-mirror-muted">
                Title
              </label>
              <input
                id="journal-title"
                type="text"
                value={draft.title}
                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Give this entry a title"
                disabled={saving}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="journal-mood" className="block text-sm font-medium text-mirror-muted">
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

            <div>
              <label htmlFor="journal-content" className="block text-sm font-medium text-mirror-muted">
                Entry
              </label>
              <textarea
                id="journal-content"
                rows={12}
                value={draft.content}
                onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="Write your reflections..."
                disabled={saving}
                className={`${inputClassName} resize-y`}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-mirror-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save entry'}
              </button>
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="rounded-lg border border-mirror-border px-5 py-2.5 text-sm font-medium text-mirror-muted transition-colors hover:bg-mirror-elevated hover:text-mirror-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Journal</h1>
          <p className="mt-1 text-mirror-muted">
            Insights and reflections from your conversations.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewEntry}
          disabled={loading || creating}
          className="rounded-lg border border-mirror-border px-4 py-2 text-sm font-medium transition-colors hover:bg-mirror-elevated disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? 'Creating...' : 'New entry'}
        </button>
      </header>

      <AuthAlert variant="error" message={error} />

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mirror-border border-t-mirror-accent" />
          <p className="text-sm text-mirror-muted">Loading journal entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-mirror-border bg-mirror-surface/50 p-10 text-center">
          <p className="text-sm font-medium text-mirror-text">No entries yet</p>
          <p className="mt-2 text-sm text-mirror-muted">
            Capture your thoughts, insights, and reflections from talking with your future self.
          </p>
          <button
            type="button"
            onClick={handleNewEntry}
            disabled={creating}
            className="mt-6 rounded-lg bg-mirror-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? 'Creating...' : 'Create your first entry'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
              className="group cursor-pointer rounded-xl border border-mirror-border bg-mirror-surface p-5 transition-colors hover:border-mirror-accent/30"
            >
              <div className="flex flex-wrap items-center gap-2">
                <time className="text-xs text-mirror-subtle">{entry.date}</time>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    MOOD_COLORS[entry.mood] ?? MOOD_COLORS.Reflective
                  }`}
                >
                  {entry.mood}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-semibold group-hover:text-mirror-accent">
                {entry.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mirror-muted">{entry.excerpt}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
