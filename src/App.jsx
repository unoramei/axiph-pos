import { useState } from 'react'
import { PosProvider, usePos } from './context/PosContext'
import Sidebar    from './components/layout/Sidebar'
import TopAppBar  from './components/layout/TopAppBar'
import AddTableModal from './components/tables/AddTableModal'
import Dashboard  from './pages/Dashboard'
import Stollar    from './pages/Stollar'
import Foyda      from './pages/Foyda'
import Admin      from './pages/Admin'

function AppShell() {
  const { state } = usePos()
  const [showAddTable, setShowAddTable] = useState(false)
  const [refreshKey,   setRefreshKey]   = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleRefresh = () => setRefreshKey(k => k + 1)

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 w-full lg:w-auto lg:ml-[220px] transition-all duration-300">
        <TopAppBar
          onAddTable={() => setShowAddTable(true)}
          onRefresh={handleRefresh}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="pt-24 px-4 sm:px-8 pb-12 w-full overflow-x-hidden" key={refreshKey}>
          {state.page === 'dashboard' && <Dashboard />}
          {state.page === 'zonalar'   && <Stollar onAddTable={() => setShowAddTable(true)} />}
          {state.page === 'foyda'     && <Foyda />}
          {state.page === 'admin'     && <Admin />}
        </main>
      </div>

      {showAddTable && (
        <AddTableModal onClose={() => setShowAddTable(false)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <PosProvider>
      <AppShell />
    </PosProvider>
  )
}
