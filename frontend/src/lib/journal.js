import { supabase } from './supabase'

export const JOURNAL_MOODS = ['Reflective', 'Hopeful', 'Curious', 'Grateful', 'Uncertain']

export const MOOD_COLORS = {
  Reflective: 'bg-blue-500/15 text-blue-400',
  Hopeful: 'bg-emerald-500/15 text-emerald-400',
  Curious: 'bg-amber-500/15 text-amber-400',
  Grateful: 'bg-violet-500/15 text-violet-400',
  Uncertain: 'bg-zinc-500/15 text-zinc-400',
}

export function formatJournalDate(isoString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString))
}

export function getExcerpt(content, maxLength = 140) {
  const trimmed = content.trim()

  if (!trimmed) {
    return 'No content yet.'
  }

  if (trimmed.length <= maxLength) {
    return trimmed
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}…`
}

export function mapJournalForList(journal) {
  return {
    id: journal.id,
    title: journal.title,
    excerpt: getExcerpt(journal.content),
    mood: journal.mood,
    date: formatJournalDate(journal.updated_at ?? journal.created_at),
    updatedAt: journal.updated_at,
    createdAt: journal.created_at,
  }
}

export async function getJournals(userId) {
  const { data, error } = await supabase
    .from('journals')
    .select('id, title, content, mood, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getJournal(journalId, userId) {
  const { data, error } = await supabase
    .from('journals')
    .select('id, title, content, mood, created_at, updated_at')
    .eq('id', journalId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function createJournal(userId, overrides = {}) {
  const { data, error } = await supabase
    .from('journals')
    .insert({
      user_id: userId,
      title: overrides.title ?? 'Untitled',
      content: overrides.content ?? '',
      mood: overrides.mood ?? 'Reflective',
    })
    .select('id, title, content, mood, created_at, updated_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateJournal(journalId, userId, { title, content, mood }) {
  const { data, error } = await supabase
    .from('journals')
    .update({
      title: title.trim() || 'Untitled',
      content: content ?? '',
      mood: mood ?? 'Reflective',
      updated_at: new Date().toISOString(),
    })
    .eq('id', journalId)
    .eq('user_id', userId)
    .select('id, title, content, mood, created_at, updated_at')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getJournalCount(userId) {
  const { count, error } = await supabase
    .from('journals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return count ?? 0
}

export async function getExtractionHash(journalId, userId) {
  const { data, error } = await supabase
    .from('journals')
    .select('last_processed_content_hash')
    .eq('id', journalId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.last_processed_content_hash ?? null
}

export async function setExtractionHash(journalId, userId, hash) {
  const { error } = await supabase
    .from('journals')
    .update({ last_processed_content_hash: hash })
    .eq('id', journalId)
    .eq('user_id', userId)

  if (error) throw error
}
