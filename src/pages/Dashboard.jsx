import { usePos, calcTotal, formatTime, formatPrice, getLocalDayString } from '../context/PosContext'

export default function Dashboard() {
  const { state } = usePos()

  const todayStr = getLocalDayString()
  const activeTables  = state.tables.filter(t => t.active)
  
  // Historical revenue from all past days (excluding today)
  const pastRevenue = state.revenueHistory
    .filter(h => h.date !== todayStr)
    .reduce((s, h) => s + h.revenue, 0)

  // Current session values (active + completed today)
  const liveRevenueValue = activeTables.reduce((s, t) => s + calcTotal(t, state.foods), 0)
  const completedToday   = state.completedSessions.filter(s => s.date === todayStr)
  const completedTodayVal = completedToday.reduce((s, sess) => s + sess.total, 0)

  const todayRevenue = completedTodayVal + liveRevenueValue
  const totalRevenue = pastRevenue + todayRevenue
  const liveRevenue  = liveRevenueValue

  const STATS = [
    {
      label:   'Faol stollar',
      value:   activeTables.length,
      suffix:  ` / ${state.tables.length}`,
      icon:    'monitor',
      color:   'text-primary',
      bg:      'bg-primary/10',
    },
    {
      label:  "Bugungi foyda",
      value:  formatPrice(todayRevenue),
      icon:   'today',
      color:  'text-tertiary',
      bg:     'bg-tertiary/10',
    },
    {
      label:  "Jonli daromad",
      value:  formatPrice(liveRevenue),
      icon:   'payments',
      color:  'text-amber',
      bg:     'bg-amber/10',
    },
    {
      label:  "Jami daromad",
      value:  formatPrice(totalRevenue),
      icon:   'account_balance_wallet',
      color:  'text-indigo',
      bg:     'bg-indigo/10',
    },
  ]

  return (
    <div>
      {/* KPI stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="bg-surface-container border border-outline-variant/20 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {s.icon}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-outline uppercase tracking-widest font-bold mb-1">{s.label}</p>
            <p className={`text-2xl font-bold font-mono ${s.color} leading-none`}>
              {s.value}
              {s.suffix && <span className="text-base text-outline font-mono ml-1">{s.suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Active Tables Live View */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest">Faol seanlar</h3>
          <span className="text-[10px] text-outline-variant">Har soniyada yangilanadi</span>
        </div>

        {activeTables.length === 0 ? (
          <div className="bg-surface-container border border-dashed border-outline-variant/20 rounded-xl p-10 flex flex-col items-center gap-3 text-outline">
            <span className="material-symbols-outlined text-4xl">timer_off</span>
            <p className="text-sm">Hozirda faol seans yo'q</p>
          </div>
        ) : (
          <div className="bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant/10">
                  <th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Stol</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Zona</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Vaqt</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Buyurtmalar</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider text-right">Joriy summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {activeTables.map(t => {
                  const zone  = state.zones.find(z => z.id === t.zoneId)
                  const total = calcTotal(t, state.foods)
                  return (
                    <tr key={t.id} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-on-surface text-sm">{t.name}</span>
                        {t.isVip && (
                          <span className="ml-2 text-[9px] text-amber font-bold uppercase bg-amber/10 border border-amber/20 px-1.5 py-0.5 rounded-full">VIP</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-outline">{zone?.name ?? '—'}</td>
                      <td className="px-5 py-3 font-mono text-sm text-tertiary timer-pulse">{formatTime(t.elapsedSeconds)}</td>
                      <td className="px-5 py-3 text-sm text-outline-variant">
                        {t.orders.length === 0 ? '—' : t.orders.map(o => {
                          const food = state.foods.find(f => f.id === o.foodId)
                          return food ? `${food.name}(${o.qty})` : ''
                        }).join(', ')}
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-on-surface text-sm text-right">
                        {formatPrice(total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent sessions */}
      {state.completedSessions.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Oxirgi seanlar</h3>
          <div className="bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[400px]">
                <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant/10">
                  <th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Stol</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Davomiyligi</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider text-right">Jami</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {state.completedSessions.slice(0, 8).map(s => (
                  <tr key={s.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-on-surface">{s.tableName}</td>
                    <td className="px-5 py-3 font-mono text-sm text-outline-variant">{formatTime(s.elapsedSeconds)}</td>
                    <td className="px-5 py-3 font-mono font-bold text-tertiary text-sm text-right">{formatPrice(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
