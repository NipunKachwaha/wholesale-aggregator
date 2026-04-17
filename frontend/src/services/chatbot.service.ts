// Groq API via direct fetch
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// NOTE: Real app mein backend se call karo — API key expose mat karo
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''

export interface ChatMessage {
  role:    'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `You are WholesaleAI, an intelligent assistant for the Wholesale Aggregator system.

You help users with:
- Order management (create, track, consolidate orders)
- Product catalog (search, pricing, stock)
- Vendor management (sync feeds, reliability)
- Analytics (demand forecasting, price optimization)
- System navigation

Always respond in the same language as the user (Hindi or English).
Be concise, helpful, and professional.
For specific data queries, suggest using the NL Query feature.

Current system has:
- Products: 1,842 active items
- Vendors: 12 registered
- Orders: 248 this month
- Services: All running healthy`

export const sendMessage = async (
  messages: ChatMessage[]
): Promise<string> => {
  if (!GROQ_API_KEY) {
    return "⚠️ Groq API key configure nahi hai. `.env` mein `VITE_GROQ_API_KEY` set karo."
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages:    [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens:  1024,
        temperature: 0.7,
        stream:      false,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'API error')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response'

  } catch (error: any) {
    console.error('Groq API error:', error)
    return `❌ Error: ${error.message}`
  }
}

// Streaming version
export const sendMessageStream = async (
  messages: ChatMessage[],
  onChunk:  (chunk: string) => void,
  onDone:   () => void
): Promise<void> => {
  if (!GROQ_API_KEY) {
    onChunk("⚠️ Groq API key configure nahi hai.")
    onDone()
    return
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages:    [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens:  1024,
        temperature: 0.7,
        stream:      true,
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    while (reader) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') { onDone(); return }
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices[0]?.delta?.content
          if (content) onChunk(content)
        } catch {}
      }
    }
    onDone()
  } catch (error: any) {
    onChunk(`❌ Error: ${error.message}`)
    onDone()
  }
}