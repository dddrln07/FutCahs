import { query } from '../config/db.js';
import { config } from '../config/env.js';

async function ensureBalance(userId, amount) {
  const r = await query('SELECT saldo_coins FROM users WHERE id=$1', [userId]);
  if (r.rowCount === 0) throw new Error('Usuário não encontrado');
  if (Number(r.rows[0].saldo_coins) < amount) throw new Error('Saldo insuficiente');
}

export const matchController = {
  create: async (req, res) => {
    const { tipo_jogo, valor_aposta } = req.body;
    if (!tipo_jogo || !valor_aposta) return res.status(400).json({ message: 'Dados incompletos' });
    try {
      await ensureBalance(req.user.id, valor_aposta);
      const result = await query(
        `INSERT INTO matches (tipo_jogo, jogador1_id, valor_aposta, status, data)
         VALUES ($1,$2,$3,'pending', NOW()) RETURNING *`,
        [tipo_jogo, req.user.id, valor_aposta]
      );
      res.status(201).json(result.rows[0]);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
  join: async (req, res) => {
    const { matchId } = req.body;
    if (!matchId) return res.status(400).json({ message: 'matchId ausente' });
    const matchRes = await query('SELECT * FROM matches WHERE id=$1', [matchId]);
    if (matchRes.rowCount === 0) return res.status(404).json({ message: 'Partida não encontrada' });
    const match = matchRes.rows[0];
    if (match.jogador2_id) return res.status(400).json({ message: 'Partida já possui dois jogadores' });
    if (match.jogador1_id === req.user.id) return res.status(400).json({ message: 'Você já está na partida' });
    try {
      await ensureBalance(req.user.id, match.valor_aposta);
      // Start transaction
      await query('BEGIN');
      await query('UPDATE matches SET jogador2_id=$1, status=$2 WHERE id=$3', [req.user.id, 'ongoing', match.id]);
      await query('UPDATE users SET saldo_coins = saldo_coins - $1 WHERE id IN ($2,$3)', [match.valor_aposta, match.jogador1_id, req.user.id]);
      await query('INSERT INTO transactions (user_id, tipo, valor, data) VALUES ($1,$2,$3,NOW()), ($4,$2,$3,NOW())', [match.jogador1_id, 'aposta', -match.valor_aposta, req.user.id]);
      await query('COMMIT');
      const updated = await query('SELECT * FROM matches WHERE id=$1', [match.id]);
      res.json(updated.rows[0]);
    } catch (e) {
      await query('ROLLBACK');
      res.status(400).json({ message: e.message });
    }
  },
  finish: async (req, res) => {
    const { matchId, vencedor_id } = req.body;
    if (!matchId || !vencedor_id) return res.status(400).json({ message: 'Dados incompletos' });
    const matchRes = await query('SELECT * FROM matches WHERE id=$1', [matchId]);
    if (matchRes.rowCount === 0) return res.status(404).json({ message: 'Partida não encontrada' });
    const match = matchRes.rows[0];
    if (match.status === 'finished') return res.status(400).json({ message: 'Partida já finalizada' });
    if (![match.jogador1_id, match.jogador2_id].includes(vencedor_id)) return res.status(400).json({ message: 'Vencedor inválido' });

    const totalPot = Number(match.valor_aposta) * 2;
    const fee = Math.floor((totalPot * config.futcashFeePercent) / 100);
    const prize = totalPot - fee;

    try {
      await query('BEGIN');
      await query('UPDATE matches SET vencedor_id=$1, status=$2 WHERE id=$3', [vencedor_id, 'finished', match.id]);
      await query('UPDATE users SET saldo_coins = saldo_coins + $1 WHERE id=$2', [prize, vencedor_id]);
      await query('INSERT INTO transactions (user_id, tipo, valor, data) VALUES ($1,$2,$3,NOW())', [vencedor_id, 'premio', prize]);
      await query('INSERT INTO transactions (user_id, tipo, valor, data) VALUES ($1,$2,$3,NOW())', [null, 'taxa', fee]);
      await query('COMMIT');
      const updated = await query('SELECT * FROM matches WHERE id=$1', [match.id]);
      res.json(updated.rows[0]);
    } catch (e) {
      await query('ROLLBACK');
      res.status(400).json({ message: e.message });
    }
  },
  listOpen: async (_req, res) => {
    const r = await query("SELECT * FROM matches WHERE status='pending' ORDER BY data DESC LIMIT 50", []);
    res.json(r.rows);
  },
};