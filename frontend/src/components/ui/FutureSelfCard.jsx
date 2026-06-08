export default function FutureSelfCard({
  name = 'Future You',
  timeframe = '5 years ahead',
  description = 'A wiser, calmer version of yourself — ready to reflect on where you are and where you are going.',
  lastActive = 'Active today',
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-mirror-border bg-mirror-surface p-5 transition-colors hover:border-mirror-accent/40 sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mirror-accent/10 blur-2xl transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mirror-accent to-mirror-accent-muted text-lg font-semibold text-white">
          {name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-mirror-text">{name}</h3>
            <span className="rounded-full bg-mirror-accent/15 px-2.5 py-0.5 text-xs font-medium text-mirror-accent">
              {timeframe}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-mirror-muted">{description}</p>
          <p className="mt-3 text-xs text-mirror-subtle">{lastActive}</p>
        </div>
      </div>
    </article>
  )
}
