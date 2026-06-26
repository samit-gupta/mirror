import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import AuthAlert from '../auth/AuthAlert'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../contexts/AuthContext'
import { getAuthErrorMessage } from '../../lib/auth'
import { createConversation, getConversations } from '../../lib/chat'

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: '◈' },
  { to: ROUTES.CHAT, label: 'Chat', icon: '◎', end: true },
  { to: ROUTES.JOURNAL, label: 'Journal', icon: '◇' },
  { to: ROUTES.MEMORIES, label: 'Memory Vault', icon: '❂' },
  { to: ROUTES.GOALS, label: 'Goals', icon: '✦' },
  { to: ROUTES.SETUP, label: 'Setup', icon: '⚙' },
]

function NavItem({ to, label, icon, onClick, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? 'bg-mirror-accent/15 text-mirror-accent'
            : 'text-mirror-muted hover:bg-mirror-elevated hover:text-mirror-text'
        }`
      }
    >
      <span className="text-base opacity-70" aria-hidden="true">
        {icon}
      </span>
      {label}
    </NavLink>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [conversations, setConversations] = useState([])

  const displayEmail = user?.email ?? 'you@example.com'
  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User'

  useEffect(() => {
    if (!user) return
    getConversations(user.id)
      .then(setConversations)
      .catch(() => {})
  }, [user])

  async function handleNewChat() {
    try {
      const conv = await createConversation(user.id)
      setConversations((prev) => [conv, ...prev])
      navigate(`/chat/${conv.id}`)
      onClose()
    } catch {
      // Non-fatal — sidebar stays open and user can retry.
    }
  }

  async function handleLogout() {
    setLogoutError('')
    setLoggingOut(true)

    try {
      await signOut()
      onClose()
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      setLogoutError(getAuthErrorMessage(err))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-mirror-border-subtle bg-mirror-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center border-b border-mirror-border-subtle px-4 sm:h-16">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mirror-accent/20 text-mirror-accent">
              M
            </span>
            Mirror
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}

          {/* Conversation list */}
          <div className="mt-4 border-t border-mirror-border-subtle pt-3">
            <div className="mb-1.5 flex items-center justify-between px-2">
              <span className="text-xs font-medium uppercase tracking-wider text-mirror-subtle">
                Chats
              </span>
              <button
                type="button"
                onClick={handleNewChat}
                title="New chat"
                className="rounded-md p-1 text-mirror-subtle transition-colors hover:bg-mirror-elevated hover:text-mirror-text"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div className="space-y-0.5">
              {conversations.map((conv) => (
                <NavLink
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block truncate rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-mirror-accent/15 text-mirror-accent'
                        : 'text-mirror-muted hover:bg-mirror-elevated hover:text-mirror-text'
                    }`
                  }
                >
                  {conv.title}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="space-y-3 border-t border-mirror-border-subtle p-3">
          <AuthAlert variant="error" message={logoutError} />

          <div className="rounded-lg bg-mirror-elevated px-3 py-2.5">
            <p className="text-xs text-mirror-subtle">Signed in as</p>
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-mirror-muted">{displayEmail}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-lg border border-mirror-border px-3 py-2 text-sm font-medium text-mirror-muted transition-colors hover:bg-mirror-elevated hover:text-mirror-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? 'Signing out...' : 'Log out'}
          </button>
        </div>
      </aside>
    </>
  )
}
