export default function AuthLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-mirror-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mirror-border border-t-mirror-accent" />
        <p className="text-sm text-mirror-muted">Loading...</p>
      </div>
    </div>
  )
}
