import { useEffect, useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [memories, setMemories] = useState([])
  const [stats, setStats] = useState({ total_memories: 0, mood_statistics: {} })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mood, setMood] = useState('happy')
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadData(authToken = token) {
    const headers = { Authorization: `Bearer ${authToken}` }

    const [memoryResponse, statsResponse] = await Promise.all([
      fetch(`${API}/memories/`, { headers }),
      fetch(`${API}/stats/`, { headers })
    ])

    if (memoryResponse.status === 401 || statsResponse.status === 401) {
      logout()
      throw new Error('Session expired. Please log in again.')
    }

    if (!memoryResponse.ok || !statsResponse.ok) {
      throw new Error('Could not load your memories.')
    }

    setMemories(await memoryResponse.json())
    setStats(await statsResponse.json())
  }

  useEffect(() => {
    if (token) {
      loadData(token).catch(error => setMessage(error.message))
    }
  }, [token])

  async function handleAuth(event) {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      if (page === 'register') {
        const response = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.detail || 'Registration failed')

        setMessage('Account created! Now log in.')
        setPage('login')
        setPassword('')
      } else {
        const form = new URLSearchParams()
        form.append('username', username)
        form.append('password', password)

        const response = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.detail || 'Login failed')

        localStorage.setItem('token', data.access_token)
        setToken(data.access_token)
        setMessage('')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setMemories([])
    setPage('login')
  }

  async function createMemory(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch(`${API}/memories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, mood })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Could not save memory')

      setTitle('')
      setDescription('')
      setMood('happy')
      setShowForm(false)
      await loadData()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deleteMemory(id) {
    if (!window.confirm('Delete this memory?')) return

    try {
      const response = await fetch(`${API}/memories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Could not delete memory')
      await loadData()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const visibleMemories = memories.filter(memory =>
    `${memory.title} ${memory.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (!token) {
    return (
      <main className="auth-page">
        <nav className="top-nav">
          <div className="brand"><span className="brand-icon">✳</span> afterglow</div>
          <span className="nav-note">A little place for your memories</span>
        </nav>

        <section className="auth-layout">
          <div className="auth-intro">
            <span className="eyebrow">YOUR PERSONAL MEMORY JOURNAL</span>
            <h1>Some moments<br />deserve to <em>stay.</em></h1>
            <p>
              A quiet space to collect your thoughts, remember the little things
              and keep pieces of every day.
            </p>
            <div className="quote-card">
              <span className="quote-mark">“</span>
              <p>Collect moments, not things.</p>
              <span className="quote-caption">A gentle reminder from AFTERGLOW</span>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-tabs">
              <button className={page === 'login' ? 'active' : ''} onClick={() => { setPage('login'); setMessage('') }}>Log in</button>
              <button className={page === 'register' ? 'active' : ''} onClick={() => { setPage('register'); setMessage('') }}>Sign up</button>
            </div>

            <h2>{page === 'login' ? 'Welcome back' : 'Create your space'}</h2>
            <p className="form-subtitle">
              {page === 'login' ? 'Your memories are waiting for you.' : 'Start saving the moments that matter.'}
            </p>

            <form onSubmit={handleAuth}>
              <label>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" required />

              {page === 'register' && (
                <>
                  <label>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </>
              )}

              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required />

              {message && <p className="message">{message}</p>}

              <button className="primary-button" disabled={loading}>
                {loading ? 'Please wait...' : page === 'login' ? 'Enter your journal →' : 'Create account →'}
              </button>
            </form>

            <p className="auth-footer">Made for the moments you want to keep ♡</p>
          </div>
        </section>
        <footer className="page-footer">AFTERGLOW © 2026</footer>
      </main>
    )
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">✳</span> afterglow</div>
        <div className="side-label">YOUR SPACE</div>
        <div className="side-link selected">▦ <span>My memories</span></div>
        <div className="side-label side-bottom">A LITTLE NOTE</div>
        <p className="sidebar-note">Every day holds something worth remembering.</p>
        <button className="logout-button" onClick={logout}>↪ Log out</button>
      </aside>

      <section className="main-content">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">YOUR PERSONAL JOURNAL</span>
            <h1>Your little universe<span>.</span></h1>
            <p className="welcome-text">A collection of moments, thoughts and feelings.</p>
          </div>
          <button className="primary-button add-button" onClick={() => setShowForm(!showForm)}>
            + New memory
          </button>
        </header>

        {message && <p className="message dashboard-message">{message}</p>}

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">✧</span>
            <span className="stat-number">{stats.total_memories}</span>
            <span className="stat-label">Memories saved</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">♡</span>
            <span className="stat-number">{Object.keys(stats.mood_statistics || {}).length}</span>
            <span className="stat-label">Moods experienced</span>
          </div>
        </div>

        {showForm && (
          <form className="memory-form" onSubmit={createMemory}>
            <h2>Save a moment ✨</h2>
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give this memory a name..." maxLength={100} required />
            <label>What happened?</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write down the little details..." required rows={4} />
            <label>How did it make you feel?</label>
            <select value={mood} onChange={e => setMood(e.target.value)}>
              <option value="happy">😊 Happy</option>
              <option value="grateful">🌷 Grateful</option>
              <option value="calm">☁️ Calm</option>
              <option value="excited">✨ Excited</option>
              <option value="sad">🌧️ Sad</option>
              <option value="proud">💜 Proud</option>
            </select>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="primary-button">Save memory</button>
            </div>
          </form>
        )}

        <div className="memories-heading">
          <div>
            <span className="eyebrow">THE GOOD OLD DAYS</span>
            <h2>Your memories</h2>
          </div>
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="⌕  Search memories..." />
        </div>

        {visibleMemories.length === 0 ? (
          <div className="empty-state">
            <span>☁️</span>
            <h3>No memories here yet</h3>
            <p>Your story is just beginning. Save your first little moment.</p>
            <button className="secondary-button" onClick={() => setShowForm(true)}>Create a memory</button>
          </div>
        ) : (
          <div className="memory-grid">
            {visibleMemories.map(memory => (
              <article className="memory-card" key={memory.id}>
                <div className="memory-card-top">
                  <span className="mood-tag">{memory.mood}</span>
                  <button className="delete-button" onClick={() => deleteMemory(memory.id)} title="Delete memory">×</button>
                </div>
                <h3>{memory.title}</h3>
                <p>{memory.description}</p>
                <div className="memory-date">
                  {memory.created_at ? new Date(memory.created_at).toLocaleDateString() : ''}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App