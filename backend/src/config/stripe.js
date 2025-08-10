import Stripe from 'stripe';
import { config } from './env.js';

export const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;