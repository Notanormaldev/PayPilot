import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
const redisPassword = process.env.REDIS_PASSWORD;

let redisClient: Redis | null = null;

if (redisHost) {
  try {
    redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️ [Redis] Connection warning (running in memory fallback):', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ [Redis] Connected to cloud Redis cache');
    });

    // Attempt initial connect
    redisClient.connect().catch((err) => {
      console.warn('⚠️ [Redis] Failed to connect initially:', err.message);
    });
  } catch (err: any) {
    console.warn('⚠️ [Redis] Initialization failed:', err.message);
  }
}

export const redis = redisClient;

// Safe caching helper
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, data: T, ttlSeconds: number = 60): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err: any) {
    console.warn('⚠️ [Redis] Cache set error:', err.message);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err: any) {
    console.warn('⚠️ [Redis] Cache invalidate error:', err.message);
  }
}
