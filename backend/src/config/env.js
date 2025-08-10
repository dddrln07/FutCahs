import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root so running from other cwd still works
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

envFallback();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  futcashFeePercent: process.env.FUTCASH_FEE_PERCENT ? Number(process.env.FUTCASH_FEE_PERCENT) : 10,
};

function envFallback() {
  // No-op placeholder for potential runtime env validation
}