import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let redis = null;

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

if (REDIS_HOST) {
  try {
    redis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      connectTimeout: 5000,
      maxRetriesPerRequest: 2,
      lazyConnect: false,
    });

    redis.on('connect', () => {
      console.log('✅ [Redis] Connected to cloud Redis cache');
    });

    redis.on('error', (err) => {
      console.warn('⚠️ [Redis] Connection error (falling back to memory):', err.message);
    });
  } catch (err) {
    console.warn('⚠️ [Redis] Initialization failed:', err.message);
  }
} else {
  console.log('ℹ️ [Redis] No REDIS_HOST configured; using local memory cache');
}

// In-Memory Fallback Cache Map
const memoryCache = new Map();

export const cacheService = {
  get: async (key) => {
    if (redis && redis.status === 'ready') {
      try {
        const val = await redis.get(key);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        // Fallback
      }
    }
    const item = memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  },

  set: async (key, value, ttlSeconds = 60) => {
    if (redis && redis.status === 'ready') {
      try {
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (e) {
        // Fallback
      }
    }
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  del: async (key) => {
    if (redis && redis.status === 'ready') {
      try {
        await redis.del(key);
      } catch (e) {}
    }
    memoryCache.delete(key);
  },
};

export default redis;
