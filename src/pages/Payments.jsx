import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { money } from '../utils'

export default function PaymentsPage({ data, onOpenInvoice }) {
  const [query, setQuery] = useState('')
  const cur = data.settings.currency

  const rows = useMemo(
    () => data.invoices
      .flatMap(inv => (inv.payments || []).map(p => ({
        ...p,
        invoiceId: inv.id,
        number: inv.number,
        client: data.clients.find(c => c.id === inv.clientId)?.name || 'Unknown client',
      })))
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [data]
  )

  const q = query.toLowerCase()
  const visible = rows.filter(r =>
    !q || [r.number, r.client, r.method, r.note].some(v => (v || '').toLowerCase().includes(q)))
  const total = visible.reduce((s, r) => s + (Number(r.amount) || 0), 0)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search payments…"
                 value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="card px-4 py-2 text-sm">
          Total shown: <b>{money(total, cur)}</b>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {visible.length === 0 ? (
          <div className="p-10 text-center text-muted">
            {rows.length === 0
              ? 'No payments yet. Record one from an invoice.'
              : 'No payments match your search.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted" style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Invoice</th>
                <th className="p-4 font-semibold">Client</th>
                <th className="p-4 font-semibold">Method</th>
                <th className="p-4 font-semibold">Note</th>
                <th className="p-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="p-4">{r.date}</td>
                  <td className="p-4">
                    <button className="font-semibold text-primary" onClick={() => onOpenInvoice(r.invoiceId)}>
                      {r.number}
                    </button>
                  </td>
                  <td className="p-4">{r.client}</td>
                  <td className="p-4">{r.method}</td>
                  <td className="p-4 text-muted">{r.note}</td>
                  <td className="p-4 text-right font-semibold" style={{ color: 'var(--paid)' }}>
                    {money(r.amount, cur)}
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