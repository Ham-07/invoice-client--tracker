import { useState } from 'react'
import { ArrowLeft, Printer, Mail, Copy, Pencil, Plus, Trash2, Check } from 'lucide-react'
import {
  money, uid, invoiceTotals, invoiceStatus, todayStr,
  buildEmail, openMailClient, copyText,
} from '../utils'
import { IS_DEMO } from '../mode'

const STATUS_BADGE = {
  Paid: 'badge-paid', Pending: 'badge-pending',
  Overdue: 'badge-overdue', Draft: 'badge-draft',
}
const METHODS = ['Bank transfer', 'Cash', 'Card', 'Online', 'Other']

// Invoice paper hamesha white rehta hai (dark mode mein bhi), taake PDF sahi bane
const paper = { background: '#fff', color: '#0F1A22', borderRadius: 16 }
const line = '1px solid #E4E8ED'

export default function InvoiceView({ invoiceId, data, setData, onBack, onEdit }) {
  const { settings, clients } = data
  const inv = data.invoices.find(i => i.id === invoiceId)
  const client = clients.find(c => c.id === inv?.clientId)
  const cur = settings.currency

  const [pay, setPay] = useState({ amount: '', date: todayStr(), method: 'Bank transfer', note: '' })
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  if (!inv) return null

  const t = invoiceTotals(inv)
  const status = invoiceStatus(inv)

  const updateInvoice = patch =>
    setData(d => ({
      ...d,
      invoices: d.invoices.map(i => (i.id === inv.id ? { ...i, ...patch } : i)),
    }))

  const addPayment = () => {
    const amount = Number(pay.amount)
    if (!amount || amount <= 0) return setError('Enter a payment amount greater than 0.')
    if (amount > t.balance + 0.001)
      return setError(`Payment cannot be more than the balance (${money(t.balance, cur)}).`)
    if (!pay.date) return setError('Choose a payment date.')
    setError('')
    updateInvoice({
      payments: [...(inv.payments || []), { id: uid(), ...pay, amount }],
    })
    setPay({ amount: '', date: todayStr(), method: 'Bank transfer', note: '' })
  }

  const removePayment = id => {
    if (window.confirm('Delete this payment?'))
      updateInvoice({ payments: inv.payments.filter(p => p.id !== id) })
  }
  const changeStatus = value => {
    if (value === 'Draft') {
      updateInvoice({ draft: true })
      return
    }

    if (value === 'Sent') {
      if (t.total > 0 && t.balance <= 0) {
        window.alert('This invoice is fully paid. Delete a payment below if you want to reopen it.')
        return
      }
      updateInvoice({ draft: false })
      return
    }

    if (value === 'Paid') {
      if (t.balance <= 0) return
      if (!window.confirm(`Record a payment of ${money(t.balance, cur)} and mark this invoice as paid?`)) return
      updateInvoice({
        draft: false,
        payments: [
          ...(inv.payments || []),
          { id: uid(), amount: t.balance, date: todayStr(), method: 'Other', note: 'Marked as paid' },
        ],
      })
    }
  }

  const statusValue = status === 'Draft' ? 'Draft' : status === 'Paid' ? 'Paid' : 'Sent'
  const email = buildEmail(inv, client, settings, t.balance > 0 ? t.balance : t.total)

  const handleCopy = async () => {
    const ok = await copyText(`Subject: ${email.subject}\n\n${email.body}`)
    setCopied(ok)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmail = () => {
    if (!client?.email && !window.confirm('This client has no email address. Open your email app anyway?')) return
    openMailClient(email)
  }

    const demoLock = () =>
    window.alert('Print / Save as PDF and Send email are available in the full version.')

  return (
    <div className="grid gap-4 max-w-4xl">
      {/* Top bar */}
      <div className="no-print flex flex-wrap items-center gap-2">
        <button className="btn-ghost flex items-center gap-2" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
       <span className={`badge ${STATUS_BADGE[status]}`}>{status}</span>
<select
  className="input"
  style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
  value={statusValue}
  onChange={e => changeStatus(e.target.value)}
  aria-label="Change invoice status"
>
  <option value="Draft">Draft</option>
  <option value="Sent">Sent (Pending / Overdue)</option>
  <option value="Paid">Paid</option>
</select>
        <div className="flex flex-wrap gap-2 ml-auto">
          <button className="btn-ghost flex items-center gap-2" onClick={() => onEdit(inv)}>
            <Pencil size={16} /> Edit
          </button>
          <button className="btn-ghost flex items-center gap-2" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy message'}
          </button>
          <button className="btn-ghost flex items-center gap-2" onClick={IS_DEMO ? demoLock : handleEmail}>
            <Mail size={16} /> Send email
          </button>
         <button className="btn-primary flex items-center gap-2" onClick={IS_DEMO ? demoLock : () => window.print()}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      <p className="no-print text-xs text-muted">
        Tip: To email the PDF, first click "Print / Save as PDF" and choose "Save as PDF",
        then click "Send email" and attach the saved file.
      </p>

      {/* Invoice paper */}
      <div id="print-area" className="card" style={{ ...paper, padding: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
              {settings.businessName}
            </h2>
            {settings.businessEmail && (
              <p style={{ fontSize: 13, color: '#66788A', marginTop: 4 }}>{settings.businessEmail}</p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: 2 }}>INVOICE</h1>
            <p style={{ fontSize: 14, color: '#66788A' }}>{inv.number}</p>
            {status === 'Paid' && (
              <p style={{ marginTop: 6, fontWeight: 800, color: '#16A34A', letterSpacing: 2 }}>PAID</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginTop: 32 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#66788A', textTransform: 'uppercase', letterSpacing: 1 }}>Bill to</p>
            <p style={{ fontWeight: 700, marginTop: 4 }}>{client?.name || 'Unknown client'}</p>
            {client?.company && <p style={{ fontSize: 14 }}>{client.company}</p>}
            {client?.email && <p style={{ fontSize: 14, color: '#66788A' }}>{client.email}</p>}
            {client?.phone && <p style={{ fontSize: 14, color: '#66788A' }}>{client.phone}</p>}
          </div>
          <div style={{ fontSize: 14, textAlign: 'right' }}>
            <p><span style={{ color: '#66788A' }}>Issue date: </span>{inv.issueDate}</p>
            <p><span style={{ color: '#66788A' }}>Due date: </span><b>{inv.dueDate}</b></p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 32, fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #0F1A22', textAlign: 'left' }}>
              <th style={{ padding: '8px 0' }}>Description</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>Qty</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map(i => (
              <tr key={i.id} style={{ borderBottom: line }}>
                <td style={{ padding: '10px 0' }}>{i.desc}</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>{i.qty}</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>{money(i.price, cur)}</td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>
                  {money((Number(i.qty) || 0) * (Number(i.price) || 0), cur)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginLeft: 'auto', maxWidth: 280, marginTop: 20, fontSize: 14 }}>
          {[
            ['Subtotal', money(t.subtotal, cur)],
            t.discount > 0 && ['Discount', '-' + money(t.discount, cur)],
            ['Tax (' + (Number(inv.taxRate) || 0) + '%)', money(t.tax, cur)],
            ['Total', money(t.total, cur), true],
            t.paid > 0 && ['Paid', '-' + money(t.paid, cur)],
          ].filter(Boolean).map(([k, v, bold]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: bold ? 700 : 400 }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '10px 12px',
            borderRadius: 10, fontWeight: 800, fontSize: 16,
            background: 'var(--primary)', color: '#fff',
          }}>
            <span>Balance due</span><span>{money(t.balance, cur)}</span>
          </div>
        </div>

        {inv.notes && (
          <div style={{ marginTop: 32, fontSize: 13, color: '#44586A', whiteSpace: 'pre-wrap' }}>
            <p style={{ fontWeight: 700, color: '#0F1A22', marginBottom: 4 }}>Notes</p>
            {inv.notes}
          </div>
        )}
      </div>

      {/* Payments (print mein nahi aata) */}
      <section className="no-print card p-6">
        <h3 className="font-semibold mb-4">Payments</h3>

        {(inv.payments || []).length === 0 ? (
          <p className="text-sm text-muted mb-4">No payments recorded yet.</p>
        ) : (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {inv.payments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2">{p.date}</td>
                    <td className="py-2">{p.method}</td>
                    <td className="py-2 text-muted">{p.note}</td>
                    <td className="py-2 text-right font-semibold">{money(p.amount, cur)}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => removePayment(p.id)} aria-label="Delete payment">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {t.balance > 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="label">Amount</label>
                <input className="input" type="number" min="0" step="0.01" value={pay.amount}
                       onChange={e => setPay(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" value={pay.date}
                       onChange={e => setPay(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Method</label>
                <select className="input" value={pay.method}
                        onChange={e => setPay(p => ({ ...p, method: e.target.value }))}>
                  {METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Note</label>
                <input className="input" value={pay.note}
                       onChange={e => setPay(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-primary flex items-center gap-2" onClick={addPayment}>
                <Plus size={16} /> Record payment
              </button>
              <button className="btn-ghost"
                      onClick={() => setPay(p => ({ ...p, amount: String(t.balance.toFixed(2)) }))}>
                Fill full balance ({money(t.balance, cur)})
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm font-medium" style={{ color: 'var(--paid)' }}>
            This invoice is fully paid.
          </p>
        )}

        {error && <p className="mt-3 text-sm font-medium" style={{ color: 'var(--overdue)' }}>{error}</p>}
      </section>
    </div>
  )
}