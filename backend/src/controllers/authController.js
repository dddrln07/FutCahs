import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { config } from '../config/env.js';

function signToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.nome,
    is_admin: user.is_admin,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export const authController = {
  register: async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ message: 'Dados incompletos' });
    const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount > 0) return res.status(409).json({ message: 'Email já cadastrado' });

    const passwordHash = await bcrypt.hash(senha, 10);
    const result = await query(
      'INSERT INTO users (nome, email, senha, saldo_coins, is_admin) VALUES ($1,$2,$3,$4,$5) RETURNING id, nome, email, saldo_coins, is_admin',
      [nome, email, passwordHash, 0, false]
    );
    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  },
  login: async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'Dados incompletos' });
    const result = await query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ message: 'Credenciais inválidas' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, saldo_coins: user.saldo_coins, is_admin: user.is_admin } });
  },
};