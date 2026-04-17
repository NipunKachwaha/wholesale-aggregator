import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

const COLLAB_URL = 'ws://localhost:3004/collab'

interface CollabUser {
  id:     string
  name:   string
  color:  string
  cursor?: { x: number; y: number }
}

interface ChatMessage {
  userId:    string
  name:      string
  color:     string
  message:   string
  timestamp: string
}

interface FieldFocus {
  userId:  string
  name:    string
  color:   string
  fieldId: string
}

export const useCollaboration = (roomId: string) => {
  const { user }               = useSelector((s: RootState) => s.auth)
  const [users,   setUsers]    = useState<CollabUser[]>([])
  const [chat,    setChat]     = useState<ChatMessage[]>([])
  const [focusMap, setFocusMap] = useState<Record<string, FieldFocus>>({})
  const [connected, setConnected] = useState(false)
  const wsRef                  = useRef<WebSocket | null>(null)
  const myId                   = useRef<string>('')

  const connect = useCallback(() => {
    const ws = new WebSocket(COLLAB_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      ws.send(JSON.stringify({
        type: 'join',
        roomId,
        data: {
          roomId,
          userId:    user?.id,
          userName:  `${user?.firstName} ${user?.lastName}`,
          userEmail: user?.email,
        },
      }))
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      switch (msg.type) {
        case 'joined':
          myId.current = msg.data.userId
          setUsers(msg.data.users || [])
          break

        case 'user_joined':
          setUsers((prev) => [...prev.filter((u) => u.id !== msg.data.userId), {
            id:    msg.data.userId,
            name:  msg.data.name,
            color: msg.data.color,
          }])
          break

        case 'user_left':
          setUsers((prev) => prev.filter((u) => u.id !== msg.userId))
          setFocusMap((prev) => {
            const next = { ...prev }
            delete next[msg.userId]
            return next
          })
          break

        case 'cursor_move':
          setUsers((prev) => prev.map((u) =>
            u.id === msg.userId ? { ...u, cursor: msg.data.cursor } : u
          ))
          break

        case 'field_focus':
          setFocusMap((prev) => ({
            ...prev,
            [msg.data.fieldId]: {
              userId:  msg.userId,
              name:    msg.name,
              color:   msg.color,
              fieldId: msg.data.fieldId,
            },
          }))
          break

        case 'field_blur':
          setFocusMap((prev) => {
            const next = { ...prev }
            if (next[msg.data.fieldId]?.userId === msg.userId) {
              delete next[msg.data.fieldId]
            }
            return next
          })
          break

        case 'chat':
          setChat((prev) => [...prev, {
            userId:    msg.userId,
            name:      msg.name,
            color:     msg.color,
            message:   msg.data.message,
            timestamp: msg.data.timestamp,
          }])
          break
      }
    }

    ws.onclose = () => {
      setConnected(false)
      setTimeout(connect, 3000)
    }
  }, [roomId, user])

  useEffect(() => {
    connect()
    return () => wsRef.current?.close()
  }, [connect])

  const sendFieldFocus = useCallback((fieldId: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'field_focus', roomId, data: { fieldId }
    }))
  }, [roomId])

  const sendFieldBlur = useCallback((fieldId: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'field_blur', roomId, data: { fieldId }
    }))
  }, [roomId])

  const sendChat = useCallback((message: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'chat', roomId, data: { message }
    }))
  }, [roomId])

  const sendChange = useCallback((fieldId: string, value: any) => {
    wsRef.current?.send(JSON.stringify({
      type: 'doc_change', roomId, data: { fieldId, value }
    }))
  }, [roomId])

  return {
    users,
    chat,
    focusMap,
    connected,
    myId: myId.current,
    sendFieldFocus,
    sendFieldBlur,
    sendChat,
    sendChange,
  }
}