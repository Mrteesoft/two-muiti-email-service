import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const createRedisConnection = (): IORedis => {
  const redis = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    console.log('✅ Worker Service connected to Redis successfully');
  });

  redis.on('error', (error) => {
    console.error('❌ Redis connection error:', error);
  });

  return redis;
};
