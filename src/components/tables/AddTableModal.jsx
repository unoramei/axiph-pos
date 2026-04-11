import { useState } from 'react'
import { usePos } from '../../context/PosContext'

export default function AddTableModal({ onClose }) {
  const { state, addTable } = usePos()
  const defaultZoneId = state.activeZoneId || state.zones[0]?.id || ''
  const defaultZone = state.zones.find(z => z.id === defaultZoneId)
  
  const [name, setName]   = useState('')
  const [zoneId, setZoneId] = useState(defaultZoneId)
  const [price, setPrice]   = useState(defaultZone?.pricePerHour || 10000)

  const handleZoneChange = (id) => {
    setZoneId(id)
    const zone = state.zones.find(z => z.id === id)
    if (zone) setPrice(zone.pricePerHour)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addTable({ 
      name: name.trim(), 
      zoneId, 
      pricePerHour: parseInt(price, 10) || 10000 
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface-container-high border border-outline-variant/20 rounded-xl p-6 w-80 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined icon-filled">add_circle</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-sm">Yangi stol qo'shish</h3>
            <p className="text-[11px] text-outline">Zonani tanlang va nom bering</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
              Stol nomi
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="masalan: 16-stol"
              className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2.5 px-3 text-sm text-on-surface focus:border-indigo focus:ring-0 outline-none transition-colors placeholder:text-outline-variant"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
              Zona
            </label>
            <select
              value={zoneId}
              onChange={e => handleZoneChange(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2.5 px-3 text-sm text-on-surface focus:border-indigo focus:ring-0 outline-none transition-colors"
            >
              {state.zones.map(z => (
                <option key={z.id} value={z.id} className="bg-surface-container">
                  {z.name} — {z.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
              Soatiga narxi (UZS)
            </label>
            <input
              type="number"
              value={price === 0 ? '' : price}
              onChange={e => setPrice(parseInt(e.target.value) || 0)}
              placeholder="10000"
              className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2.5 px-3 text-sm font-mono text-on-surface focus:border-indigo focus:ring-0 outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-outline-variant/20 text-outline text-xs font-bold uppercase tracking-wider hover:bg-surface-container transition-colors"
            >
              Bekor
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-indigo text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95"
            >
              Qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
