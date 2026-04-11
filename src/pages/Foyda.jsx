import { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { usePos, formatPrice } from '../context/PosContext'

const PERIODS = [
  { label: '1 kun',  days: 1  },
  { label: '7 kun',  days: 7  },
  { label: '30 kun', days: 30 },
  { label: '90 kun', days: 90 },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container-highest border border-outline-variant/20 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] text-outline mb-1">{label}</p>
      <p className="text-sm font-mono font-bold text-on-surface">{formatPrice(payload[0].value)}</p>
    </div>
  )
}

export default function Foyda() {
  const { state } = usePos()
  const [period, setPeriod] = useState(7)

  const data = useMemo(() => {
    const sliced = state.revenueHistory.slice(-period)
    return sliced.map(d => ({
      date: d.date.slice(5), // MM-DD
      revenue: d.revenue,
    }))
  }, [state.revenueHistory, period])

  const total     = data.reduce((s, d) => s + d.revenue, 0)
  const average   = Math.round(total / data.length)
  const maxDay    = data.reduce((max, d) => d.revenue > max.revenue ? d : max, data[0])
  const minDay    = data.reduce((min, d) => d.revenue < min.revenue ? d : min, data[0])

  const KPIS = [
    { label: 'Jami foyda',   value: formatPrice(total),   icon: 'account_balance_wallet', color: 'text-primary' },
    { label: "O'rtacha / kun", value: formatPrice(average), icon: 'analytics',             color: 'text-tertiary' },
    { label: 'Eng ko\'p',      value: formatPrice(maxDay?.revenue ?? 0), icon: 'arrow_upward', color: 'text-tertiary' },
    { label: 'Eng kam',       value: formatPrice(minDay?.revenue ?? 0), icon: 'arrow_downward', color: 'text-error' },
  ]

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              period === p.days
                ? 'bg-indigo text-white'
                : 'bg-surface-container text-outline border border-outline-variant/20 hover:border-indigo/40 hover:text-on-surface'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map(k => (
          <div key={k.label} className="bg-surface-container border border-outline-variant/20 rounded-xl p-5">
            <div className="w-9 h-9 rounded-lg bg-outline-variant/10 flex items-center justify-center mb-3">
              <span className={`material-symbols-outlined text-lg ${k.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {k.icon}
              </span>
            </div>
            <p className="text-[11px] text-outline uppercase tracking-widest font-bold mb-1">{k.label}</p>
            <p className={`text-xl font-bold font-mono ${k.color} leading-none`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-on-surface text-sm">Daromad dinamikasi</h3>
            <p className="text-[11px] text-outline mt-0.5">So'nggi {period} kun</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(70,69,84,0.2)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#908fa0', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={period <= 7 ? 0 : Math.floor(period / 7)}
            />
            <YAxis
              tick={{ fill: '#908fa0', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => (v / 1000) + 'K'}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366F1', stroke: '#e1e0ff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart per day-of-week breakdown */}
      {period >= 7 && (
        <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-6">
          <div className="mb-5">
            <h3 className="font-semibold text-on-surface text-sm">Haftalik solishtirma</h3>
            <p className="text-[11px] text-outline mt-0.5">Har kun bo'yicha jami</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.slice(-14)} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(70,69,84,0.2)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#908fa0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#908fa0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000) + 'K'} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="revenue" fill="#4ae176" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
