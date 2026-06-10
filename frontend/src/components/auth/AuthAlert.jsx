export default function AuthAlert({ variant = 'error', message }) {
  if (!message) {
    return null
  }

  const styles =
    variant === 'success'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : 'border-red-500/30 bg-red-500/10 text-red-300'

  return (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {message}
    </div>
  )
}
