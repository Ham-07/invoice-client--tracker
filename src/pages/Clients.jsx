import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import { money, uid, invoiceTotals } from '../utils'

const STATUSES = ['Lead', 'Active', 'Past']
const STATUS_BADGE = { Lead: 'badge-pending', Active: 'badge-paid', Past: 'badge-draft' }

const EMPTY = {
  name: '', company: '', email: '', phone: '',
  status: 'Active', followUp: '', notes: '',
}

function ClientModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = () => {
    if (!form.name.trim()) return setError('Client name is required.')
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      return setError('Please enter a valid email address.')
    onSave({ ...form, name: form.name.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4"
         style={{ background: 'rgba(0,0,0,.5)' }} onClick={onClose}>
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">
            {initial.id ? 'Edit client' : 'New client'}
          </h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Name *</label>
            <input className="input" value={form.name}
                   onChange={e => set('name', e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" value={form.company}
                   onChange={e => set('company', e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status}
                    onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email}
                   onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone}
                   onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Follow-up date</label>
            <input className="input" type="date" value={form.followUp}
                   onChange={e => set('followUp', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={form.notes}
                      onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium" style={{ color: 'var(--overdue)' }}>{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Save client</button>
        </div>
      </div>
    </div>
  )
}

export default function ClientsPage({ data, setData }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [editing, setEditing] = useState(null) // null | client object

  const currency = data.settings.currency

  // Har client ke invoices se billed aur balance nikalo
  const rows = useMemo(() => {
    return data.clients.map(c => {
      const mine = data.invoices.filter(i => i.clientId === c.id)
      const sum = mine.reduce((acc, inv) => {
        const t = invoiceTotals(inv)
        return { billed: acc.billed + t.total, balance: acc.balance + t.balance }
      }, { billed: 0, balance: 0 })
      return { ...c, ...sum, invoiceCount: mine.length }
    })
  }, [data.clients, data.invoices])

  const visible = rows.filter(c => {
    const q = query.toLowerCase()
    const matches = !q || [c.name, c.company, c.email, c.phone]
      .some(v => (v || '').toLowerCase().includes(q))
    return matches && (filter === 'All' || c.status === filter)
  })

  const saveClient = client => {
    setData(d => {
      const exists = d.clients.some(c => c.id === client.id)
      const clients = exists
        ? d.clients.map(c => (c.id === client.id ? client : c))
        : [{ ...client, id: uid(), createdAt: new Date().toISOString() }, ...d.clients]
      return { ...d, clients }
    })
    setEditing(null)
  }

  const removeClient = c => {
    const count = data.invoices.filter(i => i.clientId === c.id).length
    const warn = count
      ? `${c.name} has ${count} invoice(s). Deleting the client will NOT delete the invoices. Continue?`
      : `Delete ${c.name}?`
    if (window.confirm(warn)) {
      setData(d => ({ ...d, clients: d.clients.filter(x => x.id !== c.id) }))
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input" style={{ paddingLeft: 36 }}
                 placeholder="Search clients..." value={query}
                 onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {['All', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={filter === s ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '6px 12px', fontSize: 13 }}>{s}</button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2"
                onClick={() => setEditing(EMPTY)}>
          <Plus size={16} /> New client
        </button>
      </div>

      <div className="card overflow-x-auto">
        {visible.length === 0 ? (
          <div className="p-10 text-center text-muted">
            {data.clients.length === 0
              ? 'No clients yet. Click "New client" to add your first one.'
              : 'No clients match your search.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Billed</th>
                <th className="p-4 font-semibold text-right">Balance</th>
                <th className="p-4 font-semibold">Follow-up</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {visible.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="p-4">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted">
                      {[c.company, c.email].filter(Boolean).join(' · ')}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="p-4 text-right">{money(c.billed, currency)}</td>
                  <td className="p-4 text-right font-semibold"
                      style={{ color: c.balance > 0 ? 'var(--pending)' : 'inherit' }}>
                    {money(c.balance, currency)}
                  </td>
                  <td className="p-4"
                      style={{ color: c.followUp && c.followUp <= today ? 'var(--overdue)' : 'inherit' }}>
                    {c.followUp || '—'}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button className="btn-ghost" style={{ padding: 6 }}
                              onClick={() => setEditing(c)} aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button className="btn-ghost" style={{ padding: 6 }}
                              onClick={() => removeClient(c)} aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ClientModal initial={editing} onSave={saveClient} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}