export function money(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(value) || 0)
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

export function buildEmail(invoice, client, settings, total) {
  const vars = {
    client: client?.name || '',
    number: invoice.number,
    amount: money(total, settings.currency),
    dueDate: invoice.dueDate,
    business: settings.businessName,
  }
  return {
    to: client?.email || '',
    subject: fill(settings.emailSubject, vars),
    body: fill(settings.emailBody, vars),
  }
}

export function openMailClient({ to, subject, body }) {
  const url =
    `mailto:${encodeURIComponent(to)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  window.location.href = url
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true }
  catch { return false }
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

// Invoice ke totals (Invoices step mein bhi yahi use hoga)
export function invoiceTotals(inv) {
  const subtotal = (inv.items || []).reduce(
    (s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0)
  const discount = Number(inv.discount) || 0
  const taxable = Math.max(subtotal - discount, 0)
  const tax = taxable * ((Number(inv.taxRate) || 0) / 100)
  const total = taxable + tax
  const paid = (inv.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0)
  return { subtotal, discount, tax, total, paid, balance: Math.max(total - paid, 0) }
}

export const todayStr = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-CA')
}

// Status khud calculate hota hai, store nahi hota
export function invoiceStatus(inv) {
  if (inv.draft) return 'Draft'
  const { total, balance } = invoiceTotals(inv)
  if (total > 0 && balance <= 0) return 'Paid'
  if (inv.dueDate && inv.dueDate < todayStr()) return 'Overdue'
  return 'Pending'
}
export function daysLate(dueDate) {
  if (!dueDate) return 0
  const a = new Date(todayStr() + 'T00:00:00')
  const b = new Date(dueDate + 'T00:00:00')
  return Math.round((a - b) / 86400000)
}

export function monthlySeries(data, n = 6) {
  const now = new Date()
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    months.push({
      key,
      month: d.toLocaleString('en-US', { month: 'short' }),
      billed: 0,
      collected: 0,
    })
  }
  const byKey = Object.fromEntries(months.map(m => [m.key, m]))

  for (const inv of data.invoices) {
    if (!inv.draft) {
      const m = byKey[(inv.issueDate || '').slice(0, 7)]
      if (m) m.billed += invoiceTotals(inv).total
    }
    for (const p of inv.payments || []) {
      const m = byKey[(p.date || '').slice(0, 7)]
      if (m) m.collected += Number(p.amount) || 0
    }
  }
  return months.map(m => ({
    ...m,
    billed: Math.round(m.billed * 100) / 100,
    collected: Math.round(m.collected * 100) / 100,
  }))
}

export function buildReminder(inv, client, settings, balance) {
  const late = daysLate(inv.dueDate)
  const amount = money(balance, settings.currency)
  return {
    to: client?.email || '',
    subject: `Friendly reminder: invoice ${inv.number}`,
    body:
`Hi ${client?.name || ''},

This is a friendly reminder that invoice ${inv.number} for ${amount} was due on ${inv.dueDate}${late > 0 ? ` (${late} days ago)` : ''}. If you have already paid, please ignore this message.

Thank you,
${settings.businessName}`,
  }
}