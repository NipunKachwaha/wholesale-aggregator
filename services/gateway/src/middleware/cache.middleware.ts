import { Request, Response, NextFunction } from 'express'
import { createClient }                    from 'redis'
import config                              from '../config'

const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  password: config.redis.password,
})

redisClient.connect().catch(console.error)

// ── Cache middleware
export const cacheMiddleware = (ttlSeconds: number = 60) => {
  return async (
    req:  Request,
    res:  Response,
    next: NextFunction
  ): Promise<void> => {

    // Sirf GET requests cache karo
    if (req.method !== 'GET') { next(); return }

    const key = `cache:${req.originalUrl}`

    try {
      const cached = await redisClient.get(key)

      if (cached) {
        res.setHeader('X-Cache', 'HIT')
        res.json(JSON.parse(cached))
        return
      }

      // Original response intercept karo
      const originalJson = res.json.bind(res)
      res.json = (data: any) => {
        // Cache mein save karo
        redisClient.setEx(key, ttlSeconds, JSON.stringify(data))
          .catch(console.error)
        res.setHeader('X-Cache', 'MISS')
        return originalJson(data)
      }

      next()
    } catch {
      // Redis fail hone pe bypass karo
      next()
    }
  }
}

// ── Cache invalidate karo
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(`cache:*${pattern}*`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  } catch {
    // Ignore
  }
}