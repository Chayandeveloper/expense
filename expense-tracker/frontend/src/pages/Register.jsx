import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', password_confirmation:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation)
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const msgs = Object.values(errors).flat()
        setError(msgs.join(' '))
      } else {
        setError(err.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const set = key => e => setForm(f => ({...f, [key]: e.target.value}))

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:`radial-gradient(ellipse at 80% 50%, rgba(124,109,250,0.08) 0%, transparent 60%)`,
    }}>
      <div className="fade-in" style={{ width:'100%', maxWidth:420, padding:'0 1.5rem' }}>
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800 }}>
            <span style={{ color:'var(--accent)' }}>Expense</span>Track
          </div>
          <p style={{ color:'var(--text3)', marginTop:6, fontSize:'0.9rem' }}>Start tracking your finances today</p>
        </div>

        <div className="card" style={{ padding:'2rem' }}>
          <h2 style={{ fontSize:'1.2rem', marginBottom:'1.5rem' }}>Create account</h2>

          {error && (
            <div style={{ background:'rgba(244,113,106,0.1)', border:'1px solid rgba(244,113,106,0.3)', borderRadius:'var(--radius-sm)', padding:'0.75rem 1rem', marginBottom:'1rem', fontSize:'0.875rem', color:'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { key:'name',                  label:'Full Name',        type:'text',     placeholder:'John Doe' },
              { key:'email',                 label:'Email',            type:'email',    placeholder:'you@example.com' },
              { key:'password',              label:'Password',         type:'password', placeholder:'Min 6 characters' },
              { key:'password_confirmation', label:'Confirm Password', type:'password', placeholder:'Re-enter password' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom:'1rem' }}>
                <label className="label">{label}</label>
                <input className="input" type={type} placeholder={placeholder}
                  value={form[key]} onChange={set(key)} required />
              </div>
            ))}

            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'0.75rem', marginTop:'0.5rem' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'var(--text3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--accent2)', fontWeight:500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
