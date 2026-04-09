import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../api/axios'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ flex:1 }}>
      <div style={{ fontSize:'0.75rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, color: color || 'var(--text)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:'0.8rem', color:'var(--text3)', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'0.75rem 1rem', fontSize:'0.8rem' }}>
      <div style={{ color:'var(--text2)', marginBottom:6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.name==='income' ? 'var(--green)' : 'var(--red)', display:'flex', justifyContent:'space-between', gap:16 }}>
          <span>{p.name==='income' ? 'Income' : 'Expense'}</span>
          <span>₹{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [summary, setSummary] = useState(null)
  const [recentExpenses, setRecentExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sumRes, expRes] = await Promise.all([
        api.get(`/summary?year=${year}&month=${month}`),
        api.get(`/expenses?month=${month}&year=${year}`),
      ])
      setSummary(sumRes.data)
      setRecentExpenses(expRes.data.slice(0, 8))
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [year, month])

  const monthData = summary?.monthly || []
  const breakdown = summary?.category_breakdown || []
  const expenseBreakdown = breakdown.filter(b => b.type === 'expense')

  const currentMonth = monthData[month - 1]
  const totalIncome  = currentMonth?.income  || 0
  const totalExpense = currentMonth?.expense || 0
  const balance      = currentMonth?.balance || 0

  const chartData = monthData.map((m, i) => ({
    name: MONTHS[i],
    income: m.income,
    expense: m.expense,
  }))

  const COLORS = ['#7c6dfa','#22d3a0','#f4716a','#fbbf24','#ec4899','#3b82f6','#a855f7','#06b6d4']

  const years = []
  for (let y = 2022; y <= new Date().getFullYear() + 1; y++) years.push(y)

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:800, marginBottom:4 }}>Dashboard</h1>
          <p style={{ color:'var(--text3)', fontSize:'0.875rem' }}>Your financial overview</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <select className="input" style={{ width:'auto' }} value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select className="input" style={{ width:'auto' }} value={year} onChange={e => setYear(+e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
          <div className="spinner" style={{ width:36, height:36 }} />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
            <StatCard label="Total Income"  value={`₹${totalIncome.toLocaleString()}`}  color="var(--green)" sub={`${MONTHS[month-1]} ${year}`} />
            <StatCard label="Total Expense" value={`₹${totalExpense.toLocaleString()}`} color="var(--red)"   sub={`${MONTHS[month-1]} ${year}`} />
            <StatCard label="Net Balance"   value={`₹${Math.abs(balance).toLocaleString()}`} color={balance >= 0 ? 'var(--green)' : 'var(--red)'} sub={balance >= 0 ? 'Surplus' : 'Deficit'} />
          </div>

          {/* Charts row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1rem', marginBottom:'1.5rem' }}>
            {/* Bar chart */}
            <div className="card">
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem' }}>
                Monthly Overview — {year}
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill:'var(--text3)', fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="income"  fill="var(--green)" radius={[4,4,0,0]} />
                  <Bar dataKey="expense" fill="var(--red)"   radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="card">
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'1rem', fontSize:'1rem' }}>
                Spending by Category
              </div>
              {expenseBreakdown.length === 0 ? (
                <div style={{ color:'var(--text3)', fontSize:'0.875rem', textAlign:'center', paddingTop:'4rem' }}>No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="total" nameKey={d => d.category?.name} cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                      {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8 }} />
                    <Legend formatter={(v) => <span style={{ fontSize:11, color:'var(--text2)' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem' }}>
              Recent Transactions — {MONTHS[month-1]}
            </div>
            {recentExpenses.length === 0 ? (
              <div style={{ color:'var(--text3)', fontSize:'0.875rem', textAlign:'center', padding:'2rem' }}>
                No transactions this month. <a href="/expenses" style={{ color:'var(--accent2)' }}>Add one →</a>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {recentExpenses.map(exp => (
                  <div key={exp.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'0.75rem', borderRadius:'var(--radius-sm)',
                    background:'var(--bg3)',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <div style={{
                        width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                        background: exp.type==='income' ? 'rgba(34,211,160,0.1)' : 'rgba(244,113,106,0.1)',
                        fontSize:'1rem',
                      }}>
                        {exp.category?.icon || '💰'}
                      </div>
                      <div>
                        <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{exp.title}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--text3)' }}>{exp.category?.name} · {exp.date}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', color: exp.type==='income' ? 'var(--green)' : 'var(--red)' }}>
                      {exp.type==='income' ? '+' : '-'}₹{Number(exp.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
