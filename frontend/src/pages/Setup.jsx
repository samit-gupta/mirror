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

  const [currentStep, setCurrentStep] = useState(1)
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

  // Validate only the fields belonging to the given step number.
  function validateStep(step) {
    if (step === 1) {
      if (!name.trim()) return 'Full name is required.'
      const current = Number(currentAge)
      if (!currentAge || Number.isNaN(current) || current < 1 || current > 120)
        return 'Enter a valid current age between 1 and 120.'
      const future = Number(futureAge)
      if (!futureAge || Number.isNaN(future) || future < 1 || future > 150)
        return 'Enter a valid future age between 1 and 150.'
      if (future <= current)
        return 'Future age must be greater than your current age.'
      return null
    }

    if (step === 2) {
      if (!careerGoal.trim()) return 'Career goal is required.'
      if (!healthGoal.trim()) return 'Health goal is required.'
      return null
    }

    if (step === 3) {
      if (!dreamLife.trim()) return 'Dream life description is required.'
      return null
    }

    return null
  }

  function handleNext(event) {
  if (event) {
    event.preventDefault()
  }

  setError('')

  const stepError = validateStep(currentStep)

  if (stepError) {
    setError(stepError)
    return
  }

  setCurrentStep((s) => s + 1)
}

  function handleBack() {
    setError('')
    setCurrentStep((s) => s - 1)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    // Full validation as a safety net before saving.
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

      {/* Step progress bar */}
      <div className="mb-8 flex gap-2">
        {steps.map((step) => (
          <div key={step.id} className="flex-1">
            <div
              className={`h-1 rounded-full transition-colors duration-300 ${
                step.id <= currentStep ? 'bg-mirror-accent' : 'bg-mirror-border'
              }`}
            />
            <p
              className={`mt-2 text-xs transition-colors duration-300 ${
                step.id === currentStep
                  ? 'font-medium text-mirror-accent'
                  : step.id < currentStep
                    ? 'text-mirror-muted'
                    : 'text-mirror-subtle'
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-mirror-border bg-mirror-surface p-6 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <AuthAlert variant="error" message={error} />
          <AuthAlert variant="success" message={success} />

          {/* ── Step 1: About You ── */}
          {currentStep === 1 && (
            <>
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
            </>
          )}

          {/* ── Step 2: Your Future ── */}
          {currentStep === 2 && (
            <>
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
            </>
          )}

          {/* ── Step 3: Your Vision ── */}
          {currentStep === 3 && (
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
          )}

          {/* ── Navigation buttons ── */}
          <div className={`flex gap-3 ${currentStep > 1 ? 'flex-row' : 'flex-col'}`}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 rounded-lg border border-mirror-border py-2.5 text-sm font-semibold text-mirror-muted transition-colors hover:border-mirror-accent hover:text-mirror-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={(event) => handleNext(event)}
                disabled={submitting}
                className="flex-1 rounded-lg bg-mirror-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-mirror-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving profile...' : 'Save and continue'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
