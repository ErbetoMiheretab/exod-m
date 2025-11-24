import Redis from "ioredis";

// import {env} from './env.js'
import { logger } from "../shared/utils/logger.js";

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'


const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => logger.info('Redis connected successfully'));
redis.on('error', (err) => logger.error('Redis connection error:', err));

export default redis;