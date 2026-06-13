import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthAlert from '../components/auth/AuthAlert'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../contexts/AuthContext'
import { getAuthErrorMessage } from '../lib/auth'
import { getProfile, saveProfile, validateProfileForm } from '../lib/profiles'

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2.5 text-sm text-mirror-text placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent disabled:cursor-not-allowed disabled:opacity-60'

const steps = [
  { id: 1, label: 'About you' },
  { id: 2, label: 'Your future' },
  { id: 3, label: 'Your vision' },
]

export default function Setup() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [currentAge, setCurrentAge] = useState('')
  const [futureAge, setFutureAge] = useState('')
  const [careerGoal, setCareerGoal] = useState('')
  const [healthGoal, setHealthGoal] = useState('')
  const [dreamLife, setDreamLife] = useState('')

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    const defaultName = user.user_metadata?.full_name ?? ''
    setName(defaultName)

    getProfile(user.id)
      .then((profile) => {
        if (!profile) {
          return
        }

        setName(profile.name ?? defaultName)
        setCurrentAge(profile.current_age?.toString() ?? '')
        setFutureAge(profile.future_age?.toString() ?? '')

        if (profile.dream_life) {
          const careerMatch = profile.dream_life.match(
            /Career Goal:\n([\s\S]*?)(?:\n\n|$)/,
          )
          const healthMatch = profile.dream_life.match(
            /Health Goal:\n([\s\S]*?)(?:\n\n|$)/,
          )
          const dreamMatch = profile.dream_life.match(/Dream Life:\n([\s\S]*)$/)

          if (careerMatch) setCareerGoal(careerMatch[1].trim())
          if (healthMatch) setHealthGoal(healthMatch[1].trim())
          if (dreamMatch) setDreamLife(dreamMatch[1].trim())
          else if (!careerMatch && !healthMatch) setDreamLife(profile.dream_life)
        }
      })
      .catch((err) => {
        setError(getAuthErrorMessage(err))
      })
      .finally(() => {
        setLoadingProfile(false)
      })
  }, [user])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateProfileForm({
      name,
      currentAge,
      futureAge,
      careerGoal,
      healthGoal,
      dreamLife,
    })

    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)

    try {
      await saveProfile({
        userId: user.id,
        name,
        currentAge,
        futureAge,
        careerGoal,
        healthGoal,
        dreamLife,
      })

      setSuccess('Profile saved successfully. Redirecting to dashboard...')
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mirror-border border-t-mirror-accent" />
          <p className="text-sm text-mirror-muted">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-mirror-accent">Onboarding</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Meet your future self</h1>
        <p className="mt-2 text-mirror-muted">
          Tell us about who you are today and the life you are working toward.
        </p>
      </div>

      <div className="mb-8 flex gap-2">
        {steps.map((step) => (
          <div key={step.id} className="flex-1">
            <div className="h-1 rounded-full bg-mirror-border" />
            <p className="mt-2 text-xs text-mirror-subtle">{step.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-mirror-border bg-mirror-surface p-6 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthAlert variant="error" message={error} />
          <AuthAlert variant="success" message={success} />

          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-mirror-muted">
              Full Name
            </label>
            <input
              id="full-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Morgan"
              disabled={submitting}
              className={inputClassName}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="current-age" className="block text-sm font-medium text-mirror-muted">
                Current Age
              </label>
              <input
                id="current-age"
                name="currentAge"
                type="number"
                min={1}
                max={120}
                required
                value={currentAge}
                onChange={(event) => setCurrentAge(event.target.value)}
                placeholder="28"
                disabled={submitting}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="future-age" className="block text-sm font-medium text-mirror-muted">
                Future Age
              </label>
              <input
                id="future-age"
                name="futureAge"
                type="number"
                min={1}
                max={150}
                required
                value={futureAge}
                onChange={(event) => setFutureAge(event.target.value)}
                placeholder="38"
                disabled={submitting}
                className={inputClassName}
              />
              <p className="mt-1.5 text-xs text-mirror-subtle">
                The age of the future self you want to speak with.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="career-goal" className="block text-sm font-medium text-mirror-muted">
              Career Goal
            </label>
            <textarea
              id="career-goal"
              name="careerGoal"
              rows={3}
              required
              value={careerGoal}
              onChange={(event) => setCareerGoal(event.target.value)}
              placeholder="Lead a team doing meaningful work in tech..."
              disabled={submitting}
              className={`${inputClassName} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="health-goal" className="block text-sm font-medium text-mirror-muted">
              Health Goal
            </label>
            <textarea
              id="health-goal"
              name="healthGoal"
              rows={3}
              required
              value={healthGoal}
              onChange={(event) => setHealthGoal(event.target.value)}
              placeholder="Consistent energy, strong fitness, and restful sleep..."
              disabled={submitting}
              className={`${inputClassName} resize-none`}
            />
          </div>

          <div>
            <label htmlFor="dream-life" className="block text-sm font-medium text-mirror-muted">
              Dream Life
            </label>
            <textarea
              id="dream-life"
              name="dreamLife"
              rows={4}
              required
              value={dreamLife}
              onChange={(event) => setDreamLife(event.target.value)}
              placeholder="Calm mornings, deep relationships, financial freedom, and work that feels like purpose..."
              disabled={submitting}
              className={`${inputClassName} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-mirror-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving profile...' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
