import { query } from '../config/db.js';

export const adminController = {
  listUsers: async (_req, res) => {
    const r = await query('SELECT id, nome, email, saldo_coins, is_admin, criado_em FROM users ORDER BY id DESC LIMIT 200');
    res.json(r.rows);
  },
  listMatches: async (_req, res) => {
    const r = await query('SELECT * FROM matches ORDER BY data DESC LIMIT 200');
    res.json(r.rows);
  },
  addQuizQuestion: async (req, res) => {
    const { pergunta, opcoes, resposta_correta } = req.body;
    if (!pergunta || !opcoes || !resposta_correta) return res.status(400).json({ message: 'Dados incompletos' });
    const r = await query('INSERT INTO quiz_questions (pergunta, opcoes, resposta_correta) VALUES ($1,$2,$3) RETURNING *', [pergunta, opcoes, resposta_correta]);
    res.status(201).json(r.rows[0]);
  },
  setFee: async (req, res) => {
    const { percent } = req.body;
    if (percent < 0 || percent > 50) return res.status(400).json({ message: 'Percentual inválido' });
    // armazenar em settings simples (chave futcash_fee_percent)
    await query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value', ['futcash_fee_percent', String(percent)]);
    res.json({ ok: true });
  },
  getFee: async (_req, res) => {
    const r = await query("SELECT value FROM settings WHERE key='futcash_fee_percent'");
    res.json({ percent: r.rowCount ? Number(r.rows[0].value) : null });
  },
};