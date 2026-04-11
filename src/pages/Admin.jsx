import { useState } from 'react'
import { usePos, formatPrice } from '../context/PosContext'

function SectionHeader({ icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-outline text-lg">{icon}</span>
        <h3 className="text-xs font-bold text-outline uppercase tracking-widest">{title}</h3>
      </div>
      {action}
    </div>
  )
}

function ZoneManager() {
  const { state, removeZone, updateZonePrice, addZone, updateZone, addTable, removeTable, updateTablePrice } = usePos()
  const [editingPrice, setEditingPrice] = useState(null) // { id, type: 'zone'|'table', value }
  const [addingZone, setAddingZone]     = useState(false)
  const [editingZone, setEditingZone]   = useState(null)
  const [newZone, setNewZone]           = useState({ name: '', label: '', isVip: false, pricePerHour: 10000, icon: 'layers' })
  const [expandedZones, setExpandedZones] = useState([])
  const [newTableNames, setNewTableNames] = useState({})

  const AVAILABLE_ICONS = [
    'layers', 'workspace_premium', 'sports_esports', 'videogame_asset', 
    'computer', 'devices', 'videocam', 'dns'
  ]

  const toggleExpand = (id) => {
    setExpandedZones(prev => prev.includes(id) ? prev.filter(zid => zid !== id) : [...prev, id])
  }

  const commitPrice = () => {
    if (!editingPrice) return
    const price = parseInt(editingPrice.value.replace(/\D/g, ''), 10)
    if (!isNaN(price) && price > 0) {
      if (editingPrice.type === 'zone') updateZonePrice({ zoneId: editingPrice.id, price })
      else updateTablePrice({ id: editingPrice.id, price })
    }
    setEditingPrice(null)
  }

  const handleAddTable = (zoneId) => {
    const name = newTableNames[zoneId]
    if (!name?.trim()) return
    const zone = state.zones.find(z => z.id === zoneId)
    addTable({ name: name.trim(), zoneId, pricePerHour: zone?.pricePerHour || 10000 })
    setNewTableNames(p => ({ ...p, [zoneId]: '' }))
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icon="layers"
        title="Zonalar va stollarni boshqaruvi"
        action={
          <button onClick={() => setAddingZone(v => !v)} className="flex items-center gap-1.5 text-indigo text-xs font-bold uppercase hover:underline">
            <span className="material-symbols-outlined text-sm">add</span>Zona qo'shish
          </button>
        }
      />

      {addingZone && (
        <div className="bg-surface-container-high border border-indigo/20 rounded-xl p-4 space-y-4 shadow-xl">
          <p className="text-[11px] text-outline uppercase tracking-widest font-bold">Yangi zona ma'lumotlari</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-[11px] text-outline mb-1">Nomi</label><input value={newZone.name} onChange={e => setNewZone(p => ({ ...p, name: e.target.value }))} placeholder="PlayStation" className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 px-3 text-sm focus:border-indigo outline-none transition-colors" /></div>
            <div><label className="block text-[11px] text-outline mb-1">Tavsif</label><input value={newZone.label} onChange={e => setNewZone(p => ({ ...p, label: e.target.value }))} placeholder="PS5 zali" className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 px-3 text-sm focus:border-indigo outline-none transition-colors" /></div>
            <div><label className="block text-[11px] text-outline mb-1">Narx</label><input type="number" value={newZone.pricePerHour || ''} onChange={e => setNewZone(p => ({ ...p, pricePerHour: parseInt(e.target.value) || 0 }))} className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 px-3 text-sm font-mono focus:border-indigo outline-none transition-colors" /></div>
            <div className="flex items-end pb-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newZone.isVip} onChange={e => setNewZone(p => ({ ...p, isVip: e.target.checked, icon: e.target.checked ? 'workspace_premium' : 'layers' }))} className="rounded" /><span className="text-sm text-on-surface">VIP zona</span></label></div>
          </div>
          <div><label className="block text-[11px] text-outline mb-2">Ikonka</label><div className="flex flex-wrap gap-2">{AVAILABLE_ICONS.map(ic => (<button key={ic} onClick={() => setNewZone(p => ({ ...p, icon: ic }))} className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${newZone.icon === ic ? 'bg-indigo/20 border-indigo text-indigo' : 'bg-surface-container border-outline-variant/20 text-outline'}`}><span className="material-symbols-outlined text-xl">{ic}</span></button>))}</div></div>
          <div className="flex gap-2 pt-2"><button onClick={() => setAddingZone(false)} className="flex-1 py-2 rounded-lg border border-outline-variant/20 text-outline text-xs font-bold uppercase hover:bg-surface-container">Bekor</button><button onClick={() => { if (!newZone.name) return; addZone({ id: 'zone-' + Date.now(), ...newZone }); setNewZone({ name: '', label: '', isVip: false, pricePerHour: 10000, icon: 'layers' }); setAddingZone(false); }} className="flex-1 py-2 rounded-lg bg-indigo text-white text-xs font-bold uppercase hover:opacity-90 transition-all">Saqlash</button></div>
        </div>
      )}

      <div className="space-y-3">
        {state.zones.map(zone => {
          const isExpanded = expandedZones.includes(zone.id)
          const zoneTables = state.tables.filter(t => t.zoneId === zone.id)
          const isEditingP = editingPrice?.id === zone.id && editingPrice.type === 'zone'
          return (
            <div key={zone.id} className="bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden transition-all shadow-sm">
              <div className="flex items-center justify-between p-4 bg-surface-container-high/50">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleExpand(zone.id)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 bg-indigo/10 text-indigo' : 'text-outline hover:bg-surface-container-highest'}`}><span className="material-symbols-outlined">expand_more</span></button>
                  <div className="flex items-center gap-3"><span className="material-symbols-outlined text-xl w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-high border border-outline-variant/10 shadow-sm" style={{ color: zone.isVip ? '#F59E0B' : '#c0c1ff', fontVariationSettings: "'FILL' 1" }}>{zone.icon}</span><div><h4 className="font-bold text-on-surface">{zone.name}</h4><p className="text-[10px] text-outline uppercase tracking-widest">{zone.label || 'Zona'}</p></div></div>
                </div>
                <div className="flex items-center gap-6">
                  <div><p className="text-[10px] text-outline uppercase tracking-widest mb-0.5 text-right">Narxi</p>{isEditingP ? (<div className="flex items-center gap-1.5 border border-indigo rounded-lg px-2 py-1 bg-surface-container-highest"><input autoFocus value={editingPrice.value} onChange={e => setEditingPrice(p => ({ ...p, value: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') setEditingPrice(null) }} className="bg-transparent border-none outline-none font-mono text-sm text-on-surface w-24" /><button onClick={commitPrice} className="text-tertiary"><span className="material-symbols-outlined text-base">check</span></button></div>) : (<button onClick={() => setEditingPrice({ id: zone.id, type: 'zone', value: String(zone.pricePerHour) })} className="flex items-center gap-1.5 hover:bg-surface-container-highest px-3 py-1 rounded-lg transition-colors group/price ml-auto"><span className="font-mono text-sm text-on-surface">{formatPrice(zone.pricePerHour)}</span><span className="material-symbols-outlined text-xs text-outline opacity-0 group-hover/price:opacity-100">edit</span></button>)}</div>
                  <div className="flex items-center gap-2 border-l border-outline-variant/20 pl-4"><button onClick={() => setEditingZone({ ...zone })} className="p-2 text-outline hover:text-indigo hover:bg-indigo/10 rounded-lg transition-all"><span className="material-symbols-outlined text-lg">settings</span></button><button onClick={() => removeZone(zone.id)} className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-all"><span className="material-symbols-outlined text-lg">delete</span></button></div>
                </div>
              </div>
              {isExpanded && (
                <div className="p-4 border-t border-outline-variant/10 bg-surface-container-lowest/30 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-4"><h5 className="text-[11px] font-bold text-outline uppercase tracking-widest">Stollar ({zoneTables.length})</h5><div className="flex items-center gap-2"><input placeholder="Stol nomi" value={newTableNames[zone.id] || ''} onChange={e => setNewTableNames(p => ({ ...p, [zone.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddTable(zone.id)} className="bg-surface-container-high border border-outline-variant/30 rounded-lg py-1.5 px-3 text-xs text-on-surface outline-none focus:border-indigo w-32" /><button onClick={() => handleAddTable(zone.id)} className="flex items-center gap-1 bg-indigo text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo/90 transition-all"><span className="material-symbols-outlined text-sm">add</span>Qo'shish</button></div></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">{zoneTables.map(t => (<div key={t.id} className="bg-surface-container border border-outline-variant/10 rounded-lg p-3 flex flex-col justify-between group"><div className="flex items-start justify-between mb-2"><div><p className="font-bold text-sm text-on-surface">{t.name}</p><p className="text-[10px] text-outline-variant font-medium">{t.active ? 'Band' : 'Bo\'sh'}</p></div><button onClick={() => !t.active && removeTable(t.id)} className={`p-1 rounded hover:bg-error/10 text-outline-variant transition-all ${t.active ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 hover:text-error'}`}><span className="material-symbols-outlined text-sm">close</span></button></div><div className="border-t border-outline-variant/5 pt-2 mt-auto">{editingPrice?.id === t.id && editingPrice.type === 'table' ? (<div className="flex items-center gap-1"><input autoFocus className="bg-surface-container-highest border border-indigo rounded px-1.5 py-0.5 text-[10px] text-on-surface w-full" value={editingPrice.value} onChange={e => setEditingPrice(p => ({ ...p, value: e.target.value }))} onBlur={commitPrice} onKeyDown={e => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') setEditingPrice(null); }} /></div>) : (<div className="flex items-center justify-between cursor-pointer hover:bg-surface-container-highest p-1 rounded -m-1 transition-colors" onClick={() => setEditingPrice({ id: t.id, type: 'table', value: String(t.pricePerHour) })}><span className="text-[10px] font-mono text-outline">{formatPrice(t.pricePerHour)}</span><span className="material-symbols-outlined text-[10px] text-outline opacity-0 group-hover:opacity-100">edit</span></div>)}</div></div>))}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editingZone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-surface-container-high border border-outline-variant/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-4 bg-surface-container-highest border-b border-outline-variant/10 flex items-center justify-between"><h3 className="font-black text-xs uppercase tracking-widest text-on-surface">Zona sozlamalari</h3><button onClick={() => setEditingZone(null)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button></div>
              <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-[10px] font-bold text-outline uppercase mb-1">Zona nomi</label><input className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 px-3 text-sm text-on-surface outline-none focus:border-indigo" value={editingZone.name} onChange={e => setEditingZone(p => ({ ...p, name: e.target.value }))} /></div>
                     <div><label className="block text-[10px] font-bold text-outline uppercase mb-1">Tavsif</label><input className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 px-3 text-sm text-on-surface outline-none focus:border-indigo" value={editingZone.label} onChange={e => setEditingZone(p => ({ ...p, label: e.target.value }))} /></div>
                  </div>
                  <div><label className="block text-[10px] font-bold text-outline uppercase mb-2">Ikonka</label><div className="flex flex-wrap gap-2">{AVAILABLE_ICONS.map(ic => (<button key={ic} onClick={() => setEditingZone(p => ({ ...p, icon: ic }))} className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${editingZone.icon === ic ? 'bg-indigo/20 border-indigo text-indigo' : 'bg-surface-container border-outline-variant/20 hover:border-outline-variant/50'}`}><span className="material-symbols-outlined text-xl">{ic}</span></button>))}</div></div>
                  <div className="border-t border-outline-variant/10 pt-4 flex gap-2"><button onClick={() => setEditingZone(null)} className="flex-1 py-2.5 rounded-xl border border-outline-variant/20 text-outline text-xs font-bold uppercase">Bekor</button><button onClick={() => { updateZone(editingZone); setEditingZone(null); }} className="flex-1 py-2.5 rounded-xl bg-indigo text-white text-xs font-bold uppercase">Saqlash</button></div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function FoodManager() {
  const { state, addFood, removeFood, updateFood } = usePos()
  const [showAdd, setShowAdd] = useState(false)
  const [newFood, setNewFood] = useState({ name: '', price: '', category: 'Ichimliklar' })
  const [editId,  setEditId]  = useState(null)
  const [editVal, setEditVal] = useState('')

  return (
    <div>
      <SectionHeader icon="fastfood" title="Menyu boshqaruvi" action={<button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-1.5 bg-indigo text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase shadow-lg shadow-indigo/20 hover:opacity-90 transition-all"><span className="material-symbols-outlined text-sm">add</span>Taom qo'shish</button>} />
      {showAdd && (
        <div className="mb-5 bg-surface-container-high border border-indigo/20 rounded-xl p-4 space-y-3 shadow-xl">
          <p className="text-[11px] text-outline uppercase tracking-widest font-bold">Yangi maxsulot</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="sm:col-span-2 md:col-span-2"><label className="block text-[11px] text-outline mb-1">Nomi</label><input value={newFood.name} onChange={e => setNewFood(p => ({ ...p, name: e.target.value }))} placeholder="Nomi" className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 px-3 text-sm focus:border-indigo outline-none" /></div>
            <div><label className="block text-[11px] text-outline mb-1">Narxi</label><input type="number" value={newFood.price || ''} onChange={e => setNewFood(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 px-3 text-sm font-mono focus:border-indigo outline-none" /></div>
            <div><label className="block text-[11px] text-outline mb-1">Kategoriya</label><select value={newFood.category} onChange={e => setNewFood(p => ({ ...p, category: e.target.value }))} className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 px-3 text-sm focus:border-indigo outline-none"><option>Ichimliklar</option><option>Ovqatlar</option><option>Shirinliklar</option><option>Boshqa</option></select></div>
          </div>
          <div className="flex gap-2"><button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg border border-outline-variant/20 text-outline text-xs font-bold uppercase">Bekor</button><button onClick={() => { if (!newFood.name || !newFood.price) return; addFood({ ...newFood, price: parseInt(newFood.price, 10) }); setNewFood({ name: '', price: '', category: 'Ichimliklar' }); setShowAdd(false); }} className="flex-1 py-2 rounded-lg bg-indigo text-white text-xs font-bold uppercase">Saqlash</button></div>
        </div>
      )}
      <div className="bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden"><div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[500px]"><thead><tr className="bg-surface-container-high border-b border-outline-variant/10"><th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Nomi</th><th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Kategoriya</th><th className="px-5 py-3 text-[11px] font-bold text-outline uppercase tracking-wider">Narx</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-outline-variant/10">{state.foods.map(f => (<tr key={f.id} className="hover:bg-surface-container-high/30 transition-colors group"><td className="px-5 py-3 text-sm font-medium text-on-surface">{f.name}</td><td className="px-5 py-3 text-xs text-outline-variant">{f.category}</td><td className="px-5 py-3">{editId === f.id ? (<div className="flex items-center gap-1.5 border border-indigo rounded-lg px-2 py-1 bg-surface-container-highest"><input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { const p = parseInt(editVal.replace(/\D/g, ''), 10); if (!isNaN(p)) updateFood({ id: f.id, price: p }); setEditId(null); } if (e.key === 'Escape') setEditId(null); }} className="bg-transparent border-none outline-none font-mono text-sm text-on-surface w-24" /><button onClick={() => { const p = parseInt(editVal.replace(/\D/g, ''), 10); if (!isNaN(p)) updateFood({ id: f.id, price: p }); setEditId(null); }} className="text-tertiary"><span className="material-symbols-outlined text-base">check</span></button></div>) : (<button onClick={() => { setEditId(f.id); setEditVal(String(f.price)) }} className="flex items-center gap-1.5 hover:bg-surface-container-highest px-2 py-1 rounded-lg transition-colors group/p"><span className="font-mono text-sm text-on-surface">{formatPrice(f.price)}</span><span className="material-symbols-outlined text-xs text-outline opacity-0 group-hover/p:opacity-100 transition-opacity">edit</span></button>)}</td><td className="px-5 py-3 text-right"><button onClick={() => removeFood(f.id)} className="p-1.5 text-outline hover:text-error transition-all opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-lg">delete</span></button></td></tr>))}</tbody></table></div></div>
    </div>
  )
}

function Settings() {
  const [autoClose, setAutoClose] = useState(true)
  const [confirmStop, setConfirmStop] = useState(true)
  const [minPrice, setMinPrice] = useState(2000)
  return (
    <div>
      <SectionHeader icon="tune" title="Tizim sozlamalari" />
      <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-5 space-y-6">
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-on-surface">Avtomatik yopish</p><p className="text-[11px] text-outline mt-0.5">Vaqt tugaganda seansni avtomatik tugatish</p></div><button onClick={() => setAutoClose(v => !v)} className={`relative w-12 h-6 rounded-full transition-colors ${autoClose ? 'bg-indigo' : 'bg-surface-container-highest border border-outline-variant/30'}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoClose ? 'translate-x-7' : 'translate-x-1'}`} /></button></div>
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-on-surface">Tasdiqlash so'rovi</p><p className="text-[11px] text-outline mt-0.5">Har bir to'lovda tasdiqlash oynasini ko'rsatish</p></div><button onClick={() => setConfirmStop(v => !v)} className={`relative w-12 h-6 rounded-full transition-colors ${confirmStop ? 'bg-indigo' : 'bg-surface-container-highest border border-outline-variant/30'}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${confirmStop ? 'translate-x-7' : 'translate-x-1'}`} /></button></div>
        <div className="pt-4 border-t border-outline-variant/10"><label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Minimal seans narxi (UZS)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">payments</span><input type="number" value={minPrice} onChange={e => setMinPrice(parseInt(e.target.value) || 0)} className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2.5 pl-10 pr-4 text-sm font-mono text-on-surface focus:border-indigo outline-none" /></div></div>
        <button className="w-full bg-indigo text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo/20">Sozlamalarni saqlash</button>
      </div>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('zones')
  const TABS = [
    { id: 'zones',    label: 'Zonalar',    icon: 'layers' },
    { id: 'foods',    label: 'Menyu',      icon: 'fastfood' },
    { id: 'settings', label: 'Sozlamalar', icon: 'tune' },
  ]
  return (
    <div className="pb-10 animate-in fade-in duration-300">
      <div className="flex flex-wrap gap-1 mb-6 sm:mb-8 bg-surface-container border border-outline-variant/20 rounded-xl p-1.5 w-full md:w-fit shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${tab === t.id ? 'bg-indigo text-white shadow-lg shadow-indigo/20 scale-105' : 'text-outline hover:text-on-surface hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      {tab === 'zones' && <ZoneManager />}
      {tab === 'foods' && <FoodManager />}
      {tab === 'settings' && <Settings />}
    </div>
  )
}
