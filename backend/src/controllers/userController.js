import { query } from '../config/db.js';

export const userController = {
  me: async (req, res) => {
    const userId = req.user.id;
    const userRes = await query('SELECT id, nome, email, saldo_coins, is_admin, criado_em FROM users WHERE id=$1', [userId]);
    const txRes = await query('SELECT id, tipo, valor, data FROM transactions WHERE user_id=$1 ORDER BY data DESC LIMIT 50', [userId]);
    const matchesRes = await query(
      `SELECT m.*,
              CASE WHEN m.vencedor_id=$1 THEN true ELSE false END as venceu
         FROM matches m
        WHERE m.jogador1_id=$1 OR m.jogador2_id=$1
        ORDER BY m.data DESC
        LIMIT 50`,
      [userId]
    );
    res.json({ user: userRes.rows[0], transactions: txRes.rows, matches: matchesRes.rows });
  },
};