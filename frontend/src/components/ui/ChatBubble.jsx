export default function ChatBubble({
  message,
  sender = 'future-self',
  timestamp = 'Just now',
}) {
  const isUser = sender === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] ${
          isUser ? 'items-end' : 'items-start'
        } flex flex-col gap-1`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-br-md bg-mirror-accent text-white'
              : 'rounded-bl-md border border-mirror-border bg-mirror-elevated text-mirror-text'
          }`}
        >
          {message}
        </div>
        <span className="px-1 text-xs text-mirror-subtle">
          {isUser ? 'You' : 'Future You'} · {timestamp}
        </span>
      </div>
    </div>
  )
}
