import ChatBubble from '../components/ui/ChatBubble'

const placeholderMessages = [
  {
    id: 1,
    message: 'Hey — I have been thinking about the career change you mentioned. What is holding you back?',
    sender: 'future-self',
    timestamp: '10:32 AM',
  },
  {
    id: 2,
    message: 'I guess I am afraid of starting over. What if I fail?',
    sender: 'user',
    timestamp: '10:33 AM',
  },
  {
    id: 3,
    message:
      'I remember that fear. But here is what I learned: the version of you who never tried regrets it far more than the one who stumbled along the way. What would you tell a friend in your position?',
    sender: 'future-self',
    timestamp: '10:33 AM',
  },
]

export default function Chat() {
  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col lg:h-svh">
      {/* Chat header */}
      <header className="shrink-0 border-b border-mirror-border-subtle px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-mirror-accent to-mirror-accent-muted text-sm font-semibold text-white">
            F
          </div>
          <div>
            <h1 className="font-semibold">Future You</h1>
            <p className="text-xs text-mirror-subtle">5 years ahead · Online</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {placeholderMessages.map((msg) => (
            <ChatBubble key={msg.id} {...msg} />
          ))}
        </div>
      </div>

      {/* Input */}
      <footer className="shrink-0 border-t border-mirror-border-subtle px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl gap-3">
          <input
            type="text"
            placeholder="Share what's on your mind..."
            className="flex-1 rounded-xl border border-mirror-border bg-mirror-elevated px-4 py-3 text-sm placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent"
          />
          <button
            type="button"
            className="shrink-0 rounded-xl bg-mirror-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  )
}
