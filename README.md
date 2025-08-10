# FutCash

Monorepo com frontend (React + Vite + Tailwind) e backend (Node + Express + PostgreSQL).

## Pastas
- `/frontend` — Vite + React + Tailwind
- `/backend` — API Node/Express

## Configuração
1. Crie `.env` em `/backend` baseado em `.env.example`.
2. Instale dependências:
   - Frontend: `cd frontend && npm i`
   - Backend: `cd backend && npm i`
3. Rode migrations: `cd backend && npm run migrate`
4. Inicie:
   - Backend: `npm run dev` (porta 3001)
   - Frontend: `cd ../frontend && npm run dev` (porta 5173)

## Funcionalidades
- Auth JWT (registro/login) `/api/auth/*`
- Perfil `/api/users/me`
- Partidas `/api/matches/*`
- Pagamentos (Stripe checkout + crédito dev) `/api/payments/*`
- Admin `/api/admin/*`
- Quiz `/api/quiz/random`

Definições de banco estão em `backend/migrations/001_init.sql`.
