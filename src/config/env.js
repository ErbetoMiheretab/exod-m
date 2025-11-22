import path from 'path';

import dotenv from 'dotenv';


// Load .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Validation helper
const requireEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} is missing`);
  }
  return process.env[name];
};

// 1. General App Settings
export const env = process.env.NODE_ENV || 'development';
export const port = Number(process.env.PORT) || 3000;
export const isProduction = env === 'production';
export const isDevelopment = env === 'development';

// 2. Database (Prisma picks this up automatically, but good to have here for reference)
export const dbUrl = requireEnv('DATABASE_URL');

// 3. Authentication (JWT)
export const jwtSecret = requireEnv('JWT_SECRET');
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
export const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// 4. CORS Configuration
export const cors = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*', // Allow list or all
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required if you use cookies or sessions
  optionsSuccessStatus: 200,
};

// 5. Logging
export const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// 6. File Uploads (Optional, based on your middleware limits)
export const uploadLimit = process.env.UPLOAD_LIMIT || '10mb';

const config = {
  env,
  port,
  isProduction,
  dbUrl,
  jwtSecret,
  jwtExpiresIn,
  cors,
};

export default config;