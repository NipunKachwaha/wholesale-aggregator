import { useState, useRef, useEffect } from 'react'
import { gsap }                        from 'gsap'
import { useCollaboration }            from '../../hooks/useCollaboration'

interface Props {
  orderId: string
  onClose: () => void
}

export default function CollabOrderEditor({ orderId, onClose }: Props) {
  const roomId = `order_${orderId}`
  const {
    users, chat, focusMap, connected,
    sendFieldFocus, sendFieldBlur,
    sendChat, sendChange,
  } = useCollaboration(roomId)

  const [notes,    setNotes]    = useState('')
  const [chatMsg,  setChatMsg]  = useState('')
  const [showChat, setShowChat] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const chatRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.4)' }
    )
  }, [])

  // Scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chat])

  const handleFieldFocus = (fieldId: string) => sendFieldFocus(fieldId)
  const handleFieldBlur  = (fieldId: string) => sendFieldBlur(fieldId)

  const handleChange = (fieldId: string, value: string) => {
    setNotes(value)
    sendChange(fieldId, value)
  }

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMsg.trim()) return
    sendChat(chatMsg)
    setChatMsg('')
  }

  // Field border color — who is editing?
  const getFieldStyle = (fieldId: string) => {
    const focus = focusMap[fieldId]
    if (!focus) return 'border-slate-300 dark:border-slate-600'
    return `border-2`
  }

  const getFieldBorderColor = (fieldId: string): string => {
    const focus = focusMap[fieldId]
    if (!focus) return ''
    return focus.color
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <div>
            <h2 className="text-white font-semibold">
              🤝 Collaborative Order Editor
            </h2>
            <p className="text-blue-100 text-xs mt-0.5">
              Order #{orderId.slice(0, 8)}
            </p>
          </div>

          {/* Online Users */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {users.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  title={u.name}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: u.color }}
                >
                  {u.name[0]}
                </div>
              ))}
            </div>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white text-xs">{users.length} online</span>
            <button
              onClick={() => setShowChat(!showChat)}
              className="relative ml-2 text-white/80 hover:text-white"
            >
              💬
              {chat.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {chat.length > 9 ? '9' : chat.length}
                </span>
              )}
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white ml-1">✕</button>
          </div>
        </div>

        <div className="flex">
          {/* Editor */}
          <div className="flex-1 p-6 space-y-4">
            {/* Notes field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Order Notes
                {focusMap['notes'] && (
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ background: focusMap['notes'].color }}
                  >
                    {focusMap['notes'].name} is editing
                  </span>
                )}
              </label>
              <textarea
                value={notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                onFocus={() => handleFieldFocus('notes')}
                onBlur={() => handleFieldBlur('notes')}
                rows={4}
                placeholder="Add order notes..."
                className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-all
                  bg-slate-50 dark:bg-slate-700 dark:text-white
                  ${getFieldStyle('notes')}`}
                style={{
                  borderColor: getFieldBorderColor('notes') || undefined
                }}
              />
            </div>

            {/* Status field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
                {focusMap['status'] && (
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ background: focusMap['status'].color }}
                  >
                    {focusMap['status'].name}
                  </span>
                )}
              </label>
              <select
                onFocus={() => handleFieldFocus('status')}
                onBlur={() => handleFieldBlur('status')}
                className={`w-full px-3 py-2 rounded-lg text-sm
                  bg-slate-50 dark:bg-slate-700 dark:text-white
                  border focus:outline-none transition-all
                  ${getFieldStyle('status')}`}
                style={{
                  borderColor: getFieldBorderColor('status') || undefined
                }}
              >
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Save */}
            <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              💾 Save Changes
            </button>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="w-64 border-l border-slate-100 dark:border-slate-700 flex flex-col">
              <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  💬 Team Chat
                </h4>
              </div>

              <div
                ref={chatRef}
                className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64"
              >
                {chat.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No messages yet
                  </p>
                ) : (
                  chat.map((msg, i) => (
                    <div key={i} className="flex gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white"
                        style={{ background: msg.color }}
                      >
                        {msg.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {msg.name}
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 break-words">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleChat} className="p-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-1">
                  <input
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 px-2 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    →
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}