import { usePos } from '../../context/PosContext'

const PAGE_TITLES = {
  dashboard: 'Asosiy boshqaruv',
  zonalar:   'Zonalar / Stollar',
  foyda:     'Foyda tahlili',
  admin:     'Admin boshqaruvi',
}

const PAGE_ICONS = {
  dashboard: 'dashboard',
  zonalar:   'layers',
  foyda:     'trending_up',
  admin:     'settings',
}

export default function TopAppBar({ onAddTable, onRefresh, onToggleSidebar }) {
  const { state, setPage } = usePos()
  const title = PAGE_TITLES[state.page] || ''
  const icon  = PAGE_ICONS[state.page] || ''

  const activeTables = state.tables.filter(t => t.active).length

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-220px)] h-16 px-4 md:px-8 flex justify-between items-center bg-background/90 backdrop-blur-md border-b border-outline-variant/20 z-40 transition-all duration-300">
      {/* Left: title + breadcrumb */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 -ml-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="flex items-center gap-2 md:gap-2.5">
          <span className="material-symbols-outlined text-outline text-lg hidden sm:block">{icon}</span>
          <h2 className="font-headline text-base md:text-lg font-semibold tracking-tight text-on-surface truncate max-w-[120px] sm:max-w-none">{title}</h2>
        </div>
        <div className="h-4 w-px bg-outline-variant/30 hidden sm:block" />
        <div className="flex items-center gap-1.5 md:gap-2 text-outline text-xs md:text-sm">
          <span className="material-symbols-outlined text-[10px] md:text-sm hidden xs:block">circle</span>
          <span className="whitespace-nowrap">
            <span className="text-tertiary font-semibold">{activeTables}</span>
            <span className="ml-1 hidden xs:inline">faol stol</span>
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-surface-container border border-outline-variant/30 rounded-lg p-1 mr-2">
          <button
            onClick={() => setPage('dashboard')}
            className={`p-1.5 rounded text-outline hover:text-indigo hover:bg-indigo/10 transition-colors ${state.page === 'dashboard' ? 'text-indigo bg-indigo/10' : ''}`}
            title="Asosiy boshqaruv"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
          </button>
          <button
            onClick={() => setPage('foyda')}
            className={`p-1.5 rounded text-outline hover:text-indigo hover:bg-indigo/10 transition-colors ${state.page === 'foyda' ? 'text-indigo bg-indigo/10' : ''}`}
            title="Foyda tahlili"
          >
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
          </button>
          <button
            onClick={() => setPage('admin')}
            className={`p-1.5 rounded text-outline hover:text-indigo hover:bg-indigo/10 transition-colors ${state.page === 'admin' ? 'text-indigo bg-indigo/10' : ''}`}
            title="Admin boshqaruvi"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </div>

        <button
          id="refresh-btn"
          onClick={onRefresh}
          className="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-all active:scale-95 duration-100"
          title="Yangilash"
        >
          <span className="material-symbols-outlined text-xl">refresh</span>
        </button>

        {state.page === 'zonalar' && (
          <button
            id="add-table-btn"
            onClick={onAddTable}
            className="flex items-center gap-2 bg-indigo text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 duration-100 hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm icon-filled">add_circle</span>
            Stol qo'shish
          </button>
        )}

        {state.page === 'admin' && (
          <button
            id="save-admin-btn"
            className="flex items-center gap-2 bg-indigo text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 duration-100 hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm icon-filled">save</span>
            Saqlash
          </button>
        )}
      </div>
    </header>
  )
}
