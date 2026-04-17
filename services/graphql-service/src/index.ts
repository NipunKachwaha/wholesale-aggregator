import { ApolloServer }      from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import express               from 'express'
import cors                  from 'cors'
import bodyParser            from 'body-parser'
import dotenv                from 'dotenv'
import path                  from 'path'
import { typeDefs }          from './schema'
import { resolvers }         from './resolvers'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const PORT = parseInt(process.env.GRAPHQL_PORT || '4000')

async function start() {
  const app    = express()
  const server = new ApolloServer({ typeDefs, resolvers })

  await server.start()

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin:      ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization,
      }),
    })
  )

  app.get('/health', (_, res) => {
    res.json({ success: true, service: 'graphql-service', status: 'ok' })
  })

  app.listen(PORT, () => {
    console.log('─────────────────────────────────────')
    console.log(`✅ GraphQL Service running`)
    console.log(`🌐 URL:      http://localhost:${PORT}/graphql`)
    console.log(`🔭 Explorer: http://localhost:${PORT}/graphql`)
    console.log('─────────────────────────────────────')
  })
}

start().catch(console.error)