import { useState } from 'react'
import { usePos, calcTotal, formatTime, formatPrice } from '../../context/PosContext'

// ─── Food Drawer ──────────────────────────────────────────────────────────────

function FoodDrawer({ table, onClose }) {
  const { state, addOrder, removeOrder } = usePos()

  const getQty = (foodId) => {
    const o = table.orders.find(o => o.foodId === foodId)
    return o ? o.qty : 0
  }

  const grouped = state.foods.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  }, {})

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-80 h-full bg-surface-container-high border-l border-outline-variant/20 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <div>
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">
              Buyurtma qo'shish
            </h3>
            <p className="text-[11px] text-outline mt-0.5">{table.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Foods */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {Object.entries(grouped).map(([cat, foods]) => (
            <div key={cat}>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2 px-1">
                {cat}
              </p>
              <div className="space-y-2">
                {foods.map(food => {
                  const qty = getQty(food.id)
                  return (
                    <div
                      key={food.id}
                      className="bg-surface-container rounded-lg border border-outline-variant/10 flex items-center justify-between px-3 py-2.5 hover:border-outline-variant/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-on-surface">{food.name}</p>
                        <p className="text-[11px] font-mono text-outline">{formatPrice(food.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => removeOrder({ tableId: table.id, foodId: food.id })}
                              className="w-7 h-7 rounded-md bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-outline-variant/20 transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">remove</span>
                            </button>
                            <span className="text-sm font-bold text-on-surface w-4 text-center">
                              {qty}
                            </span>
                          </>
                        )}
                        <button
                          onClick={() => addOrder({ tableId: table.id, foodId: food.id })}
                          className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Confirm */}
        <div className="px-4 py-4 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:opacity-90 transition-opacity active:scale-95"
          >
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stop Confirmation Modal ──────────────────────────────────────────────────

function StopModal({ table, onConfirm, onCancel }) {
  const { state } = usePos()
  const total = calcTotal(table, state.foods)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-surface-container-high border border-outline-variant/20 rounded-xl p-6 w-80 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
              stop_circle
            </span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-sm">Seans tugatilsinmi?</h3>
            <p className="text-[11px] text-outline">{table.name}</p>
          </div>
        </div>

        <div className="bg-surface-container rounded-lg p-3 mb-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-outline">Vaqt</span>
            <span className="font-mono text-on-surface">{formatTime(table.elapsedSeconds)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-outline">Narx / soat</span>
            <span className="font-mono text-on-surface">{formatPrice(table.pricePerHour)}</span>
          </div>
          {table.orders.length > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-outline">Buyurtmalar</span>
              <span className="font-mono text-on-surface">
                {table.orders.reduce((s, o) => s + o.qty, 0)} ta
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-outline-variant/10 flex justify-between">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">Jami</span>
            <span className="font-mono font-bold text-on-surface">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-outline-variant/20 text-outline text-xs font-bold uppercase tracking-wider hover:bg-surface-container transition-colors"
          >
            Bekor
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-error text-on-error text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95"
          >
            Tugatish
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Table Card ───────────────────────────────────────────────────────────────

export default function TableCard({ table, selectable, selected, onSelect }) {
  const { state, startTable, stopTable, removeOrder, updateTablePrice } = usePos()
  const [showFoodDrawer, setShowFoodDrawer] = useState(false)
  const [showStopModal,  setShowStopModal]  = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [editPriceVal,   setEditPriceVal]   = useState(String(table.pricePerHour))

  const commitPrice = () => {
    const val = parseInt(editPriceVal.replace(/\D/g, ''), 10)
    if (!isNaN(val) && val > 0) {
      updateTablePrice({ id: table.id, price: val })
    }
    setIsEditingPrice(false)
  }

  const total  = calcTotal(table, state.foods)
  const isVip  = table.isVip

  // If selectable, border tells us if selected
  const borderClass = selectable
    ? selected
      ? 'border-2 border-indigo bg-indigo/5 ring-4 ring-indigo/20 scale-[0.98]'
      : 'border-2 border-outline-variant/30 hover:border-indigo/50 cursor-pointer opacity-60 hover:opacity-100 hover:scale-[0.98]'
    : isVip
      ? 'border-2 border-amber/20'
      : table.active
        ? 'border border-tertiary/20 bg-surface-container'
        : 'border border-outline-variant/20 bg-surface-container opacity-80 hover:opacity-100'

  const cardClass = `relative rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 overflow-hidden ${
    !selectable && isVip ? 'bg-surface-container-high' : ''
  } ${selectable && !selected ? 'grayscale-[30%]' : ''} ${borderClass}`

  const iconClass = isVip
    ? 'bg-amber/10 border-amber/20 text-amber'
    : table.active
      ? 'bg-surface-container-high border-outline-variant/10 text-primary'
      : 'bg-surface-container-low border-outline-variant/10 text-outline'

  const timerClass = isVip
    ? 'text-amber'
    : table.active
      ? 'text-tertiary timer-pulse'
      : 'text-outline-variant opacity-40'

  const handleCardClick = () => {
    if (selectable && onSelect) onSelect()
  }

  return (
    <>
      <div className={cardClass} onClick={handleCardClick}>
        
        {/* Selection checkmark */}
        {selectable && (
          <div className={`absolute top-4 right-4 w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-indigo border-indigo text-white' : 'border-outline-variant/50 text-transparent'}`}>
             <span className="material-symbols-outlined text-[14px]">check</span>
          </div>
        )}

        {/* VIP ambient glow */}
        {isVip && (
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber/5 rounded-full blur-2xl pointer-events-none" />
        )}

        {/* ── Header ── */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${iconClass}`}>
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isVip ? 'sports_esports' : 'monitor'}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface text-sm">{table.name}</h4>
              <div className="flex items-center gap-1.5 min-h-[16px]">
                {isEditingPrice ? (
                  <div className="flex items-center gap-1 bg-surface-container border border-indigo rounded px-1.5 py-0.5">
                    <input
                      autoFocus
                      type="text"
                      className="bg-transparent border-none outline-none font-mono text-[10px] text-on-surface w-16"
                      value={editPriceVal}
                      onChange={e => setEditPriceVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitPrice(); if (e.key === 'Escape') setIsEditingPrice(false) }}
                      onClick={e => e.stopPropagation()}
                    />
                    <button onClick={e => { e.stopPropagation(); commitPrice(); }} className="text-tertiary">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-1 group/p cursor-pointer p-0.5 -m-0.5 rounded hover:bg-surface-container-high transition-colors"
                    onClick={(e) => { e.stopPropagation(); setEditPriceVal(String(table.pricePerHour)); setIsEditingPrice(true); }}
                  >
                    <p className={`text-[11px] font-mono uppercase tracking-tight ${isVip ? 'text-amber' : 'text-outline'}`}>
                      {formatPrice(table.pricePerHour)} / soat
                    </p>
                    <span className="material-symbols-outlined text-[11px] text-outline opacity-0 group-hover/p:opacity-100 transition-opacity">edit</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          {table.active ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-wider rounded-full border border-tertiary/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              Faol
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-outline-variant/10 text-outline text-[10px] font-bold uppercase tracking-wider rounded-full border border-outline-variant/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-outline" />
              Bo'sh
            </span>
          )}
        </div>

        {/* ── Timer ── */}
        <div className="flex flex-col items-center justify-center py-1">
          <span className={`font-mono tracking-tight select-none ${timerClass} ${isVip && table.active ? 'text-4xl' : 'text-3xl'}`}>
            {formatTime(table.elapsedSeconds)}
          </span>
          <p className="text-[10px] text-outline-variant uppercase tracking-widest mt-1">
            {table.active
              ? (isVip ? 'Premium sessiya' : 'Sessiya davom etmoqda')
              : 'Kutilmoqda'}
          </p>
        </div>

        {/* ── Orders ── */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-outline-variant uppercase tracking-wider">
              Ovqatlar:
            </span>
            {table.active && !selectable && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowFoodDrawer(true); }}
                className="flex items-center gap-0.5 text-xs font-bold text-primary hover:bg-primary/10 px-2 py-0.5 rounded-md transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[28px]">
            {table.orders.length === 0 ? (
              <div className="flex items-center justify-center w-full min-h-[28px] border border-dashed border-outline-variant/15 rounded-lg">
                <span className="text-[9px] text-outline-variant uppercase tracking-widest">
                  Buyurtmalar yo'q
                </span>
              </div>
            ) : (
              table.orders.map(o => {
                const food = state.foods.find(f => f.id === o.foodId)
                if (!food) return null
                return (
                  <span
                    key={o.foodId}
                    className="flex items-center gap-1 px-2 py-1 bg-surface-container-high text-on-surface-variant text-[10px] rounded-lg border border-outline-variant/10"
                  >
                    {food.name} ({o.qty})
                    {table.active && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeOrder({ tableId: table.id, foodId: o.foodId })
                        }}
                        className="text-outline hover:text-error transition-colors ml-0.5 flex items-center"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                      </button>
                    )}
                  </span>
                )
              })
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="pt-3 border-t border-outline-variant/10 flex justify-between items-center h-12">
          <div>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${isVip ? 'text-amber' : 'text-outline'}`}>
              JAMI:
            </p>
            <span className={`text-lg font-bold font-mono ${table.active ? 'text-on-surface' : 'text-outline-variant'}`}>
              {formatPrice(total)}
            </span>
          </div>

          {!selectable && (
            table.active ? (
              <button
                id={`stop-${table.id}`}
                onClick={(e) => { e.stopPropagation(); setShowStopModal(true); }}
                className="bg-error text-on-error font-bold text-[11px] px-4 py-2 uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                {isVip ? 'Yakunlash' : "To'xtatish"}
              </button>
            ) : (
              <button
                id={`start-${table.id}`}
                onClick={(e) => { e.stopPropagation(); startTable(table.id); }}
                className="bg-tertiary text-on-tertiary font-bold text-[11px] px-4 py-2 uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Boshlash
              </button>
            )
          )}
        </div>
      </div>

      {showFoodDrawer && (
        <FoodDrawer table={table} onClose={() => setShowFoodDrawer(false)} />
      )}
      {showStopModal && (
        <StopModal
          table={table}
          onConfirm={() => { stopTable(table.id); setShowStopModal(false) }}
          onCancel={() => setShowStopModal(false)}
        />
      )}
    </>
  )
}
