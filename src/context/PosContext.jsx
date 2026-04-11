import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

// ─── Initial Data ────────────────────────────────────────────────────────────

const INITIAL_FOODS = [
  { id: 'f1', name: 'Coca-Cola 0.5L',  price: 5000,  category: 'Ichimliklar' },
  { id: 'f2', name: 'Pepsi 0.5L',      price: 5000,  category: 'Ichimliklar' },
  { id: 'f3', name: 'Flash Energy',    price: 12000, category: 'Ichimliklar' },
  { id: 'f4', name: 'Red Bull',        price: 18000, category: 'Ichimliklar' },
  { id: 'f5', name: 'Club Sandwich',   price: 25000, category: 'Ovqatlar'    },
  { id: 'f6', name: 'Classic Burger',  price: 22000, category: 'Ovqatlar'    },
  { id: 'f7', name: 'Hot-Dog',         price: 10000, category: 'Ovqatlar'    },
  { id: 'f8', name: 'Spicy Ramen',     price: 15000, category: 'Ovqatlar'    },
  { id: 'f9', name: 'Belyashi',        price: 8000,  category: 'Ovqatlar'    },
]

const INITIAL_ZONES = [
  {
    id: 'zone-a',
    name: 'A Zona',
    label: 'Kompyuterlar 1–10',
    icon: 'layers',
    isVip: false,
    pricePerHour: 10000,
  },
  {
    id: 'zone-b',
    name: 'B Zona',
    label: 'Kompyuterlar 11–20',
    icon: 'layers',
    isVip: false,
    pricePerHour: 10000,
  },
  {
    id: 'zone-vip',
    name: 'VIP',
    label: 'Stol 21–24',
    icon: 'workspace_premium',
    isVip: true,
    pricePerHour: 25000,
  },
  {
    id: 'zone-ps',
    name: 'PlayStation',
    label: 'PS5 stollari',
    icon: 'sports_esports',
    isVip: false,
    pricePerHour: 20000,
  },
]

function createTable(id, name, zoneId, pricePerHour, isVip = false) {
  return {
    id,
    name,
    zoneId,
    pricePerHour,
    isVip,
    active: false,
    startTime: null,   // epoch ms
    elapsedSeconds: 0, // current elapsed
    orders: [],        // [{ foodId, qty }]
  }
}

const INITIAL_TABLES = [
  createTable('t1',  '1-stol',  'zone-a',   10000),
  createTable('t2',  '2-stol',  'zone-a',   10000),
  createTable('t3',  '3-stol',  'zone-a',   10000),
  createTable('t4',  '4-stol',  'zone-a',   10000),
  createTable('t5',  '5-stol',  'zone-a',   10000),
  createTable('t6',  '6-stol',  'zone-a',   10000),
  createTable('t7',  '7-stol',  'zone-a',   10000),
  createTable('t8',  '8-stol',  'zone-a',   10000),
  createTable('t9',  '9-stol',  'zone-a',   10000),
  createTable('t10', '10-stol', 'zone-a',   10000),
  createTable('t11', '11-stol', 'zone-b',   10000),
  createTable('t12', '12-stol', 'zone-b',   10000),
  createTable('t13', '13-stol', 'zone-b',   10000),
  createTable('t14', '14-stol', 'zone-b',   10000),
  createTable('t15', '15-stol', 'zone-b',   10000),
  createTable('t21', 'VIP-21',  'zone-vip', 25000, true),
  createTable('t22', 'VIP-22',  'zone-vip', 25000, true),
  createTable('t23', 'VIP-23',  'zone-vip', 25000, true),
  createTable('t24', 'VIP-24',  'zone-vip', 25000, true),
]

// Generate mock revenue records for charts
function generateRevenueHistory() {
  const records = []
  const now = Date.now()
  for (let i = 89; i >= 0; i--) {
    const day = new Date(now - i * 86400000)
    records.push({
      date: day.toISOString().slice(0, 10),
      revenue: Math.floor(Math.random() * 800000 + 200000),
    })
  }
  return records
}

const STORAGE_KEY = 'gamedesk_pos_data'

const INITIAL_STATE = {
  page: 'dashboard',
  activeZoneId: null,
  tables: INITIAL_TABLES,
  zones: INITIAL_ZONES,
  foods: INITIAL_FOODS,
  revenueHistory: generateRevenueHistory(),
  completedSessions: [], // sessions that have been stopped
  tick: 0,              // increments every second to force re-render
}

function getInitialState() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      const now = Date.now()
      const tables = (parsed.tables || INITIAL_STATE.tables).map(t => {
        let elapsed = 0
        if (t.active && t.startTime) {
          elapsed = Math.floor((now - t.startTime) / 1000)
        }
        return { ...t, elapsedSeconds: elapsed }
      })

      return {
        ...INITIAL_STATE,
        ...parsed,
        tables,
        page: 'dashboard',
        tick: 0,
      }
    } catch (e) {
      console.error('Failed to load storage:', e)
    }
  }
  return INITIAL_STATE
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case 'SET_PAGE':
      return { ...state, page: action.payload }

    case 'SET_ACTIVE_ZONE':
      return { ...state, activeZoneId: action.payload }

    case 'TICK':
      return {
        ...state,
        tick: state.tick + 1,
        tables: state.tables.map(t =>
          t.active
            ? { ...t, elapsedSeconds: Math.floor((Date.now() - t.startTime) / 1000) }
            : t
        ),
      }

    case 'START_TABLE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.payload
            ? { ...t, active: true, startTime: Date.now(), elapsedSeconds: 0, orders: [] }
            : t
        ),
      }

    case 'START_MULTIPLE_TABLES':
      return {
        ...state,
        tables: state.tables.map(t =>
          action.payload.includes(t.id) && !t.active
            ? { ...t, active: true, startTime: Date.now(), elapsedSeconds: 0, orders: [] }
            : t
        ),
      }

    case 'STOP_TABLE': {
      const table = state.tables.find(t => t.id === action.payload)
      if (!table) return state
      const session = {
        id: Date.now(),
        tableId: table.id,
        tableName: table.name,
        zoneId: table.zoneId,
        startTime: table.startTime,
        endTime: Date.now(),
        elapsedSeconds: table.elapsedSeconds,
        orders: table.orders,
        pricePerHour: table.pricePerHour,
        total: calcTotal(table, state.foods),
        date: getLocalDayString(),
      }
      return {
        ...state,
        revenueHistory: updateRevenueHistory(state.revenueHistory, session.total),
        completedSessions: [session, ...state.completedSessions],
        tables: state.tables.map(t =>
          t.id === action.payload
            ? { ...t, active: false, startTime: null, elapsedSeconds: 0, orders: [] }
            : t
        ),
      }
    }

    case 'STOP_MULTIPLE_TABLES': {
      const now = Date.now()
      const newSessions = []
      const updatedTables = state.tables.map(t => {
        if (action.payload.includes(t.id) && t.active) {
          newSessions.push({
            id: now + Math.random(),
            tableId: t.id,
            tableName: t.name,
            zoneId: t.zoneId,
            startTime: t.startTime,
            endTime: now,
            elapsedSeconds: t.elapsedSeconds,
            orders: t.orders,
            pricePerHour: t.pricePerHour,
            total: calcTotal(t, state.foods),
            date: getLocalDayString(),
          })
          return { ...t, active: false, startTime: null, elapsedSeconds: 0, orders: [] }
        }
        return t
      })

      return {
        ...state,
        revenueHistory: newSessions.reduce((h, s) => updateRevenueHistory(h, s.total), state.revenueHistory),
        completedSessions: [...newSessions, ...state.completedSessions],
        tables: updatedTables,
      }
    }

    case 'ADD_ORDER': {
      const { tableId, foodId } = action.payload
      return {
        ...state,
        tables: state.tables.map(t => {
          if (t.id !== tableId) return t
          const existing = t.orders.find(o => o.foodId === foodId)
          const orders = existing
            ? t.orders.map(o => o.foodId === foodId ? { ...o, qty: o.qty + 1 } : o)
            : [...t.orders, { foodId, qty: 1 }]
          return { ...t, orders }
        }),
      }
    }

    case 'REMOVE_ORDER': {
      const { tableId, foodId } = action.payload
      return {
        ...state,
        tables: state.tables.map(t => {
          if (t.id !== tableId) return t
          const orders = t.orders
            .map(o => o.foodId === foodId ? { ...o, qty: o.qty - 1 } : o)
            .filter(o => o.qty > 0)
          return { ...t, orders }
        }),
      }
    }

    case 'ADD_FOOD':
      return { ...state, foods: [...state.foods, { ...action.payload, id: 'f' + Date.now() }] }

    case 'REMOVE_FOOD':
      return { ...state, foods: state.foods.filter(f => f.id !== action.payload) }

    case 'UPDATE_FOOD':
      return {
        ...state,
        foods: state.foods.map(f => f.id === action.payload.id ? { ...f, ...action.payload } : f),
      }

    case 'ADD_ZONE':
      return { ...state, zones: [...state.zones, action.payload] }

    case 'REMOVE_ZONE':
      return {
        ...state,
        zones: state.zones.filter(z => z.id !== action.payload),
        tables: state.tables.filter(t => t.zoneId !== action.payload),
      }

    case 'UPDATE_ZONE_PRICE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.payload.zoneId ? { ...z, pricePerHour: action.payload.price } : z
        ),
        tables: state.tables.map(t =>
          t.zoneId === action.payload.zoneId ? { ...t, pricePerHour: action.payload.price } : t
        ),
      }

    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.payload.id ? { ...z, ...action.payload } : z
        ),
      }

    case 'ADD_TABLE': {
      const zone = state.zones.find(z => z.id === action.payload.zoneId)
      return {
        ...state,
        tables: [...state.tables, createTable(
          't' + Date.now(),
          action.payload.name,
          action.payload.zoneId,
          zone?.pricePerHour ?? 10000,
          zone?.isVip ?? false,
        )],
      }
    }

    case 'REMOVE_TABLE':
      return { ...state, tables: state.tables.filter(t => t.id !== action.payload) }

    case 'UPDATE_TABLE_PRICE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.payload.id ? { ...t, pricePerHour: action.payload.price } : t
        ),
      }

    default:
      return state
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getLocalDayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function updateRevenueHistory(history, amount) {
  const today = getLocalDayString()
  const exists = history.find(h => h.date === today)
  if (exists) {
    return history.map(h => h.date === today ? { ...h, revenue: h.revenue + amount } : h)
  }
  return [...history, { date: today, revenue: amount }]
}

export function calcTotal(table, foods = INITIAL_FOODS) {
  const timeCost = (table.elapsedSeconds / 3600) * table.pricePerHour
  const foodCost = table.orders.reduce((sum, o) => {
    const food = foods.find(f => f.id === o.foodId)
    return sum + (food ? food.price * o.qty : 0)
  }, 0)
  return Math.round(timeCost + foodCost)
}

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export function formatPrice(n) {
  return n.toLocaleString('uz-UZ') + ' UZS'
}

// ─── Context ─────────────────────────────────────────────────────────────────

const PosContext = createContext(null)

export function PosProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState)

  // Global 1-second tick for timers
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [])

  // Persistence Effect
  useEffect(() => {
    // Only save meaningful state, ignoring the every-second tick
    const { tick, ...persistentState } = state
    // We also nullify elapsedSeconds in tables to avoid unnecessary writes every second
    const tablesToSave = persistentState.tables.map(({ elapsedSeconds, ...t }) => t)
    
    const dataToSave = {
      ...persistentState,
      tables: tablesToSave
    }
    
    // We check if the data actually changed from what's in storage 
    // to avoid redundant writes during the 1s tick
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  }, [
    state.tables.length, 
    state.zones, 
    state.foods, 
    state.revenueHistory, 
    state.completedSessions,
    // We react to table status changes specifically
    state.tables.map(t => t.active).join(','),
    state.tables.map(t => t.orders.length).join(',')
  ])

  const actions = {
    setPage:         useCallback((p)    => dispatch({ type: 'SET_PAGE',       payload: p }),    []),
    setActiveZone:   useCallback((id)   => dispatch({ type: 'SET_ACTIVE_ZONE',payload: id }),   []),
    startTable:      useCallback((id)   => dispatch({ type: 'START_TABLE',    payload: id }),   []),
    stopTable:       useCallback((id)   => dispatch({ type: 'STOP_TABLE',     payload: id }),   []),
    addOrder:        useCallback((p)    => dispatch({ type: 'ADD_ORDER',      payload: p }),    []),
    removeOrder:     useCallback((p)    => dispatch({ type: 'REMOVE_ORDER',   payload: p }),    []),
    addFood:         useCallback((p)    => dispatch({ type: 'ADD_FOOD',       payload: p }),    []),
    removeFood:      useCallback((id)   => dispatch({ type: 'REMOVE_FOOD',    payload: id }),   []),
    updateFood:      useCallback((p)    => dispatch({ type: 'UPDATE_FOOD',    payload: p }),    []),
    addZone:         useCallback((p)    => dispatch({ type: 'ADD_ZONE',       payload: p }),    []),
    removeZone:      useCallback((id)   => dispatch({ type: 'REMOVE_ZONE',    payload: id }),   []),
    updateZonePrice: useCallback((p)    => dispatch({ type: 'UPDATE_ZONE_PRICE', payload: p }), []),
    addTable:        useCallback((p)    => dispatch({ type: 'ADD_TABLE',      payload: p }),    []),
    removeTable:     useCallback((id)   => dispatch({ type: 'REMOVE_TABLE',   payload: id }),   []),
    updateTablePrice:useCallback((p)    => dispatch({ type: 'UPDATE_TABLE_PRICE', payload: p }),[]),
    updateZone:     useCallback((p)    => dispatch({ type: 'UPDATE_ZONE',    payload: p }),    []),
    startMultipleTables:useCallback((ids)=> dispatch({ type: 'START_MULTIPLE_TABLES', payload: ids }), []),
    stopMultipleTables: useCallback((ids)=> dispatch({ type: 'STOP_MULTIPLE_TABLES', payload: ids }), []),
  }

  return (
    <PosContext.Provider value={{ state, ...actions }}>
      {children}
    </PosContext.Provider>
  )
}

export function usePos() {
  const ctx = useContext(PosContext)
  if (!ctx) throw new Error('usePos must be used inside PosProvider')
  return ctx
}
