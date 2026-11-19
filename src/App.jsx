import { lazy, Suspense, useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, FileText, Settings, Sun, Moon,
  Receipt, BarChart3, HardDriveDownload, AlertCircle, Lock,
} from 'lucide-react'
import { load, save } from './storage'
import { IS_DEMO, LOCKED_PAGES } from './mode'
import DemoBanner from './DemoBanner'
import LockedPage from './pages/Locked'
import Dashboard from './pages/Dashboard'
import ClientsPage from './pages/Clients'
import InvoicesPage from './pages/Invoices'
import SettingsPage from './pages/Settings'

// Demo build mein yeh 4 pages shamil hi nahi hote
const GetPaidPage = import.meta.env.VITE_MODE === 'demo' ? null : lazy(() => import('./pages/GetPaid'))
const PaymentsPage = import.meta.env.VITE_MODE === 'demo' ? null : lazy(() => import('./pages/Payments'))
const ReportsPage = import.meta.env.VITE_MODE === 'demo' ? null : lazy(() => import('./pages/Reports'))
const BackupPage = import.meta.env.VITE_MODE === 'demo' ? null : lazy(() => import('./pages/Backup'))

const NAV_GROUPS = [
  { title: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'getpaid',   label: 'Get Paid',  icon: AlertCircle },
  ]},
  { title: 'Sales', items: [
    { id: 'clients',  label: 'Clients',  icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payments', label: 'Payments', icon: Receipt },
  ]},
  { title: 'Insights', items: [
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ]},
  { title: 'Setup', items: [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'backup',   label: 'Backup',   icon: HardDriveDownload },
  ]},
]
const NAV = NAV_GROUPS.flatMap(g => g.items)

export default function App() {
  const [data, setData] = useState(load)
  const [page, setPage] = useState('dashboard')
  const [openInvoice, setOpenInvoice] = useState(null)

  useEffect(() => { save(data) }, [data])
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme
    document.documentElement.dataset.accent = data.settings.accent
  }, [data.settings.theme, data.settings.accent])

  const toggleTheme = () =>
    setData(d => ({
      ...d,
      settings: { ...d.settings, theme: d.settings.theme === 'light' ? 'dark' : 'light' },
    }))

  const goInvoice = id => { setOpenInvoice(id); setPage('invoices') }

  const name = data.settings.businessName || 'My Business'
  const title = NAV.find(n => n.id === page)?.label
  const locked = LOCKED_PAGES.includes(page)

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar */}
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col gap-1 p-4"
        style={{ background: 'var(--sidebar)' }}
      >
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl text-white font-bold"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-2))' }}
          >
            {name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white leading-tight">{name}</p>
            <p className="text-xs text-white/50">Invoices & Clients</p>
          </div>
        </div>

        {NAV_GROUPS.map(group => (
          <div key={group.title} className="mb-3">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              {group.title}
            </p>
            {group.items.map(({ id, label, icon: Icon }) => {
              const active = page === id
              return (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-left"
                  style={{
                    color: active ? '#fff' : 'rgba(255,255,255,.6)',
                    background: active ? 'rgba(255,255,255,.08)' : 'transparent',
                  }}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                      style={{ background: 'var(--primary-2)' }}
                    />
                  )}
                  <Icon size={18} /> {label}
                  {LOCKED_PAGES.includes(id) && <Lock size={13} className="ml-auto opacity-60" />}
                </button>
              )
            })}
          </div>
        ))}
      </aside>

      <div className="flex-1 min-w-0">
        {IS_DEMO && (
          <DemoBanner unlocked={NAV.length - LOCKED_PAGES.length} total={NAV.length} />
        )}

        <header
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 backdrop-blur"
          style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}
        >
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted">Everything you are owed, in one place.</p>
          </div>
          <button onClick={toggleTheme} className="card p-2.5" aria-label="Toggle theme">
            {data.settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>

        <main className="px-5 pb-24 md:pb-8">
          {locked && <LockedPage page={page} />}

          {!locked && (
            <Suspense fallback={<div className="p-6 text-muted">Loading…</div>}>
              {page === 'dashboard' && <Dashboard data={data} onOpenInvoice={goInvoice} />}
              {page === 'getpaid' && GetPaidPage && (
                <GetPaidPage data={data} setData={setData} onOpenInvoice={goInvoice} />
              )}
              {page === 'clients' && <ClientsPage data={data} setData={setData} />}
              {page === 'invoices' && (
                <InvoicesPage
                  data={data}
                  setData={setData}
                  openId={openInvoice}
                  onOpened={() => setOpenInvoice(null)}
                />
              )}
              {page === 'payments' && PaymentsPage && (
                <PaymentsPage data={data} onOpenInvoice={goInvoice} />
              )}
              {page === 'reports' && ReportsPage && <ReportsPage data={data} />}
              {page === 'settings' && <SettingsPage data={data} setData={setData} />}
              {page === 'backup' && BackupPage && <BackupPage data={data} setData={setData} />}
            </Suspense>
          )}
        </main>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 flex overflow-x-auto border-t border-border bg-surface">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`relative flex-1 min-w-[72px] flex flex-col items-center gap-1 py-2.5 text-xs
              ${page === id ? 'text-primary' : 'text-muted'}`}
          >
            <Icon size={20} /> {label}
            {LOCKED_PAGES.includes(id) && <Lock size={10} className="absolute right-3 top-2 opacity-60" />}
          </button>
        ))}
      </nav>
    </div>
  )
}