const entries = [
  {
    id: 1,
    date: 'June 8, 2026',
    title: 'On taking the leap',
    excerpt:
      'Talked with future me about the job change. The fear is real, but so is the cost of staying comfortable.',
    mood: 'Reflective',
  },
  {
    id: 2,
    date: 'June 5, 2026',
    title: 'Morning clarity',
    excerpt:
      'Woke up with a clearer sense of what matters. Future me reminded me that small daily choices compound.',
    mood: 'Hopeful',
  },
  {
    id: 3,
    date: 'June 1, 2026',
    title: 'First conversation',
    excerpt:
      'Met my future self for the first time. Strange and comforting at the same time.',
    mood: 'Curious',
  },
]

const moodColors = {
  Reflective: 'bg-blue-500/15 text-blue-400',
  Hopeful: 'bg-emerald-500/15 text-emerald-400',
  Curious: 'bg-amber-500/15 text-amber-400',
}

export default function Journal() {
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
          className="rounded-lg border border-mirror-border px-4 py-2 text-sm font-medium transition-colors hover:bg-mirror-elevated"
        >
          New entry
        </button>
      </header>

      <div className="space-y-4">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="group cursor-pointer rounded-xl border border-mirror-border bg-mirror-surface p-5 transition-colors hover:border-mirror-accent/30"
          >
            <div className="flex flex-wrap items-center gap-2">
              <time className="text-xs text-mirror-subtle">{entry.date}</time>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${moodColors[entry.mood]}`}
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
    </div>
  )
}
