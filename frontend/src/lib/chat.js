import { supabase } from './supabase'
import { generateFutureSelfReply } from './gemini'
import { getMemories } from './memories'
import { getProfile } from './profiles'

export function formatMessageTime(isoString) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoString))
}

export function mapMessageForUi(message) {
  return {
    id: message.id,
    message: message.content,
    sender: message.role === 'user' ? 'user' : 'future-self',
    timestamp: formatMessageTime(message.created_at),
    createdAt: message.created_at,
  }
}

export async function getOrCreateConversation(userId) {
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) {
    throw fetchError
  }

  if (existing) {
    return existing
  }

  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title: 'Future Self' })
    .select('id, title, created_at, updated_at')
    .single()

  if (createError) {
    throw createError
  }

  return created
}

export async function getConversationMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function saveMessage({ conversationId, userId, role, content }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
      content,
    })
    .select('id, role, content, created_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function sendChatMessage({ userId, conversationId, content }) {
  const trimmed = content.trim()

  if (!trimmed) {
    throw new Error('Message cannot be empty.')
  }

  const [profile, memories] = await Promise.all([
    getProfile(userId),
    getMemories(userId),
  ])

  if (!profile) {
    throw new Error('Complete your profile setup before chatting with your future self.')
  }

  const history = await getConversationMessages(conversationId)

  const userMessage = await saveMessage({
    conversationId,
    userId,
    role: 'user',
    content: trimmed,
  })

  const aiContent = await generateFutureSelfReply({
    profile,
    memories,
    history,
    userMessage: trimmed,
    userId,
  })

  const assistantMessage = await saveMessage({
    conversationId,
    userId,
    role: 'assistant',
    content: aiContent,
  })

  return {
    userMessage,
    assistantMessage,
  }
}

export async function getConversationCount(userId) {
  const { count, error } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return count ?? 0
}

export async function getRecentInsights(userId, limit = 3) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, created_at')
    .eq('user_id', userId)
    .eq('role', 'assistant')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []).map((message) => ({
    id: message.id,
    text: message.content,
    date: formatRelativeDate(message.created_at),
  }))
}

function formatRelativeDate(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export async function getActiveDaysCount(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('created_at')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  const uniqueDays = new Set(
    (data ?? []).map((row) => new Date(row.created_at).toDateString()),
  )

  return uniqueDays.size
}
