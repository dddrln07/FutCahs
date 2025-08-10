import { Pool } from 'pg';
import { config } from './env.js';

const isUsingSsl = config.databaseUrl.includes('supabase.co') || config.databaseUrl.includes('render.com');

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isUsingSsl ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const durationMs = Date.now() - start;
  if (durationMs > 200) {
    console.log(`Slow query (${durationMs}ms):`, text);
  }
  return result;
}