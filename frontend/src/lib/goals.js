import { supabase } from './supabase'

export async function getGoals(userId) {
  const { data, error } = await supabase
    .from('goals')
    .select('id, title, category, progress, status, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('FETCH GOALS ERROR:', error)
    throw error
  }

  return data ?? []
}

export async function createGoal(userId, { title, category, progress = 0, status = 'in_progress' }) {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      title: title.trim(),
      category,
      progress,
      status,
    })
    .select()
    .single()

  if (error) {
    console.error('INSERT GOAL ERROR:', error)
    throw error
  }

  return data
}

export async function updateGoal(goalId, userId, { title, category, progress, status }) {
  const { data, error } = await supabase
    .from('goals')
    .update({
      title: title.trim(),
      category,
      progress,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('UPDATE GOAL ERROR:', error)
    throw error
  }

  return data
}

export async function deleteGoal(goalId, userId) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId)

  if (error) {
    console.error('DELETE GOAL ERROR:', error)
    throw error
  }
}

/**
 * Lightweight helper for the Dashboard Analytics panel.
 * Fetches only the minimal columns needed to compute goal statistics
 * and surface the top in-progress goals — avoids a full getGoals() payload.
 *
 * Returns:
 *   { total, completed, inProgress, topGoals }
 *
 * topGoals — up to 3 in-progress goals ordered by created_at desc.
 */
export async function getGoalSummary(userId) {
  const { data, error } = await supabase
    .from('goals')
    .select('id, title, category, progress, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GOAL SUMMARY ERROR:', error)
    throw error
  }

  const rows = data ?? []
  const total = rows.length
  const completed = rows.filter((g) => g.status === 'completed').length
  const inProgress = rows.filter((g) => g.status === 'in_progress').length

  const topGoals = rows
    .filter((g) => g.status === 'in_progress')
    .slice(0, 3)

  return { total, completed, inProgress, topGoals }
}
