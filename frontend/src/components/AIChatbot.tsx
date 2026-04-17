import { useState, useRef, useEffect, useCallback } from 'react'
import { gsap }            from 'gsap'
import {
  sendMessageStream,
  ChatMessage
} from '../services/chatbot.service'

const QUICK_PROMPTS = [
  'Show pending orders',
  'RICE-001 stock kitna hai?',
  'Price optimize karo',
  'Vendor sync status',
  'Analytics summary',
  'Low stock items',
]

interface Message extends ChatMessage {
  id:        string
  timestamp: Date
  streaming?: boolean
}

export default function AIChatbot() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id:        'welcome',
      role:      'assistant',
      content:   '👋 Namaste! Main WholesaleAI hoon. Aap mujhse orders, products, vendors, ya analytics ke baare mein pooch sakte hain!',
      timestamp: new Date(),
    }
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const chatRef   = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const bubbleRef = useRef<HTMLButtonElement>(null)
  const panelRef  = useRef<HTMLDivElement>(null)

  // Bubble pulse animation
  useEffect(() => {
    gsap.to(bubbleRef.current, {
      scale:    1.1,
      duration: 1,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
    })
  }, [])

  // Panel open/close animation
  const handleToggle = () => {
    if (!open) {
      setOpen(true)
      setTimeout(() => {
        gsap.fromTo(panelRef.current,
          { y: 20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.4)' }
        )
        inputRef.current?.focus()
      }, 10)
    } else {
      gsap.to(panelRef.current, {
        y: 20, opacity: 0, scale: 0.95, duration: 0.2,
        onComplete: () => setOpen(false)
      })
    }
  }

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim()
    if (!content || loading) return

    setInput('')
    const msgId = `msg_${Date.now()}`

    // User message add karo
    const userMsg: Message = {
      id:        msgId,
      role:      'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    // AI response placeholder
    const aiId   = `ai_${Date.now()}`
    const aiMsg: Message = {
      id:        aiId,
      role:      'assistant',
      content:   '',
      timestamp: new Date(),
      streaming: true,
    }
    setMessages((prev) => [...prev, aiMsg])

    // History banao (last 10 messages)
    const history = messages.slice(-10).map(({ role, content }) => ({
      role, content
    }))
    history.push({ role: 'user', content })

    // Stream response
    await sendMessageStream(
      history,
      (chunk) => {
        setMessages((prev) => prev.map((m) =>
          m.id === aiId
            ? { ...m, content: m.content + chunk }
            : m
        ))
      },
      () => {
        setMessages((prev) => prev.map((m) =>
          m.id === aiId ? { ...m, streaming: false } : m
        ))
        setLoading(false)
      }
    )
  }, [input, loading, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      id:        'welcome',
      role:      'assistant',
      content:   '👋 Chat clear ho gaya! Kya help chahiye?',
      timestamp: new Date(),
    }])
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute bottom-16 right-0 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">
              🤖
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">WholesaleAI</p>
              <p className="text-blue-100 text-xs">
                {loading ? '⟳ Thinking...' : '● Online'}
              </p>
            </div>
            <button onClick={clearChat}
                    className="text-white/70 hover:text-white text-xs">
              Clear
            </button>
            <button onClick={handleToggle}
                    className="text-white/70 hover:text-white text-lg ml-1">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={chatRef}
               className="h-72 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white mr-2 flex-shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm rounded-bl-sm'
                }`}>
                  {msg.content || (msg.streaming && (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700 flex gap-1 overflow-x-auto">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="flex-shrink-0 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-slate-100 dark:border-slate-700">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kuch bhi poochho..."
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        ref={bubbleRef}
        onClick={handleToggle}
        className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-2xl hover:shadow-xl transition-shadow"
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  )
}