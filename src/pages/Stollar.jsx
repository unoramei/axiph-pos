import { useState } from 'react'
import { usePos } from '../context/PosContext'
import TableCard from '../components/tables/TableCard'

export default function Stollar({ onAddTable }) {
  const { state, startMultipleTables, stopMultipleTables } = usePos()
  const [collapsedZones, setCollapsedZones] = useState({})
  
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const toggleZone = (zoneId) => {
    setCollapsedZones(prev => ({ ...prev, [zoneId]: !prev[zoneId] }))
  }

  const handleSelectTable = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectedTables = selectedIds.map(id => state.tables.find(t => t.id === id)).filter(Boolean)
  const activeSelected = selectedTables.filter(t => t.active).map(t => t.id)
  const inactiveSelected = selectedTables.filter(t => !t.active).map(t => t.id)

  const handleStartMultiple = () => {
    if (inactiveSelected.length > 0) {
      startMultipleTables(inactiveSelected)
      setSelectedIds(prev => prev.filter(id => !inactiveSelected.includes(id)))
      if (selectedIds.length === inactiveSelected.length) setIsMultiSelect(false)
    }
  }

  const handleStopMultiple = () => {
    if (activeSelected.length > 0) {
      stopMultipleTables(activeSelected)
      setSelectedIds(prev => prev.filter(id => !activeSelected.includes(id)))
      if (selectedIds.length === activeSelected.length) setIsMultiSelect(false)
    }
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* Top Action Bar */}
      {state.tables.length > 0 && (
        <div className="flex justify-end mb-6">
           <button
             onClick={() => {
               setIsMultiSelect(!isMultiSelect)
               setSelectedIds([])
             }}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors border ${isMultiSelect ? 'bg-indigo text-white border-indigo' : 'bg-surface-container text-outline hover:text-on-surface border-outline-variant/30'}`}
           >
             <span className="material-symbols-outlined text-sm">{isMultiSelect ? 'close' : 'checklist'}</span>
             {isMultiSelect ? 'Bekor qilish' : 'Guruhli tanlash'}
           </button>
        </div>
      )}

      {/* Filter zones to only display the active one */}
      {state.zones
        .filter(zone => state.activeZoneId ? zone.id === state.activeZoneId : zone.id === state.zones[0]?.id)
        .map(zone => {
        const tables    = state.tables.filter(t => t.zoneId === zone.id)
        const collapsed = collapsedZones[zone.id]
        const activeCount = tables.filter(t => t.active).length
        return (
          <section key={zone.id} className="h-full">
            {/* Zone header */}
            <button
              className="w-full flex items-center justify-between py-2 border-b pb-3 mb-5 group"
              style={{ borderColor: 'rgba(70,69,84,0.15)' }}
              onClick={() => toggleZone(zone.id)}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-xl"
                  style={{
                    color: zone.isVip ? '#F59E0B' : '#c0c1ff',
                    fontVariationSettings: zone.isVip ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {zone.icon}
                </span>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-sm uppercase tracking-widest text-on-surface-variant">
                    {zone.name} — {zone.label}
                  </h3>
                  {activeCount > 0 && (
                    <span className="text-[10px] font-bold text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full uppercase">
                      {activeCount} faol
                    </span>
                  )}
                </div>
              </div>
              <span className={`material-symbols-outlined text-outline group-hover:text-on-surface transition-all ${collapsed ? 'rotate-90' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Table grid or Empty state */}
            {!collapsed && tables.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {tables.map(table => (
                  <TableCard 
                    key={table.id} 
                    table={table} 
                    selectable={isMultiSelect}
                    selected={selectedIds.includes(table.id)}
                    onSelect={() => handleSelectTable(table.id)}
                  />
                ))}
              </div>
            )}
            
            {!collapsed && tables.length === 0 && (
               <div className="flex flex-col items-center justify-center py-24 gap-4 text-outline/50 border-2 border-dashed border-outline-variant/10 rounded-xl">
                 <span className="material-symbols-outlined text-5xl">desktop_windows</span>
                 <p className="text-sm font-medium tracking-wide">Bu zonada hozircha stollar yo'q</p>
                 <button
                   onClick={onAddTable}
                   className="mt-2 flex items-center gap-2 bg-surface-container hover:bg-indigo hover:text-white text-outline transition-all px-4 py-2 rounded-lg text-xs font-semibold uppercase hover:shadow-lg"
                 >
                   Stol qo'shish
                 </button>
               </div>
            )}
          </section>
        )
      })}

      {state.tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-outline">
          <span className="material-symbols-outlined text-5xl">desktop_windows</span>
          <p className="text-sm">Hali stol qo'shilmagan</p>
          <button
            onClick={onAddTable}
            className="flex items-center gap-2 bg-indigo text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm icon-filled">add_circle</span>
            Stol qo'shish
          </button>
        </div>
      )}

      {/* Floating Action Bar */}
      {isMultiSelect && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-highest/80 backdrop-blur-xl border border-outline-variant/30 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-6">
          <div className="flex flex-col border-r border-outline-variant/30 pr-6 mr-2">
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest leading-tight">Tanlandi</span>
            <span className="text-2xl font-bold text-on-surface leading-none mt-1">{selectedIds.length} <span className="text-sm font-medium text-outline-variant">ta</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            {inactiveSelected.length > 0 && (
              <button
                onClick={handleStartMultiple}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-sm bg-tertiary/10 text-tertiary border border-tertiary/20 hover:bg-tertiary hover:text-on-tertiary active:scale-95 transition-all shadow-lg shadow-tertiary/10"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                <span>Boshlash ({inactiveSelected.length})</span>
              </button>
            )}

            {activeSelected.length > 0 && (
              <button
                onClick={handleStopMultiple}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-sm bg-error/10 text-error border border-error/20 hover:bg-error hover:text-on-error active:scale-95 transition-all shadow-lg shadow-error/10"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>stop</span>
                <span>Tugatish ({activeSelected.length})</span>
              </button>
            )}

            {selectedIds.length === 0 && (
               <div className="px-2 text-sm text-outline-variant italic">Stol tanlang...</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
