const KEY = 'invoice_client_app_v1'
import { IS_DEMO } from './mode'
import { buildDemoData } from './demoData'

export const defaults = {
  settings: {
    businessName: 'My Business',
    businessEmail: '',
    currency: 'USD',
    taxRate: 0,
    invoicePrefix: 'INV-',
    nextInvoiceNo: 1,
    emailSubject: 'Invoice {number} from {business}',
    emailBody:
`Hi {client},

Please find invoice {number} for {amount}, due on {dueDate}.

Thank you,
{business}`,
    theme: 'light',
    accent: 'teal',
    lastBackup: null,
  },
  clients: [],
  invoices: [], // har invoice ke andar items[] aur payments[] hongi
}

function merge(raw) {
  const base = structuredClone(defaults)
  return {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(raw?.settings || {}) },
  }
}

export function load() {
  if (IS_DEMO) return merge(buildDemoData())
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    return raw ? merge(raw) : structuredClone(defaults)
  } catch {
    return structuredClone(defaults)
  }
}

// export function load() {
//   return merge(buildDemoData())   // sirf recording ke liye, baad mein hata dena
// }

export function save(data) {
  if (IS_DEMO) return // demo mein kuch save nahi hota
  try { localStorage.setItem(KEY, JSON.stringify(data)) }
  catch (e) { console.error('Save failed', e) }
}

export function exportBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function importBackup(file) {
  const parsed = JSON.parse(await file.text())
  if (!Array.isArray(parsed.clients) || !Array.isArray(parsed.invoices)) {
    throw new Error('Invalid backup file')
  }
  return merge(parsed)
}