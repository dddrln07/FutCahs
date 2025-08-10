import { query } from '../config/db.js';

export const quizController = {
  random: async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const r = await query('SELECT id, pergunta, opcoes, resposta_correta FROM quiz_questions ORDER BY random() LIMIT $1', [limit]);
    res.json(r.rows);
  },
};