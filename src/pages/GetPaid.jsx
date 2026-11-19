import { useMemo } from 'react'
import { Bell, Eye } from 'lucide-react'
import {
  money, invoiceTotals, invoiceStatus, daysLate, todayStr,
  buildReminder, openMailClient,
} from '../utils'

const BUCKETS = [
  { id: 'notdue', label: 'Not yet due', color: 'var(--paid)' },
  { id: 'b30', label: '1–30 days late', color: 'var(--pending)' },
  { id: 'b60', label: '31–60 days late', color: '#EA580C' },
  { id: 'b61', label: '61+ days late', color: 'var(--overdue)' },
]

function bucketOf(late) {
  if (late <= 0) return 'notdue'
  if (late <= 30) return 'b30'
  if (late <= 60) return 'b60'
  return 'b61'
}

export default function GetPaidPage({ data, setData, onOpenInvoice }) {
  const cur = data.settings.currency
  const clientOf = id => data.clients.find(c => c.id === id)

  const open = useMemo(
    () => data.invoices
      .map(inv => ({ ...inv, status: invoiceStatus(inv), ...invoiceTotals(inv), late: daysLate(inv.dueDate) }))
      .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue'),
    [data.invoices]
  )

  const totals = { notdue: 0, b30: 0, b60: 0, b61: 0 }
  open.forEach(inv => { totals[bucketOf(inv.late)] += inv.balance })
  const grand = Object.values(totals).reduce((a, b) => a + b, 0)

  const overdue = open.filter(i => i.status === 'Overdue').sort((a, b) => b.late - a.late)
  const upcoming = open
    .filter(i => i.status === 'Pending' && i.late >= -14)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const remind = inv => {
    const client = clientOf(inv.clientId)
    if (!client?.email && !window.confirm('This client has no email address. Open your email app anyway?')) return
    openMailClient(buildReminder(inv, client, data.settings, inv.balance))
    setData(d => ({
      ...d,
      invoices: d.invoices.map(i => (i.id === inv.id ? { ...i, lastReminder: todayStr() } : i)),
    }))
  }

  return (
    <div className="grid gap-4">
      <section className="card p-5">
        <h3 className="font-semibold">Receivables aging</h3>
        <p className="text-sm text-muted mb-4">How late are your unpaid invoices?</p>

        {grand === 0 ? (
          <p className="text-sm text-muted">Nothing outstanding right now. 🎉</p>
        ) : (
          <>
            <div className="flex h-3 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
              {BUCKETS.map(b => totals[b.id] > 0 && (
                <div key={b.id} style={{ width: `${(totals[b.id] / grand) * 100}%`, background: b.color }} />
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {BUCKETS.map(b => (
                <div key={b.id}>
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <i className="h-2 w-2 rounded-full" style={{ background: b.color }} /> {b.label}
                  </p>
                  <p className="font-bold mt-1">{money(totals[b.id], cur)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="card p-5">
        <h3 className="font-semibold">Overdue — send a reminder</h3>
        <p className="text-sm text-muted mb-3">
          Opens your email app with a polite message. Nothing is sent automatically.
        </p>
        {overdue.length === 0 ? (
          <p className="text-sm text-muted">No overdue invoices.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-2 font-semibold">Invoice</th>
                  <th className="py-2 font-semibold">Client</th>
                  <th className="py-2 font-semibold">Late</th>
                  <th className="py-2 font-semibold">Last reminder</th>
                  <th className="py-2 font-semibold text-right">Balance</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {overdue.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 font-semibold">{inv.number}</td>
                    <td className="py-3">{clientOf(inv.clientId)?.name || 'Unknown client'}</td>
                    <td className="py-3"><span className="badge badge-overdue">{inv.late} days</span></td>
                    <td className="py-3 text-muted">{inv.lastReminder || 'Never'}</td>
                    <td className="py-3 text-right font-semibold">{money(inv.balance, cur)}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button className="btn-primary flex items-center gap-1.5" style={{ padding: '6px 12px', fontSize: 13 }}
                                onClick={() => remind(inv)}>
                          <Bell size={14} /> Remind
                        </button>
                        <button className="btn-ghost flex items-center gap-1.5" style={{ padding: '6px 12px', fontSize: 13 }}
                                onClick={() => onOpenInvoice(inv.id)}>
                          <Eye size={14} /> Open
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-5">
        <h3 className="font-semibold mb-3">Due in the next 14 days</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">Nothing due soon.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {upcoming.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3">
                    <button className="font-semibold text-primary" onClick={() => onOpenInvoice(inv.id)}>{inv.number}</button>
                  </td>
                  <td className="py-3">{clientOf(inv.clientId)?.name || 'Unknown client'}</td>
                  <td className="py-3 text-muted">Due {inv.dueDate}</td>
                  <td className="py-3 text-right font-semibold">{money(inv.balance, cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}