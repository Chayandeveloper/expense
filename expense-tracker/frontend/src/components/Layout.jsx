import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',           icon: '⬡',  label: 'Dashboard' },
  { to: '/expenses',   icon: '↕',  label: 'Transactions' },
  { to: '/categories', icon: '◈',  label: 'Categories' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1.5rem 2rem' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800, color:'var(--text)' }}>
            <span style={{ color:'var(--accent)' }}>Expense</span>Track
          </div>
          <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:2 }}>Personal Finance</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'0 0.75rem' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to==='/'} style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.25rem',
              color: isActive ? 'var(--text)' : 'var(--text2)',
              background: isActive ? 'var(--bg4)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.9rem',
              transition: 'all 0.15s',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}>
              <span style={{ fontSize:'1rem', width:20, textAlign:'center' }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border)', marginTop:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
            <div style={{
              width:36, height:36, borderRadius:'50%',
              background:'linear-gradient(135deg, var(--accent), #c084fc)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem',
              color:'#fff', flexShrink:0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:'0.85rem', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', fontSize:'0.8rem' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, padding:'2rem', overflowY:'auto', background:'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
