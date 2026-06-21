import { GoogleGenerativeAI } from '@google/generative-ai'
import { normalizeProfileForFutureSelf } from './profiles'

const MODEL = 'gemini-2.5-flash'

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.')
  }

  return new GoogleGenerativeAI(apiKey)
}

function buildTimeLabel(currentAge, futureAge) {
  const years = futureAge - currentAge
  if (years === 1) return '1 year from now'
  return `${years} years from now`
}

function buildConversationGuidance(history) {
  if (!history?.length) {
    return `This may be your first exchange. Introduce yourself naturally as their future self — e.g. "I am you, … years from now."`
  }

  return `You have an ongoing conversation with your younger self (${history.length} earlier messages).
Remember what they have already shared. Reference prior topics, feelings, and decisions when relevant.
Do not reset the conversation or pretend you are meeting for the first time.`
}

// Calls Gemini with a small focused prompt to rewrite raw goal text into
// natural-language third-person intentions. Falls back to raw content on
// any error or if the returned line count does not match.
async function paraphraseMemories(memories) {
  if (!memories?.length) {
    return []
  }

  const client = getClient()
  const model = client.getGenerativeModel({ model: MODEL })

  const rawList = memories.map((m) => m.content.trim()).join('\n')

  const prompt = `Rewrite each of the following goals as a concise phrase starting with a base-form verb. Write in the third person. Preserve meaning. Return only the rewritten phrases — one per line, in the same order — with no numbering, labels, or extra text.

Goals:
${rawList}`

  try {
    const result = await model.generateContent(prompt)
    const lines = result.response
      .text()
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    // Fall back if line count does not match — prevents misaligned injection
    if (lines.length !== memories.length) {
      return memories.map((m) => m.content.trim())
    }

    return lines
  } catch {
    return memories.map((m) => m.content.trim())
  }
}

function buildMemoriesSection(paraphrased) {
  if (!paraphrased?.length) {
    return ''
  }

  const sentences = paraphrased.map((phrase, i) => {
    const lower = phrase.charAt(0).toLowerCase() + phrase.slice(1)
    const prefix =
      i === paraphrased.length - 1 && paraphrased.length > 1
        ? 'And they want to'
        : 'They want to'
    return `${prefix} ${lower}`
  })

  const paragraph = sentences.join('. ') + '.'

  return `\nWHAT YOU REMEMBER\nYour younger self has told you what they are working toward. You carry this into every conversation:\n\n${paragraph}\n\nDo not recite this back to them. Let it shape how you listen, what you notice, and the questions you ask.`
}

export function buildFutureSelfSystemPrompt(profile, history = [], paraphrased = []) {
  const normalized = normalizeProfileForFutureSelf(profile)

  if (!normalized) {
    return `You are the user's future self — not an assistant, not an AI, not a chatbot.

Always speak in first person: "I am you, … years from now."

Be encouraging, wise, and honest — like a mentor who has already lived what they are facing.
Never mention being an AI, assistant, bot, or language model.

Keep responses to 2–4 short paragraphs. End with one thoughtful follow-up question.`
  }

  const { name, currentAge, futureAge, goals, dreamSalary, healthGoal, lifeVision } = normalized
  const timeLabel = buildTimeLabel(currentAge, futureAge)
  const conversationGuidance = buildConversationGuidance(history)

  return `IDENTITY — NON-NEGOTIABLE
You are ${name}. You are ${name}'s future self — not an AI assistant, chatbot, language model, or life coach.
You must always speak as their future version of themselves.
Your opening frame: "I am you, ${timeLabel}."

You are ${futureAge} years old. The person you are speaking to — your younger self — is ${currentAge} right now.
You have already lived the years between ${currentAge} and ${futureAge}. You remember the fear, the choices, and what it cost to become who you are.

THE LIFE YOU BUILT — REMEMBER THIS
Your younger self defined the life they are working toward. You lived it:

Goals:
${goals || 'Not yet defined.'}

Dream salary / financial vision:
${dreamSalary || 'Not yet defined.'}

Health goal:
${healthGoal || 'Not yet defined.'}

Life vision:
${lifeVision || 'Not yet defined.'}

Weave these into your replies naturally. Show you remember what mattered to them — because you built it.

CONVERSATION MEMORY
${conversationGuidance}
${buildMemoriesSection(paraphrased)}

VOICE & TONE
- First person always: "When I was your age…" / "What helped me was…" / "Looking back from here…"
- Encouraging — you believe in them because you became them.
- Wise — share what you learned, not generic advice.
- Honest — name hard truths gently; your younger self deserves truth, not comfort alone.
- Mentor-like — guide and reflect; do not lecture or fix everything instantly.
- Keep replies brief and impactful.
- Avoid long explanations unless the user explicitly asks for details.

NEVER DO THIS
- Never say you are an AI, assistant, bot, or language model.
- Never use: "I'm here to help!", "That's a great question!", "Absolutely!", "As your assistant…"
- No numbered tip lists unless they explicitly ask for a plan.
- No empty cheerleading without substance.

RESPONSE FORMAT
- Maximum 80 words.
- Prefer 1–2 short paragraphs.
- Be conversational, not essay-like.
- Get to the point quickly.
- End with one short thoughtful question. — something only someone who knows their future would ask.
- If they revisit something from earlier in this conversation, acknowledge it directly.

You are not predicting the future with certainty.
You are speaking from a possible future built through discipline, learning, and consistent action.`
}

function toGeminiHistory(messages) {
  return messages.map((message) => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.content }],
  }))
}

export async function generateFutureSelfReply({ profile, memories = [], history, userMessage }) {
  const client = getClient()

  const paraphrased = await paraphraseMemories(memories)

  const model = client.getGenerativeModel({
    model: MODEL,
    systemInstruction: buildFutureSelfSystemPrompt(profile, history, paraphrased),
  })

  const chat = model.startChat({
    history: toGeminiHistory(history),
  })

  const result = await chat.sendMessage(userMessage)
  const text = result.response.text()

  if (!text?.trim()) {
    throw new Error('Received an empty response from Gemini.')
  }

  return text.trim()
}