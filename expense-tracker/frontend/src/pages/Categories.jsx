import React, { useState, useEffect } from 'react'
import api from '../api/axios'

const ICONS = ['🍔','🚗','🛍️','💡','💊','🎮','📚','🏠','✈️','🎵','🐶','☕','🏋️','💇','🎁','💼','💻','📈','🎓','🌿','🍕','🎬','🛒','💰','🏦','💸']
const COLORS = ['#7c6dfa','#22d3a0','#f4716a','#fbbf24','#ec4899','#3b82f6','#a855f7','#06b6d4','#f97316','#10b981','#ef4444','#14b8a6']

const EMPTY = { name:'', icon:'💰', color:'#7c6dfa', type:'expense' }

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'1rem'
    }}>
      <div className="card fade-in" style={{ width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', color:'var(--text3)', fontSize:'1.25rem' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('expense')

  const fetch = async () => {
    setLoading(true)
    const res = await api.get('/categories')
    setCategories(res.data)
    setLoading(false)
  }
  useEffect(() => { fetch() }, [])

  const openAdd  = () => { setEditing(null); setForm({...EMPTY, type:tab}); setShowModal(true) }
  const openEdit = c  => { setEditing(c); setForm({ name:c.name, icon:c.icon, color:c.color, type:c.type }); setShowModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await api.put(`/categories/${editing.id}`, form)
      else await api.post('/categories', form)
      setShowModal(false)
      fetch()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async id => {
    if (!confirm('Delete this category? This may affect existing transactions.')) return
    await api.delete(`/categories/${id}`)
    fetch()
  }

  const set = k => v => setForm(f => ({...f, [k]: typeof v === 'string' ? v : v.target.value}))

  const filtered = categories.filter(c => c.type === tab)

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:800, marginBottom:4 }}>Categories</h1>
          <p style={{ color:'var(--text3)', fontSize:'0.875rem' }}>Organize your transactions</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.375rem', marginBottom:'1.25rem', background:'var(--bg2)', padding:4, borderRadius:'var(--radius-sm)', width:'fit-content', border:'1px solid var(--border)' }}>
        {['expense','income'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'0.4rem 1rem', borderRadius:6, fontSize:'0.85rem', fontWeight:500,
            background: tab===t ? 'var(--bg4)' : 'transparent',
            color: tab===t ? 'var(--text)' : 'var(--text3)',
            transition:'all 0.15s',
          }}>{t.charAt(0).toUpperCase()+t.slice(1)} Categories</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
          <div className="spinner" style={{ width:32, height:32 }} />
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'0.875rem' }}>
          {filtered.map(cat => (
            <div key={cat.id} className="card" style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem', position:'relative', overflow:'hidden' }}>
              {/* Color strip */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:cat.color, borderRadius:'14px 14px 0 0' }} />
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{
                  width:44, height:44, borderRadius:10,
                  background: cat.color+'22',
                  border: `1px solid ${cat.color}44`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.4rem',
                }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{cat.name}</div>
                  <span className={`badge badge-${cat.type}`} style={{ marginTop:2, fontSize:'0.7rem' }}>{cat.type}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end', marginTop:'auto' }}>
                <button onClick={()=>openEdit(cat)} className="btn btn-ghost" style={{ padding:'0.3rem 0.7rem', fontSize:'0.75rem' }}>Edit</button>
                <button onClick={()=>handleDelete(cat.id)} className="btn btn-danger" style={{ padding:'0.3rem 0.7rem', fontSize:'0.75rem' }}>Delete</button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ color:'var(--text3)', fontSize:'0.875rem', gridColumn:'1/-1', textAlign:'center', padding:'2rem' }}>
              No {tab} categories yet.
              <br/><button onClick={openAdd} style={{ color:'var(--accent2)', background:'none', marginTop:8, fontSize:'0.875rem' }}>Create one →</button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Category' : 'New Category'} onClose={()=>setShowModal(false)}>
          <form onSubmit={handleSave}>
            {/* Type */}
            <div style={{ marginBottom:'1rem' }}>
              <label className="label">Type</label>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                {['expense','income'].map(t=>(
                  <button key={t} type="button" onClick={()=>setForm(f=>({...f, type:t}))} style={{
                    flex:1, padding:'0.6rem', borderRadius:'var(--radius-sm)', fontSize:'0.875rem', fontWeight:500,
                    background: form.type===t ? (t==='expense' ? 'rgba(244,113,106,0.15)' : 'rgba(34,211,160,0.15)') : 'var(--bg3)',
                    color: form.type===t ? (t==='expense' ? 'var(--red)' : 'var(--green)') : 'var(--text3)',
                    border:`1px solid ${form.type===t ? (t==='expense' ? 'rgba(244,113,106,0.4)' : 'rgba(34,211,160,0.4)') : 'var(--border)'}`,
                  }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:'1rem' }}>
              <label className="label">Name</label>
              <input className="input" placeholder="Category name" value={form.name} onChange={set('name')} required />
            </div>

            {/* Icon picker */}
            <div style={{ marginBottom:'1rem' }}>
              <label className="label">Icon</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', padding:'0.75rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                {ICONS.map(ic=>(
                  <button key={ic} type="button" onClick={()=>set('icon')(ic)} style={{
                    width:36, height:36, borderRadius:6, fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center',
                    background: form.icon===ic ? 'var(--accent)' : 'var(--bg4)',
                    border:`1px solid ${form.icon===ic ? 'var(--accent)' : 'var(--border)'}`,
                    transition:'all 0.1s',
                  }}>{ic}</button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div style={{ marginBottom:'1.5rem' }}>
              <label className="label">Color</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', padding:'0.75rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)' }}>
                {COLORS.map(c=>(
                  <button key={c} type="button" onClick={()=>set('color')(c)} style={{
                    width:28, height:28, borderRadius:'50%', background:c, border:`3px solid ${form.color===c ? '#fff' : 'transparent'}`,
                    transition:'all 0.1s', transform: form.color===c ? 'scale(1.15)' : 'scale(1)',
                  }}/>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginBottom:'1.5rem', padding:'0.75rem', background:'var(--bg3)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <div style={{ width:40, height:40, borderRadius:8, background:form.color+'22', border:`1px solid ${form.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem' }}>
                {form.icon}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{form.name || 'Category Name'}</div>
                <span className={`badge badge-${form.type}`} style={{ fontSize:'0.7rem' }}>{form.type}</span>
              </div>
            </div>

            <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner"/> : (editing ? 'Save Changes' : 'Create Category')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
