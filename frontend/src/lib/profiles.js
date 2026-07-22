import { supabase } from './supabase'
import { saveMemory } from './memories'
import { clearParaphraseCache } from './gemini'

export function buildDreamLife({ careerGoal, healthGoal, dreamLife }) {
  const sections = []

  if (careerGoal.trim()) {
    sections.push(`Career Goal:\n${careerGoal.trim()}`)
  }

  if (healthGoal.trim()) {
    sections.push(`Health Goal:\n${healthGoal.trim()}`)
  }

  if (dreamLife.trim()) {
    sections.push(`Dream Life:\n${dreamLife.trim()}`)
  }

  return sections.join('\n\n')
}

export function validateProfileForm({
  name,
  currentAge,
  futureAge,
  careerGoal,
  healthGoal,
  dreamLife,
}) {
  if (!name.trim()) {
    return 'Full name is required.'
  }

  const current = Number(currentAge)
  const future = Number(futureAge)

  if (!currentAge || Number.isNaN(current) || current < 1 || current > 120) {
    return 'Enter a valid current age between 1 and 120.'
  }

  if (!futureAge || Number.isNaN(future) || future < 1 || future > 150) {
    return 'Enter a valid future age between 1 and 150.'
  }

  if (future <= current) {
    return 'Future age must be greater than your current age.'
  }

  if (!careerGoal.trim()) {
    return 'Career goal is required.'
  }

  if (!healthGoal.trim()) {
    return 'Health goal is required.'
  }

  if (!dreamLife.trim()) {
    return 'Dream life description is required.'
  }

  return null
}

export async function saveProfile({
  userId,
  name,
  currentAge,
  futureAge,
  careerGoal,
  healthGoal,
  dreamLife,
}) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        name: name.trim(),
        current_age: Number(currentAge),
        future_age: Number(futureAge),
        dream_life: buildDreamLife({ careerGoal, healthGoal, dreamLife }),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single()

    if (error) {
      throw error
    }

    await supabase
    .from('memories')
    .delete()
    .eq('user_id', userId)
    .eq('memory_type', 'goal')

    // Invalidate the paraphrase cache immediately after the old memories are
    // deleted and before any new ones are written. This guarantees the cache
    // is cleared even if a subsequent saveMemory() call throws — preventing
    // the AI from receiving stale paraphrased phrases that no longer match
    // the database state.
    clearParaphraseCache(userId)

    await saveMemory({
      userId,
      memoryType: 'goal',
      content: careerGoal.trim(),
      importance: 5,
    })

    await saveMemory({
      userId,
      memoryType: 'goal',
      content: healthGoal.trim(),
      importance: 5,
    })

    await saveMemory({
      userId,
      memoryType: 'goal',
      content: dreamLife.trim(),
      importance: 4,
    })

    return data
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, current_age, future_age, dream_life')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}
export function parseDreamLifeFields(dreamLife) {
  if (!dreamLife?.trim()) {
    return { goals: '', healthGoal: '', lifeVision: '' }
  }

  const goalsMatch = dreamLife.match(/Career Goal:\n([\s\S]*?)(?:\n\n|$)/)
  const healthMatch = dreamLife.match(/Health Goal:\n([\s\S]*?)(?:\n\n|$)/)
  const visionMatch = dreamLife.match(/Dream Life:\n([\s\S]*)$/)

  if (goalsMatch || healthMatch || visionMatch) {
    return {
      goals: goalsMatch?.[1]?.trim() ?? '',
      healthGoal: healthMatch?.[1]?.trim() ?? '',
      lifeVision: visionMatch?.[1]?.trim() ?? '',
    }
  }

  return {
    goals: '',
    healthGoal: '',
    lifeVision: dreamLife.trim(),
  }
}

export function normalizeProfileForFutureSelf(profile) {
  if (!profile) {
    return null
  }

  const parsed = parseDreamLifeFields(profile.dream_life)

  return {
    name: profile.name?.trim() || 'Friend',
    currentAge: profile.current_age,
    futureAge: profile.future_age,
    goals: parsed.goals,
    healthGoal: parsed.healthGoal,
    lifeVision: parsed.lifeVision,
  }
}