import { useRef, useState } from 'react'
import { Download, Upload, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { exportBackup, importBackup } from '../storage'

function daysSince(iso) {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export default function BackupPage({ data, setData }) {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null) // { type: 'ok' | 'error', text }

  const last = data.settings.lastBackup
  const days = daysSince(last)
  const stale = days === null || days > 30

  const handleExport = () => {
    const next = { ...data, settings: { ...data.settings, lastBackup: new Date().toISOString() } }
    setData(next)
    exportBackup(next)
    setMsg({ type: 'ok', text: 'Backup downloaded. Keep the file somewhere safe (Drive, email, USB).' })
  }

  const handleImport = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!window.confirm('Importing replaces ALL current data in this browser. Continue?')) return
    try {
      const restored = await importBackup(file)
      setData(restored)
      setMsg({ type: 'ok', text: 'Backup restored successfully.' })
    } catch {
      setMsg({ type: 'error', text: 'This file is not a valid backup.' })
    }
  }

  return (
    <div className="grid gap-4 max-w-3xl">
      <div className="card p-6 flex gap-4 items-start">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${stale ? 'badge-overdue' : 'badge-paid'}`}>
          {stale ? <ShieldAlert size={22} /> : <CheckCircle2 size={22} />}
        </span>
        <div>
          <h3 className="font-semibold text-lg">
            {last ? `Last backup: ${new Date(last).toLocaleDateString()}` : 'No backup yet'}
          </h3>
          <p className="text-sm text-muted mt-1">
            Your data is stored only in this browser on this device. Clearing browser data,
            switching browsers or changing phones will erase it unless you have a backup.
          </p>
          {stale && <p className="text-sm mt-2 font-medium" style={{ color: 'var(--overdue)' }}>
            {days === null ? 'Create your first backup now.' : `It has been ${days} days. Time for a new backup.`}
          </p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-semibold">Export backup</h3>
          <p className="text-sm text-muted mt-1 mb-4">Download all clients, invoices and settings as a file.</p>
          <button className="btn-primary flex items-center gap-2" onClick={handleExport}>
            <Download size={16} /> Download backup
          </button>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold">Restore backup</h3>
          <p className="text-sm text-muted mt-1 mb-4">Load a backup file to move to a new device or browser.</p>
          <button className="btn-ghost flex items-center gap-2" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Choose backup file
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
        </div>
      </div>

      {msg && (
        <div className={`card p-4 text-sm font-medium ${msg.type === 'ok' ? '' : ''}`}
             style={{ color: msg.type === 'ok' ? 'var(--paid)' : 'var(--overdue)' }}>
          {msg.text}
        </div>
      )}
    </div>
  )
}