import { stripe } from '../config/stripe.js';
import { config } from '../config/env.js';
import { query } from '../config/db.js';

const COIN_PRICE_BRLCENTS = 10; // 1 Coin = R$0,10 (exemplo). Ajuste conforme necessidade

export const paymentController = {
  createCheckoutSession: async (req, res) => {
    const { coins } = req.body; // e.g., 100
    if (!coins || coins <= 0) return res.status(400).json({ message: 'Quantidade de coins inválida' });
    if (!stripe) return res.status(500).json({ message: 'Stripe não configurado' });

    const amount = coins * COIN_PRICE_BRLCENTS; // em centavos BRL

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: `${coins} Coins FutCash` },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${config.frontendUrl}/store?success=true&coins=${coins}`,
      cancel_url: `${config.frontendUrl}/store?canceled=true`,
      metadata: { userId: String(req.user.id), coins: String(coins) },
    });

    res.json({ id: session.id, url: session.url });
  },

  // Para desenvolvimento, endpoint direto para creditar após sucesso do checkout (simulação)
  confirmCredit: async (req, res) => {
    const { coins } = req.body;
    if (!coins || coins <= 0) return res.status(400).json({ message: 'Quantidade de coins inválida' });
    await query('UPDATE users SET saldo_coins = saldo_coins + $1 WHERE id=$2', [coins, req.user.id]);
    await query('INSERT INTO transactions (user_id, tipo, valor, data) VALUES ($1,$2,$3,NOW())', [req.user.id, 'compra', coins]);
    res.json({ ok: true });
  },

  webhook: async (req, res) => {
    // Placeholder: implementar verificação do webhook com STRIPE_WEBHOOK_SECRET e creditar coins
    res.json({ received: true });
  },
};