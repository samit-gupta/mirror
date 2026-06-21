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