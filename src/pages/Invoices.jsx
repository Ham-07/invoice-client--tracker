import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, ArrowLeft, X, Eye } from 'lucide-react'
import { money, uid, invoiceTotals, invoiceStatus, todayStr, addDays } from '../utils'
import InvoiceView from './InvoiceView'

const STATUS_BADGE = {
  Paid: 'badge-paid', Pending: 'badge-pending',
  Overdue: 'badge-overdue', Draft: 'badge-draft',
}
const FILTERS = ['All', 'Draft', 'Pending', 'Overdue', 'Paid']

const newItem = () => ({ id: uid(), desc: '', qty: 1, price: 0 })

function emptyInvoice(settings) {
  const issue = todayStr()
  return {
    clientId: '', issueDate: issue, dueDate: addDays(issue, 14),
    items: [newItem()], discount: 0, taxRate: settings.taxRate || 0,
    notes: '', draft: false, payments: [],
  }
}

function InvoiceForm({ initial, clients, settings, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const t = invoiceTotals(form)
  const cur = settings.currency

  const setItem = (id, k, v) =>
    set('items', form.items.map(i => (i.id === id ? { ...i, [k]: v } : i)))
  const removeItem = id =>
    set('items', form.items.length > 1 ? form.items.filter(i => i.id !== id) : form.items)

  const submit = draft => {
    if (!form.clientId) return setError('Please select a client.')
    if (!form.items.some(i => i.desc.trim())) return setError('Add at least one line item with a description.')
    if (form.dueDate < form.issueDate) return setError('Due date cannot be before the issue date.')
    const items = form.items.filter(i => i.desc.trim())
    onSave({ ...form, items, draft })
  }

  const numberLabel = initial.number
    || settings.invoicePrefix + String(settings.nextInvoiceNo).padStart(4, '0')

  return (
    <div className="grid gap-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <button className="btn-ghost flex items-center gap-2" onClick={onCancel}>
          <ArrowLeft size={16} /> Back
        </button>
        <h3 className="text-lg font-semibold">
          {initial.id ? `Edit ${numberLabel}` : `New invoice ${numberLabel}`}
        </h3>
      </div>

      <section className="card p-6 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="label">Client *</label>
          {clients.length === 0 ? (
            <p className="text-sm text-muted">Add a client first (Clients page), then come back.</p>
          ) : (
            <select className="input" value={form.clientId}
                    onChange={e => set('clientId', e.target.value)}>
              <option value="">Select a client…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.company ? ` — ${c.company}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="label">Issue date</label>
          <input className="input" type="date" value={form.issueDate}
                 onChange={e => set('issueDate', e.target.value)} />
        </div>
        <div>
          <label className="label">Due date</label>
          <input className="input" type="date" value={form.dueDate}
                 onChange={e => set('dueDate', e.target.value)} />
        </div>
        <div>
          <label className="label">Tax rate (%)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.taxRate}
                 onChange={e => set('taxRate', e.target.value)} />
        </div>
      </section>

      <section className="card p-6">
        <h3 className="font-semibold mb-4">Items</h3>
        <div className="grid gap-3">
          {form.items.map(i => (
            <div key={i.id} className="grid grid-cols-12 gap-2 items-center">
              <input className="input col-span-12 sm:col-span-6" placeholder="Description"
                     value={i.desc} onChange={e => setItem(i.id, 'desc', e.target.value)} />
              <input className="input col-span-4 sm:col-span-2" type="number" min="0" step="1"
                     placeholder="Qty" value={i.qty}
                     onChange={e => setItem(i.id, 'qty', e.target.value)} />
              <input className="input col-span-5 sm:col-span-2" type="number" min="0" step="0.01"
                     placeholder="Price" value={i.price}
                     onChange={e => setItem(i.id, 'price', e.target.value)} />
              <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                <span className="text-sm font-semibold">
                  {money((Number(i.qty) || 0) * (Number(i.price) || 0), cur)}
                </span>
                <button onClick={() => removeItem(i.id)} aria-label="Remove item"><X size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-ghost mt-4 flex items-center gap-2"
                onClick={() => set('items', [...form.items, newItem()])}>
          <Plus size={16} /> Add item
        </button>

        <div className="mt-6 ml-auto grid gap-2 max-w-xs text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(t.subtotal, cur)}</span></div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-muted">Discount ($)</span>
            <input className="input" style={{ width: 110, textAlign: 'right' }} type="number"
                   min="0" step="0.01" value={form.discount}
                   onChange={e => set('discount', e.target.value)} />
          </div>
          <div className="flex justify-between"><span className="text-muted">Tax ({Number(form.taxRate) || 0}%)</span><span>{money(t.tax, cur)}</span></div>
          <div className="flex justify-between text-base font-bold pt-2"
               style={{ borderTop: '1px solid var(--border)' }}>
            <span>Total</span><span>{money(t.total, cur)}</span>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <label className="label">Notes (shown on the invoice)</label>
        <textarea className="input" rows={3} value={form.notes}
                  placeholder="Payment instructions, thank-you note…"
                  onChange={e => set('notes', e.target.value)} />
      </section>

      {error && <p className="text-sm font-medium" style={{ color: 'var(--overdue)' }}>{error}</p>}

      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-ghost" onClick={() => submit(true)}>Save as draft</button>
        <button className="btn-primary" onClick={() => submit(false)}>Save invoice</button>
      </div>
    </div>
  )
}

export default function InvoicesPage({ data, setData }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [editing, setEditing] = useState(null)
  const [viewingId, setViewingId] = useState(null)

  const { settings, clients } = data
  const clientName = id => clients.find(c => c.id === id)?.name || 'Unknown client'

  const rows = useMemo(
    () => data.invoices
      .map(inv => ({ ...inv, status: invoiceStatus(inv), ...invoiceTotals(inv) }))
      .sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || '')),
    [data.invoices]
  )

  const visible = rows.filter(inv => {
    const q = query.toLowerCase()
    const ok = !q || inv.number.toLowerCase().includes(q) || clientName(inv.clientId).toLowerCase().includes(q)
    return ok && (filter === 'All' || inv.status === filter)
  })

  const saveInvoice = inv => {
    setData(d => {
      const exists = d.invoices.some(i => i.id === inv.id)
      if (exists) {
        return { ...d, invoices: d.invoices.map(i => (i.id === inv.id ? inv : i)) }
      }
      const s = d.settings
      const number = s.invoicePrefix + String(s.nextInvoiceNo).padStart(4, '0')
      return {
        ...d,
        settings: { ...s, nextInvoiceNo: s.nextInvoiceNo + 1 },
        invoices: [{ ...inv, id: uid(), number, createdAt: new Date().toISOString() }, ...d.invoices],
      }
    })
    setEditing(null)
    if (inv.id) setViewingId(inv.id) // edit ke baad wapas invoice view par
  }

  const removeInvoice = inv => {
    if (window.confirm(`Delete ${inv.number}? This cannot be undone.`)) {
      setData(d => ({ ...d, invoices: d.invoices.filter(i => i.id !== inv.id) }))
    }
  }

  if (editing) {
    return (
      <InvoiceForm initial={editing} clients={clients} settings={settings}
                   onSave={saveInvoice} onCancel={() => setEditing(null)} />
    )
  }

  if (viewingId && data.invoices.some(i => i.id === viewingId)) {
    return (
      <InvoiceView
        invoiceId={viewingId}
        data={data}
        setData={setData}
        onBack={() => setViewingId(null)}
        onEdit={inv => { setViewingId(null); setEditing(inv) }}
      />
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input" style={{ paddingLeft: 36 }}
                 placeholder="Search by number or client…" value={query}
                 onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={filter === f ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '6px 12px', fontSize: 13 }}>{f}</button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2"
                onClick={() => setEditing(emptyInvoice(settings))}>
          <Plus size={16} /> New invoice
        </button>
      </div>

      <div className="card overflow-x-auto">
        {visible.length === 0 ? (
          <div className="p-10 text-center text-muted">
            {data.invoices.length === 0
              ? 'No invoices yet. Click "New invoice" to create your first one.'
              : 'No invoices match your search.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="p-4 font-semibold">Invoice</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Due</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Total</th>
                <th className="p-4 font-semibold text-right">Balance</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {visible.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="p-4 font-semibold">
                    <button className="text-primary" onClick={() => setViewingId(inv.id)}>
                      {inv.number}
                    </button>
                  </td>
                  <td className="p-4">{clientName(inv.clientId)}</td>
                  <td className="p-4">{inv.dueDate}</td>
                  <td className="p-4"><span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span></td>
                  <td className="p-4 text-right">{money(inv.total, settings.currency)}</td>
                  <td className="p-4 text-right font-semibold">{money(inv.balance, settings.currency)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setViewingId(inv.id)} aria-label="View"><Eye size={15} /></button>
                      <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setEditing(inv)} aria-label="Edit"><Pencil size={15} /></button>
                      <button className="btn-ghost" style={{ padding: 6 }} onClick={() => removeInvoice(inv)} aria-label="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}