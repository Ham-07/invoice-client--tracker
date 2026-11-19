import { useMemo } from 'react'
import { Wallet, Clock, CheckCircle2, UserCheck } from 'lucide-react'
import { RevenueChart, StatusDonut } from '../Charts'
import {
  money, invoiceTotals, invoiceStatus, monthlySeries, todayStr, addDays,
} from '../utils'

const STATUS_BADGE = {
  Paid: 'badge-paid', Pending: 'badge-pending',
  Overdue: 'badge-overdue', Draft: 'badge-draft',
}

export default function Dashboard({ data, onOpenInvoice }) {
  const cur = data.settings.currency

  const s = useMemo(() => {
    const today = todayStr()
    const since = addDays(today, -30)
    let outstanding = 0, overdue = 0, collected = 0
    const counts = { Paid: 0, Pending: 0, Overdue: 0, Draft: 0 }
    const perClient = {}

    for (const inv of data.invoices) {
      const st = invoiceStatus(inv)
      const t = invoiceTotals(inv)
      counts[st] += 1
      if (st === 'Pending' || st === 'Overdue') outstanding += t.balance
      if (st === 'Overdue') overdue += t.balance
      for (const p of inv.payments || []) {
        if (p.date >= since && p.date <= today) collected += Number(p.amount) || 0
      }
      if (!inv.draft) {
        const c = perClient[inv.clientId] || { billed: 0, balance: 0 }
        c.billed += t.total
        c.balance += t.balance
        perClient[inv.clientId] = c
      }
    }

    const topClients = Object.entries(perClient)
      .map(([id, v]) => ({
        id,
        name: data.clients.find(c => c.id === id)?.name || 'Unknown client',
        ...v,
      }))
      .sort((a, b) => b.billed - a.billed)
      .slice(0, 5)

    const recent = [...data.invoices]
      .sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''))
      .slice(0, 5)
      .map(inv => ({ ...inv, status: invoiceStatus(inv), ...invoiceTotals(inv) }))

    return { outstanding, overdue, collected, counts, topClients, recent }
  }, [data])

  const activeClients = data.clients.filter(c => c.status === 'Active').length
  const donut = Object.entries(s.counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const cards = [
    { label: 'Outstanding', value: money(s.outstanding, cur), icon: Wallet },
    { label: 'Overdue', value: money(s.overdue, cur), icon: Clock, danger: s.overdue > 0 },
    { label: 'Collected (30 days)', value: money(s.collected, cur), icon: CheckCircle2 },
    { label: 'Active clients', value: String(activeClients), icon: UserCheck },
  ]

  const clientName = id => data.clients.find(c => c.id === id)?.name || 'Unknown client'

  return (
    <div className="grid gap-4">
      {data.clients.length === 0 && data.invoices.length === 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-lg">Welcome 👋</h3>
          <p className="text-sm text-muted mt-1">
            Start by adding a client in <b>Clients</b>, then create your first invoice in <b>Invoices</b>.
            Your dashboard will fill up automatically.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, danger }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold" style={{ color: danger ? 'var(--overdue)' : 'inherit' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlySeries(data, 6)} />
        </div>
        {donut.length > 0 ? (
          <StatusDonut data={donut} />
        ) : (
          <div className="card p-5 grid place-items-center text-sm text-muted text-center">
            Invoice status chart appears after your first invoice.
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="font-semibold mb-3">Top clients</h3>
          {s.topClients.length === 0 ? (
            <p className="text-sm text-muted">No billed invoices yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {s.topClients.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium">{c.name}</td>
                    <td className="py-2.5 text-right">{money(c.billed, cur)}</td>
                    <td className="py-2.5 text-right text-muted">
                      {c.balance > 0 ? `${money(c.balance, cur)} due` : 'Settled'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card p-5">
          <h3 className="font-semibold mb-3">Recent invoices</h3>
          {s.recent.length === 0 ? (
            <p className="text-sm text-muted">No invoices yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {s.recent.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5">
                      <button className="font-semibold text-primary" onClick={() => onOpenInvoice(inv.id)}>
                        {inv.number}
                      </button>
                      <p className="text-xs text-muted">{clientName(inv.clientId)}</p>
                    </td>
                    <td className="py-2.5"><span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span></td>
                    <td className="py-2.5 text-right font-semibold">{money(inv.total, cur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}