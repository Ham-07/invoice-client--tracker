import { useMemo } from 'react'
import { RevenueChart } from '../Charts'
import { money, invoiceTotals, monthlySeries } from '../utils'

export default function ReportsPage({ data }) {
  const cur = data.settings.currency
  const series = useMemo(() => monthlySeries(data, 12), [data])

  const clientRows = useMemo(() => {
    return data.clients
      .map(c => {
        const mine = data.invoices.filter(i => i.clientId === c.id && !i.draft)
        const sum = mine.reduce((a, inv) => {
          const t = invoiceTotals(inv)
          return { billed: a.billed + t.total, paid: a.paid + t.paid, balance: a.balance + t.balance }
        }, { billed: 0, paid: 0, balance: 0 })
        return { id: c.id, name: c.name, count: mine.length, ...sum }
      })
      .filter(r => r.count > 0)
      .sort((a, b) => b.billed - a.billed)
  }, [data])

  const totalBilled = series.reduce((s, m) => s + m.billed, 0)
  const totalCollected = series.reduce((s, m) => s + m.collected, 0)

  return (
    <div className="grid gap-4">
      <RevenueChart data={series} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5 overflow-x-auto">
          <h3 className="font-semibold mb-3">Last 12 months</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="py-2 font-semibold">Month</th>
                <th className="py-2 font-semibold text-right">Billed</th>
                <th className="py-2 font-semibold text-right">Collected</th>
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map(m => (
                <tr key={m.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2.5">{m.key}</td>
                  <td className="py-2.5 text-right">{money(m.billed, cur)}</td>
                  <td className="py-2.5 text-right">{money(m.collected, cur)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2.5">Total</td>
                <td className="py-2.5 text-right">{money(totalBilled, cur)}</td>
                <td className="py-2.5 text-right">{money(totalCollected, cur)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="card p-5 overflow-x-auto">
          <h3 className="font-semibold mb-3">Revenue by client</h3>
          {clientRows.length === 0 ? (
            <p className="text-sm text-muted">No billed invoices yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-2 font-semibold">Client</th>
                  <th className="py-2 font-semibold text-right">Billed</th>
                  <th className="py-2 font-semibold text-right">Paid</th>
                  <th className="py-2 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {clientRows.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2.5 font-medium">{r.name}</td>
                    <td className="py-2.5 text-right">{money(r.billed, cur)}</td>
                    <td className="py-2.5 text-right">{money(r.paid, cur)}</td>
                    <td className="py-2.5 text-right font-semibold">{money(r.balance, cur)}</td>
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