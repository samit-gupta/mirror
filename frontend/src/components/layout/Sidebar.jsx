import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: '◈' },
  { to: ROUTES.CHAT, label: 'Chat', icon: '◎' },
  { to: ROUTES.JOURNAL, label: 'Journal', icon: '◇' },
  { to: ROUTES.SETUP, label: 'Setup', icon: '⚙' },
]

function NavItem({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
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

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        <div className="border-t border-mirror-border-subtle p-3">
          <div className="rounded-lg bg-mirror-elevated px-3 py-2.5">
            <p className="text-xs text-mirror-subtle">Signed in as</p>
            <p className="truncate text-sm font-medium">you@example.com</p>
          </div>
        </div>
      </aside>
    </>
  )
}
