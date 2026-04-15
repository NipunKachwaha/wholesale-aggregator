import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

const WS_URL = 'ws://localhost:3000/ws'

export interface WsNotification {
  id:        string
  type:      string
  title:     string
  message:   string
  severity:  'info' | 'success' | 'warning' | 'error'
  timestamp: string
  data?:     any
}

export const useWebSocket = () => {
  const { accessToken }                          = useSelector((s: RootState) => s.auth)
  const [notifications, setNotifications]        = useState<WsNotification[]>([])
  const [connected,     setConnected]            = useState(false)
  const [unreadCount,   setUnreadCount]          = useState(0)
  const wsRef                                    = useRef<WebSocket | null>(null)
  const reconnectTimer                           = useRef<ReturnType<typeof setTimeout>>()

  const connect = useCallback(() => {
    try {
      // Token ke saath connect karo
      const url = accessToken
        ? `${WS_URL}?token=${accessToken}`
        : WS_URL

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('📡 WebSocket connected')
        setConnected(true)
        // Ping bhejo
        ws.send(JSON.stringify({ type: 'ping' }))
      }

      ws.onmessage = (event) => {
        try {
          const notification: WsNotification = JSON.parse(event.data)

          // Pong ignore karo
          if (notification.type === 'pong' ||
              notification.type === 'connected') return

          setNotifications(prev => [notification, ...prev].slice(0, 50))
          setUnreadCount(prev => prev + 1)

          // Browser notification (agar permission hai)
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
            })
          }
        } catch {
          // Invalid message
        }
      }

      ws.onclose = () => {
        setConnected(false)
        console.log('📡 WebSocket disconnected — reconnecting in 3s...')
        // Auto reconnect
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }

    } catch (err) {
      console.error('WebSocket connection failed:', err)
    }
  }, [accessToken])

  useEffect(() => {
    connect()

    // Browser notification permission maango
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  const clearUnread = useCallback(() => setUnreadCount(0), [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    connected,
    unreadCount,
    clearUnread,
    clearAll,
  }
}