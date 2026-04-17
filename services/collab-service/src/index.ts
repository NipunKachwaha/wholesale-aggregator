import { WebSocketServer, WebSocket } from 'ws'
import express                        from 'express'
import http                           from 'http'
import cors                           from 'cors'
import { v4 as uuidv4 }              from 'uuid'
import dotenv                         from 'dotenv'

dotenv.config()

const PORT = parseInt(process.env.COLLAB_PORT || '3004')

// ── Types
interface CollabUser {
  id:       string
  name:     string
  email:    string
  color:    string
  cursor?:  { x: number; y: number }
  ws:       WebSocket
  room:     string
}

interface CollabMessage {
  type:     string
  roomId:   string
  userId?:  string
  data?:    any
}

// ── State
const rooms  = new Map<string, Map<string, CollabUser>>()
const colors = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
]

// ── Helper: Room mein broadcast
const broadcastToRoom = (
  roomId:   string,
  message:  any,
  exclude?: string
): void => {
  const room = rooms.get(roomId)
  if (!room) return

  const data = JSON.stringify(message)
  room.forEach((user, userId) => {
    if (userId !== exclude && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(data)
    }
  })
}

// ── Express + HTTP
const app    = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => {
  res.json({
    success: true,
    service: 'collab-service',
    rooms:   rooms.size,
    users:   Array.from(rooms.values()).reduce((s, r) => s + r.size, 0),
  })
})

app.get('/rooms', (_, res) => {
  const roomList = Array.from(rooms.entries()).map(([id, users]) => ({
    id,
    userCount: users.size,
    users: Array.from(users.values()).map((u) => ({
      id:    u.id,
      name:  u.name,
      color: u.color,
    })),
  }))
  res.json({ rooms: roomList })
})

const server = http.createServer(app)
const wss    = new WebSocketServer({ server, path: '/collab' })

wss.on('connection', (ws: WebSocket) => {
  let currentUser: CollabUser | null = null

  ws.on('message', (data: Buffer) => {
    try {
      const msg: CollabMessage = JSON.parse(data.toString())

      switch (msg.type) {

        // ── User room join karta hai
        case 'join': {
          const { roomId, userId, userName, userEmail } = msg.data
          const color = colors[Math.floor(Math.random() * colors.length)]

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map())
          }

          currentUser = {
            id:    userId || uuidv4(),
            name:  userName  || 'Anonymous',
            email: userEmail || '',
            color,
            ws,
            room: roomId,
          }

          rooms.get(roomId)!.set(currentUser.id, currentUser)

          // Welcome message
          ws.send(JSON.stringify({
            type: 'joined',
            data: {
              userId: currentUser.id,
              color,
              users: Array.from(rooms.get(roomId)!.values()).map((u) => ({
                id:     u.id,
                name:   u.name,
                color:  u.color,
                cursor: u.cursor,
              })),
            },
          }))

          // Doosron ko batao
          broadcastToRoom(roomId, {
            type: 'user_joined',
            data: {
              userId: currentUser.id,
              name:   currentUser.name,
              color,
            },
          }, currentUser.id)

          console.log(`👥 ${currentUser.name} joined room: ${roomId}`)
          break
        }

        // ── Document change
        case 'doc_change': {
          if (!currentUser) break
          broadcastToRoom(currentUser.room, {
            type:   'doc_change',
            userId: currentUser.id,
            data:   msg.data,
          }, currentUser.id)
          break
        }

        // ── Cursor move
        case 'cursor_move': {
          if (!currentUser) break
          currentUser.cursor = msg.data.cursor

          broadcastToRoom(currentUser.room, {
            type:   'cursor_move',
            userId: currentUser.id,
            color:  currentUser.color,
            name:   currentUser.name,
            data:   msg.data,
          }, currentUser.id)
          break
        }

        // ── Field focus
        case 'field_focus': {
          if (!currentUser) break
          broadcastToRoom(currentUser.room, {
            type:    'field_focus',
            userId:  currentUser.id,
            name:    currentUser.name,
            color:   currentUser.color,
            data:    msg.data,
          }, currentUser.id)
          break
        }

        // ── Field blur
        case 'field_blur': {
          if (!currentUser) break
          broadcastToRoom(currentUser.room, {
            type:   'field_blur',
            userId: currentUser.id,
            data:   msg.data,
          }, currentUser.id)
          break
        }

        // ── Chat message
        case 'chat': {
          if (!currentUser) break
          broadcastToRoom(currentUser.room, {
            type:  'chat',
            userId: currentUser.id,
            name:  currentUser.name,
            color: currentUser.color,
            data:  {
              message:   msg.data.message,
              timestamp: new Date().toISOString(),
            },
          })
          break
        }
      }

    } catch (err) {
      console.error('WS message error:', err)
    }
  })

  ws.on('close', () => {
    if (!currentUser) return
    const room = rooms.get(currentUser.room)
    if (room) {
      room.delete(currentUser.id)
      if (room.size === 0) rooms.delete(currentUser.room)
    }
    broadcastToRoom(currentUser.room, {
      type:   'user_left',
      userId: currentUser.id,
      name:   currentUser.name,
    })
    console.log(`👋 ${currentUser.name} left room: ${currentUser.room}`)
  })
})

server.listen(PORT, () => {
  console.log('─────────────────────────────────────')
  console.log(`✅ Collab Service running`)
  console.log(`🌐 URL:  http://localhost:${PORT}`)
  console.log(`📡 WS:   ws://localhost:${PORT}/collab`)
  console.log('─────────────────────────────────────')
})