import { supabase } from './supabase'

export async function saveMemory({
  userId,
  memoryType,
  content,
  importance = 1,
}) {
  const { error } = await supabase
    .from('memories')
    .insert({
      user_id: userId,
      memory_type: memoryType,
      content,
      importance,
    })

  if (error) {
    console.error('MEMORY INSERT ERROR:', error)
    throw error
  }
}

export async function getMemories(userId, { limit = 20 } = {}) {
  const { data, error } = await supabase
    .from('memories')
    .select('memory_type, content, importance')
    .eq('user_id', userId)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data ?? []
}