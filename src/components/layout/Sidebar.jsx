import { useState } from 'react'
import { usePos } from '../../context/PosContext'

export default function Sidebar({ isOpen, onClose }) {
  const { state, setPage, setActiveZone } = usePos()

  // Sort zones: Normal zones first, VIP zones last
  const sortedZones = [...state.zones].sort((a, b) => {
    if (a.isVip && !b.isVip) return 1
    if (!a.isVip && b.isVip) return -1
    return 0
  })

  return (
    <aside className={`
      fixed left-0 top-0 h-full w-[220px] bg-surface-container-low flex flex-col justify-between py-6 z-50
      shadow-2xl lg:shadow-none border-r border-outline-variant/20 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-6 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined icon-filled text-white text-xl">sports_esports</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-indigo tracking-tighter leading-none">GameDesk</h1>
              <p className="text-[10px] text-outline font-medium uppercase tracking-widest mt-0.5">Management Pro</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5 px-3">
          <p className="px-5 text-[10px] font-bold text-outline-variant uppercase tracking-[0.2em] mb-2 mt-4 text-center">Zonalar Ro'yxati</p>

          {/* Dynamic Zones Only */}
          {sortedZones.map(zone => {
            const active = state.page === 'zonalar' && state.activeZoneId === zone.id
            return (
              <button
                key={zone.id}
                onClick={() => { 
                  setPage('zonalar'); 
                  setActiveZone(zone.id); 
                  onClose(); 
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left
                  font-label text-[13px] font-medium uppercase tracking-tight
                  ${active
                    ? 'text-indigo bg-surface-container border-r-2 border-indigo rounded-r-none'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container'}
                `}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ color: zone.isVip ? '#F59E0B' : 'inherit', fontVariationSettings: zone.isVip ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {zone.icon}
                </span>
                <span className="truncate flex-1">{zone.name}</span>
                {zone.isVip && (
                  <span className="text-[8px] font-black bg-amber/10 text-amber border border-amber/20 px-1 rounded">VIP</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Admin User */}
      <div className="px-6">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container border border-outline-variant/10">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-sm icon-filled">account_circle</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-on-surface truncate">Admin</p>
            <p className="text-[10px] text-outline truncate">Superuser</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
