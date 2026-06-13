import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL = 'gemini-2.5-flash'

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  console.log("Gemini Key:", import.meta.env.VITE_GEMINI_API_KEY)

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.')
  }

  return new GoogleGenerativeAI(apiKey)
}

export function buildFutureSelfSystemPrompt(profile) {
  if (!profile) {
    return `You are the user's future self — wiser, calmer, and further along in life.
Speak in first person as their future self. Be warm, reflective, and encouraging.
Keep responses concise: 2–4 short paragraphs. Ask thoughtful follow-up questions when helpful.`
  }

  const yearsAhead = profile.future_age - profile.current_age

  return `You are ${profile.name}'s future self, ${yearsAhead} years ahead in life.
You are now ${profile.future_age} years old. The user is currently ${profile.current_age}.

Here is the life they are working toward:
${profile.dream_life}

Speak in first person as their future self. Reference their goals naturally.
Be warm, wise, and honest — like a mentor who has lived through what they are facing.
Keep responses concise: 2–4 short paragraphs. Ask one thoughtful follow-up question when it fits.`
}

function toGeminiHistory(messages) {
  return messages.map((message) => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.content }],
  }))
}

export async function generateFutureSelfReply({ profile, history, userMessage }) {
  const client = getClient()
  const model = client.getGenerativeModel({
    model: MODEL,
    systemInstruction: buildFutureSelfSystemPrompt(profile),
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
