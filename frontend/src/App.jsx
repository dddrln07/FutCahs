import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './index.css';

function Header({ user, onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="font-bold text-xl text-primary">FutCash</Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">Saldo: <span className="font-semibold text-success">{user.saldo_coins} Coins</span></span>
              <Link className="text-sm text-primary" to="/store">Loja</Link>
              <button onClick={onLogout} className="text-sm text-red-600">Sair</button>
            </>
          ) : (
            <>
              <Link className="text-sm text-primary" to="/login">Entrar</Link>
              <Link className="text-sm text-primary" to="/register">Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Page({ children }) {
  return <div className="pt-16 max-w-5xl mx-auto px-4">{children}</div>;
}

function Login({ onAuth }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) });
    const data = await res.json();
    if (!res.ok) return setError(data.message || 'Erro');
    localStorage.setItem('token', data.token);
    onAuth(data.user);
  }
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <form onSubmit={handleSubmit} className="grid gap-3 max-w-sm">
        <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" type="password" placeholder="Senha" value={senha} onChange={(e)=>setSenha(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-primary text-white rounded px-3 py-2">Entrar</button>
      </form>
    </Page>
  );
}

function Register({ onAuth }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, email, senha }) });
    const data = await res.json();
    if (!res.ok) return setError(data.message || 'Erro');
    localStorage.setItem('token', data.token);
    onAuth(data.user);
  }
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Cadastrar</h1>
      <form onSubmit={handleSubmit} className="grid gap-3 max-w-sm">
        <input className="border rounded px-3 py-2" placeholder="Nome" value={nome} onChange={(e)=>setNome(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" type="password" placeholder="Senha" value={senha} onChange={(e)=>setSenha(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-primary text-white rounded px-3 py-2">Criar conta</button>
      </form>
    </Page>
  );
}

function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error('not ok');
        const data = await r.json();
        setUser(data.user);
      })
      .catch(() => localStorage.removeItem('token'));
  }, []);
  return { user, setUser };
}

function Dashboard() {
  const token = localStorage.getItem('token');
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setData);
  }, [token]);
  if (!data) return <Page>Carregando...</Page>;
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4">
        <div className="p-4 border rounded">Saldo: <span className="text-success font-semibold">{data.user.saldo_coins} Coins</span></div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Iniciar jogo</h2>
          <div className="flex gap-2">
            <a className="bg-primary text-white px-3 py-2 rounded" href="/lobby">Criar sala</a>
            <a className="bg-gray-700 text-white px-3 py-2 rounded" href="/game">Jogar (Demo)</a>
          </div>
        </div>
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Histórico recente</h2>
          <ul className="text-sm grid gap-1">
            {data.matches.map((m) => (
              <li key={m.id}>
                {m.tipo_jogo} - aposta {m.valor_aposta} - {m.status} {m.vencedor_id ? (m.venceu ? '✅' : '❌') : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Page>
  );
}

function Store() {
  const [coins, setCoins] = useState(100);
  const token = localStorage.getItem('token');
  async function buy() {
    const res = await fetch('/api/payments/checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ coins }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }
  async function quickCredit() {
    await fetch('/api/payments/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ coins }) });
    window.location.reload();
  }
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Loja de Coins</h1>
      <div className="flex gap-2 items-center">
        <input type="number" className="border rounded px-3 py-2 w-32" value={coins} onChange={(e)=>setCoins(Number(e.target.value))} />
        <button className="bg-primary text-white px-3 py-2 rounded" onClick={buy}>Comprar via Stripe</button>
        <button className="bg-gray-700 text-white px-3 py-2 rounded" onClick={quickCredit}>Creditar (dev)</button>
      </div>
    </Page>
  );
}

function Lobby() {
  const token = localStorage.getItem('token');
  const [valor, setValor] = useState(10);
  const [tipo, setTipo] = useState('quiz');
  const [open, setOpen] = useState([]);
  useEffect(() => {
    fetch('/api/matches/open').then((r)=>r.json()).then(setOpen);
  }, []);
  async function create() {
    const res = await fetch('/api/matches/create', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ tipo_jogo: tipo, valor_aposta: valor }) });
    if (res.ok) window.location.href = '/room';
  }
  async function join(id) {
    const res = await fetch('/api/matches/join', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ matchId: id }) });
    if (res.ok) window.location.href = '/room';
  }
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Salas abertas</h1>
      <div className="grid gap-2 mb-4">
        {open.map((m)=> (
          <div key={m.id} className="border p-3 rounded flex items-center justify-between">
            <div>{m.tipo_jogo} - aposta {m.valor_aposta}</div>
            <button className="bg-success text-white px-3 py-1 rounded" onClick={()=>join(m.id)}>Entrar</button>
          </div>
        ))}
      </div>
      <div className="p-4 border rounded grid gap-2 max-w-md">
        <h2 className="font-semibold">Criar sala</h2>
        <select className="border rounded px-3 py-2" value={tipo} onChange={(e)=>setTipo(e.target.value)}>
          <option value="quiz">Quiz 1x1</option>
          <option value="reflexo">Reflexo do Goleiro</option>
        </select>
        <input type="number" className="border rounded px-3 py-2" value={valor} onChange={(e)=>setValor(Number(e.target.value))} />
        <button className="bg-primary text-white px-3 py-2 rounded" onClick={create}>Criar</button>
      </div>
    </Page>
  );
}

function Room() {
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Sala de Partida</h1>
      <p>Aguardando jogador...</p>
      <a className="bg-primary text-white px-3 py-2 rounded inline-block mt-4" href="/game">Ir para o jogo</a>
    </Page>
  );
}

function Game() {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  useEffect(()=>{ fetch('/api/quiz/random?limit=5').then(r=>r.json()).then(setQuestions); },[]);
  if (questions.length === 0) return <Page>Carregando perguntas...</Page>;
  const q = questions[idx];
  const options = Array.isArray(q.opcoes) ? q.opcoes : (q.opcoes?.options || []);
  function answerOption(opt) {
    if (opt === q.resposta_correta) setScore((s)=>s+1);
    const next = idx + 1;
    if (next < questions.length) setIdx(next); else window.alert(`Fim! Pontos: ${score}`);
  }
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="p-4 border-b">Quiz</div>
      <div className="flex-1 p-4 grid gap-4 content-center">
        <div className="text-xl font-semibold">{q.pergunta}</div>
        <div className="grid gap-2">
          {options.map((o, i)=> (
            <button key={i} className="bg-primary text-white px-4 py-3 rounded" onClick={()=>answerOption(o)}>{o}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  useEffect(()=>{
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).then(setUsers);
    fetch('/api/admin/matches', { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).then(setMatches);
  },[token]);
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <h2 className="font-semibold mb-2">Usuários</h2>
          <ul className="text-sm grid gap-1 max-h-80 overflow-auto">
            {users.map(u=> (<li key={u.id}>{u.id} - {u.nome} - {u.email} - {u.saldo_coins}</li>))}
          </ul>
        </div>
        <div className="border rounded p-3">
          <h2 className="font-semibold mb-2">Partidas</h2>
          <ul className="text-sm grid gap-1 max-h-80 overflow-auto">
            {matches.map(m=> (<li key={m.id}>{m.id} - {m.tipo_jogo} - {m.status} - {m.valor_aposta}</li>))}
          </ul>
        </div>
      </div>
    </Page>
  );
}

export default function App() {
  const { user, setUser } = useAuth();
  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }
  return (
    <BrowserRouter>
      <Header user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onAuth={setUser} />} />
        <Route path="/register" element={<Register onAuth={setUser} />} />
        <Route path="/store" element={<Store />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/room" element={<Room />} />
        <Route path="/game" element={<Game />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
