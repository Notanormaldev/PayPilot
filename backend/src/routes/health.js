import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import redis from '../lib/redis.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  if (redis && redis.status === 'ready') {
    redisStatus = 'connected';
  } else {
    redisStatus = 'in-memory-fallback';
  }

  res.json({
    status: 'ok',
    app: 'PayPilot Autonomous HRMS & Sentinel Payroll Engine',
    version: '2.4.0',
    db: dbStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
