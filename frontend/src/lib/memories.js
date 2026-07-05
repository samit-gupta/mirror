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
    .select('id, memory_type, content, importance, created_at')
    .eq('user_id', userId)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return data ?? []
}

export async function updateMemory(memoryId, userId, content) {
  const { error } = await supabase
    .from('memories')
    .update({ content })
    .eq('id', memoryId)
    .eq('user_id', userId)

  if (error) {
    console.error('MEMORY UPDATE ERROR:', error)
    throw error
  }
}

export async function deleteMemory(memoryId, userId) {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)
    .eq('user_id', userId)

  if (error) {
    console.error('MEMORY DELETE ERROR:', error)
    throw error
  }
}