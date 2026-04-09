import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const EMPTY_FORM = {
  title: '', amount: '', category_id: '', type: 'expense', date: new Date().toISOString().slice(0,10), description: ''
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'1rem'
    }}>
      <div className="card fade-in" style={{ width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', color:'var(--text3)', fontSize:'1.25rem', lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Expenses() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [error, setError] = useState('')

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/expenses?month=${month}&year=${year}`)
      setExpenses(res.data)
    } catch {}
    setLoading(false)
  }, [month, year])

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data))
  }, [])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowModal(true) }
  const openEdit = exp => {
    setEditing(exp)
    setForm({
      title: exp.title, amount: exp.amount, category_id: exp.category_id,
      type: exp.type, date: exp.date, description: exp.description || ''
    })
    setError('')
    setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/expenses/${editing.id}`, form)
      } else {
        await api.post('/expenses', form)
      }
      setShowModal(false)
      fetchExpenses()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) setError(Object.values(errors).flat().join(' '))
      else setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this transaction?')) return
    await api.delete(`/expenses/${id}`)
    fetchExpenses()
  }

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const filtered = filterType === 'all' ? expenses : expenses.filter(e => e.type === filterType)
  const totalIncome  = expenses.filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount),0)
  const totalExpense = expenses.filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount),0)

  const years = []; for (let y = 2022; y <= now.getFullYear()+1; y++) years.push(y)
  const filteredCategories = categories.filter(c => c.type === form.type)

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:800, marginBottom:4 }}>Transactions</h1>
          <p style={{ color:'var(--text3)', fontSize:'0.875rem' }}>{MONTHS[month-1]} {year}</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
          <select className="input" style={{ width:'auto' }} value={month} onChange={e=>setMonth(+e.target.value)}>
            {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select className="input" style={{ width:'auto' }} value={year} onChange={e=>setYear(+e.target.value)}>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Transaction</button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {[
          { label:'Income',  val: totalIncome,  color:'var(--green)' },
          { label:'Expense', val: totalExpense, color:'var(--red)' },
          { label:'Balance', val: totalIncome - totalExpense, color: totalIncome-totalExpense >= 0 ? 'var(--green)' : 'var(--red)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex:1, padding:'1rem 1.25rem', minWidth:120 }}>
            <div style={{ fontSize:'0.72rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:s.color, marginTop:4 }}>
              ₹{Math.abs(s.val).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'0.375rem', marginBottom:'1rem', background:'var(--bg2)', padding:4, borderRadius:'var(--radius-sm)', width:'fit-content', border:'1px solid var(--border)' }}>
        {['all','income','expense'].map(t => (
          <button key={t} onClick={()=>setFilterType(t)} style={{
            padding:'0.4rem 0.9rem', borderRadius:6, fontSize:'0.8rem', fontWeight:500,
            background: filterType===t ? 'var(--bg4)' : 'transparent',
            color: filterType===t ? 'var(--text)' : 'var(--text3)',
            transition:'all 0.15s',
          }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}>
            <div className="spinner" style={{ width:32, height:32 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'var(--text3)' }}>
            No transactions found.
            <br /><button onClick={openAdd} style={{ color:'var(--accent2)', background:'none', marginTop:8, fontSize:'0.875rem' }}>Add your first transaction →</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Date','Title','Category','Type','Amount',''].map(h => (
                  <th key={h} style={{ padding:'0.75rem 1rem', textAlign:'left', fontSize:'0.75rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp, i) => (
                <tr key={exp.id} style={{ borderBottom: i<filtered.length-1 ? '1px solid var(--border)' : 'none', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'0.85rem 1rem', fontSize:'0.8rem', color:'var(--text3)' }}>{exp.date}</td>
                  <td style={{ padding:'0.85rem 1rem' }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{exp.title}</div>
                    {exp.description && <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:2 }}>{exp.description}</div>}
                  </td>
                  <td style={{ padding:'0.85rem 1rem' }}>
                    <span style={{ fontSize:'0.85rem' }}>{exp.category?.icon} {exp.category?.name}</span>
                  </td>
                  <td style={{ padding:'0.85rem 1rem' }}>
                    <span className={`badge badge-${exp.type}`}>{exp.type}</span>
                  </td>
                  <td style={{ padding:'0.85rem 1rem', fontFamily:'var(--font-display)', fontWeight:600, color: exp.type==='income' ? 'var(--green)' : 'var(--red)' }}>
                    {exp.type==='income' ? '+' : '-'}₹{Number(exp.amount).toLocaleString()}
                  </td>
                  <td style={{ padding:'0.85rem 1rem' }}>
                    <div style={{ display:'flex', gap:'0.375rem' }}>
                      <button onClick={()=>openEdit(exp)} className="btn btn-ghost" style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}>Edit</button>
                      <button onClick={()=>handleDelete(exp.id)} className="btn btn-danger" style={{ padding:'0.3rem 0.6rem', fontSize:'0.75rem' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Transaction' : 'New Transaction'} onClose={()=>setShowModal(false)}>
          {error && (
            <div style={{ background:'rgba(244,113,106,0.1)', border:'1px solid rgba(244,113,106,0.3)', borderRadius:'var(--radius-sm)', padding:'0.75rem', marginBottom:'1rem', fontSize:'0.85rem', color:'var(--red)' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSave}>
            {/* Type toggle */}
            <div style={{ marginBottom:'1rem' }}>
              <label className="label">Type</label>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                {['expense','income'].map(t => (
                  <button key={t} type="button" onClick={()=>setForm(f=>({...f, type:t, category_id:''}))} style={{
                    flex:1, padding:'0.6rem', borderRadius:'var(--radius-sm)', fontSize:'0.875rem', fontWeight:500,
                    background: form.type===t ? (t==='expense' ? 'rgba(244,113,106,0.15)' : 'rgba(34,211,160,0.15)') : 'var(--bg3)',
                    color: form.type===t ? (t==='expense' ? 'var(--red)' : 'var(--green)') : 'var(--text3)',
                    border: `1px solid ${form.type===t ? (t==='expense' ? 'rgba(244,113,106,0.4)' : 'rgba(34,211,160,0.4)') : 'var(--border)'}`,
                    transition:'all 0.15s',
                  }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:'1rem' }}>
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Lunch at Café" value={form.title} onChange={set('title')} required />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
              <div>
                <label className="label">Amount (₹)</label>
                <input className="input" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')} required />
              </div>
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" value={form.date} onChange={set('date')} required />
              </div>
            </div>

            <div style={{ marginBottom:'1rem' }}>
              <label className="label">Category</label>
              <select className="input" value={form.category_id} onChange={set('category_id')} required>
                <option value="">Select category...</option>
                {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:'1.5rem' }}>
              <label className="label">Note (optional)</label>
              <textarea className="input" rows={2} placeholder="Additional notes..." value={form.description} onChange={set('description')} style={{ resize:'vertical' }} />
            </div>

            <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : (editing ? 'Save Changes' : 'Add Transaction')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
