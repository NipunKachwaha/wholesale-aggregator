import http   from 'http'
import app    from './app'
import config from './config'
import { createWsServer } from './websocket/ws.server'

const PORT = config.port

// ── HTTP Server banao
const server = http.createServer(app)

// ── WebSocket Server attach karo
const wss = createWsServer(server)

// ── Server start karo
server.listen(PORT, () => {
  console.log('─────────────────────────────────────')
  console.log(`✅ API Gateway running`)
  console.log(`🌐 HTTP: http://localhost:${PORT}`)
  console.log(`📡 WS:   ws://localhost:${PORT}/ws`)
  console.log(`🔍 Health: http://localhost:${PORT}/health`)
  console.log(`📦 Env:  ${config.nodeEnv}`)
  console.log('─────────────────────────────────────')
})

// ── Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM — shutting down...')
  wss.close()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  wss.close()
  server.close(() => process.exit(0))
})

export { server, wss }