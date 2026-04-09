import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { createClient } from 'redis';
import config from '../config';

const router = Router();

// PostgreSQL connection
const pgPool = new Pool(config.postgres);

// Redis client
const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  password: config.redis.password,
});

// Redis connect karo (ek baar)
redisClient.connect().catch((err) => {
  console.error('Redis connection error:', err.message);
});

// ── GET /health
router.get('/', async (req: Request, res: Response) => {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  // PostgreSQL check
  try {
    await pgPool.query('SELECT 1');
    checks.postgres = 'healthy';
  } catch (err) {
    checks.postgres = 'unhealthy';
    allHealthy = false;
    console.error('PostgreSQL health check failed:', err);
  }

  // Redis check
  try {
    await redisClient.ping();
    checks.redis = 'healthy';
  } catch (err) {
    checks.redis = 'unhealthy';
    allHealthy = false;
    console.error('Redis health check failed:', err);
  }

  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    success:   allHealthy,
    status:    allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service:   'api-gateway',
    version:   '1.0.0',
    checks,
  });
});

export default router;