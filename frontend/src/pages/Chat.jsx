import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthAlert from '../components/auth/AuthAlert'
import ChatBubble from '../components/ui/ChatBubble'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../contexts/AuthContext'
import { getAuthErrorMessage } from '../lib/auth'
import {
  getConversationMessages,
  getOrCreateConversation,
  mapMessageForUi,
  sendChatMessage,
} from '../lib/chat'
import { getProfile } from '../lib/profiles'

const inputClassName =
  'flex-1 rounded-xl border border-mirror-border bg-mirror-elevated px-4 py-3 text-sm text-mirror-text placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent disabled:cursor-not-allowed disabled:opacity-60'

export default function Chat() {
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }

    let cancelled = false

    async function loadChat() {
      setLoading(true)
      setError('')

      try {
        const [userProfile, conversation] = await Promise.all([
          getProfile(user.id),
          getOrCreateConversation(user.id),
        ])

        if (cancelled) return

        setProfile(userProfile)
        setConversationId(conversation.id)

        const rows = await getConversationMessages(conversation.id)

        if (cancelled) return

        setMessages(rows.map(mapMessageForUi))
      } catch (err) {
        if (!cancelled) {
          setError(getAuthErrorMessage(err))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadChat()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages, sending, scrollToBottom])

  async function handleSend(event) {
    event.preventDefault()

    const trimmed = input.trim()

    if (!trimmed || sending || !conversationId || !user) {
      return
    }

    setSending(true)
    setError('')
    setInput('')

    try {
      const { userMessage, assistantMessage } = await sendChatMessage({
        userId: user.id,
        conversationId,
        content: trimmed,
      })

      setMessages((prev) => [
        ...prev,
        mapMessageForUi(userMessage),
        mapMessageForUi(assistantMessage),
      ])
    } catch (err) {
      setInput(trimmed)
      setError(getAuthErrorMessage(err))
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  const futureAge = profile?.future_age
  const yearsAhead =
    profile?.future_age && profile?.current_age
      ? profile.future_age - profile.current_age
      : null

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col lg:h-svh">
      <header className="shrink-0 border-b border-mirror-border-subtle px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-mirror-accent to-mirror-accent-muted text-sm font-semibold text-white">
            {profile?.name?.charAt(0)?.toUpperCase() ?? 'F'}
          </div>
          <div>
            <h1 className="font-semibold">Future You</h1>
            <p className="text-xs text-mirror-subtle">
              {yearsAhead
                ? `${yearsAhead} years ahead · Age ${futureAge}`
                : 'Complete setup to personalize'}
              {sending ? ' · Thinking...' : ' · Online'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-mirror-border border-t-mirror-accent" />
              <p className="text-sm text-mirror-muted">Loading conversation...</p>
            </div>
          ) : (
            <>
              <AuthAlert variant="error" message={error} />

              {!profile && (
                <div className="rounded-xl border border-mirror-border bg-mirror-surface p-6 text-center">
                  <p className="text-sm text-mirror-muted">
                    Set up your profile so your future self knows who you are becoming.
                  </p>
                  <Link
                    to={ROUTES.SETUP}
                    className="mt-4 inline-block rounded-lg bg-mirror-accent px-4 py-2 text-sm font-semibold text-white hover:bg-mirror-accent-hover"
                  >
                    Complete setup
                  </Link>
                </div>
              )}

              {profile && messages.length === 0 && !error && (
                <div className="rounded-xl border border-dashed border-mirror-border bg-mirror-surface/50 p-8 text-center">
                  <p className="text-sm font-medium text-mirror-text">
                    No messages yet
                  </p>
                  <p className="mt-2 text-sm text-mirror-muted">
                    Say hello to your future self. What is on your mind today?
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <ChatBubble key={msg.id} {...msg} />
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-mirror-border bg-mirror-elevated px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-mirror-muted [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-mirror-muted [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-mirror-muted" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-mirror-border-subtle px-4 py-4 sm:px-6">
        <form onSubmit={handleSend} className="mx-auto flex max-w-3xl gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              profile
                ? "Share what's on your mind..."
                : 'Complete setup before chatting...'
            }
            disabled={loading || sending || !profile || !conversationId}
            className={inputClassName}
          />
          <button
            type="submit"
            disabled={loading || sending || !input.trim() || !profile || !conversationId}
            className="shrink-0 rounded-xl bg-mirror-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </footer>
    </div>
  )
}
