import dotenv from 'dotenv';
dotenv.config();

if (!process.env.WEATHERAPI_KEY) {
  throw new Error('WEATHERAPI_KEY env variable not set.');
}
export const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;

export const ORIGIN = process.env.ORIGIN || '';

export const QUESTION_LIFESPAN_MS = 60 * 60 * 1000;

export const QUESTION_CLEAN_INTERVAL_MS = 30 * 60 * 1000;

export const PORT = Number(process.env.PORT) || 8000;