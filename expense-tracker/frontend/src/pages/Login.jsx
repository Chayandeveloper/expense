import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:`radial-gradient(ellipse at 20% 50%, rgba(124,109,250,0.08) 0%, transparent 60%),
                       radial-gradient(ellipse at 80% 20%, rgba(192,132,252,0.06) 0%, transparent 50%)`,
    }}>
      <div className="fade-in" style={{ width:'100%', maxWidth:420, padding:'0 1.5rem' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800 }}>
            <span style={{ color:'var(--accent)' }}>Expense</span>Track
          </div>
          <p style={{ color:'var(--text3)', marginTop:6, fontSize:'0.9rem' }}>Track every rupee, own your finances</p>
        </div>

        <div className="card" style={{ padding:'2rem' }}>
          <h2 style={{ fontSize:'1.2rem', marginBottom:'1.5rem' }}>Welcome back</h2>

          {error && (
            <div style={{ background:'rgba(244,113,106,0.1)', border:'1px solid rgba(244,113,106,0.3)', borderRadius:'var(--radius-sm)', padding:'0.75rem 1rem', marginBottom:'1rem', fontSize:'0.875rem', color:'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'1rem' }}>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f=>({...f, email:e.target.value}))} required />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f=>({...f, password:e.target.value}))} required />
            </div>
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'0.75rem' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'var(--text3)' }}>
            No account?{' '}
            <Link to="/register" style={{ color:'var(--accent2)', fontWeight:500 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
