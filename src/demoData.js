import { addDays, todayStr, invoiceTotals } from './utils'

export function buildDemoData() {
  const today = todayStr()
  const ago = n => addDays(today, -n)

  const clients = [
    { id: 'c1', name: 'Mia Lawson', company: 'Lumen Design Studio', email: 'mia@lumen.example', phone: '+1 555 0101', status: 'Active', followUp: addDays(today, 5), notes: 'Prefers email. Retainer talk next week.' },
    { id: 'c2', name: 'Daniel Ortiz', company: 'Maple & Co. Bakery', email: 'daniel@maple.example', phone: '+1 555 0102', status: 'Active', followUp: addDays(today, 12), notes: '' },
    { id: 'c3', name: 'Dr. Priya Nair', company: 'Pinecrest Dental', email: 'priya@pinecrest.example', phone: '+1 555 0103', status: 'Active', followUp: '', notes: 'Pays by card.' },
    { id: 'c4', name: 'Tom Becker', company: 'Riverstone Realty', email: 'tom@riverstone.example', phone: '+1 555 0104', status: 'Active', followUp: ago(2), notes: 'Needs a gentle reminder on overdue invoices.' },
    { id: 'c5', name: 'Sara Whitfield', company: 'Atlas Fitness', email: 'sara@atlas.example', phone: '+1 555 0105', status: 'Active', followUp: '', notes: '' },
    { id: 'c6', name: 'Leo Marin', company: 'Coastal Roasters', email: 'leo@coastal.example', phone: '+1 555 0106', status: 'Active', followUp: addDays(today, 3), notes: 'Packaging project in progress.' },
    { id: 'c7', name: 'Hannah Cole', company: 'Juniper Legal', email: 'hannah@juniper.example', phone: '+1 555 0107', status: 'Lead', followUp: addDays(today, 1), notes: 'Asked for a quote on a new website.' },
    { id: 'c8', name: 'Omar Haddad', company: 'Harlow Events', email: 'omar@harlow.example', phone: '+1 555 0108', status: 'Past', followUp: '', notes: 'One-off branding project.' },
  ]

  let n = 0
  const inv = (clientId, issueAgo, terms, items, opts = {}) => {
    n += 1
    const issueDate = ago(issueAgo)
    const base = {
      id: 'i' + n,
      number: 'INV-' + String(n).padStart(4, '0'),
      clientId,
      issueDate,
      dueDate: addDays(issueDate, terms),
      items: items.map(([desc, qty, price], k) => ({ id: `i${n}-${k}`, desc, qty, price })),
      discount: 0,
      taxRate: opts.taxRate || 0,
      notes: 'Thank you for your business! Payment is due by the date shown above.',
      draft: !!opts.draft,
      payments: [],
      ...(opts.lastReminder ? { lastReminder: ago(opts.lastReminder) } : {}),
    }
    const total = invoiceTotals(base).total
    base.payments = (opts.pay || []).map(([offset, amount], k) => {
      const date = addDays(issueDate, offset)
      return {
        id: `p${n}-${k}`,
        date: date > today ? today : date,
        amount: amount === 'full' ? total : amount,
        method: ['Bank transfer', 'Card', 'Online'][(n + k) % 3],
        note: '',
      }
    })
    return base
  }

  const invoices = [
    inv('c8', 165, 14, [['Event branding package', 1, 2400]], { pay: [[10, 'full']] }),
    inv('c2', 150, 14, [['Monthly social media management', 1, 900]], { pay: [[9, 'full']] }),
    inv('c3', 135, 30, [['Website redesign', 1, 3200], ['Hosting & domain setup', 1, 150]], { taxRate: 8, pay: [[22, 'full']] }),
    inv('c4', 120, 14, [['Property photography (per listing)', 12, 75]], { pay: [[12, 'full']] }),
    inv('c1', 105, 14, [['Brand guidelines document', 1, 1800]], { pay: [[8, 'full']] }),
    inv('c5', 90, 14, [['Monthly marketing retainer', 1, 1200]], { pay: [[11, 'full']] }),
    inv('c2', 75, 14, [['Monthly social media management', 1, 900]], { pay: [[13, 'full']] }),
    inv('c6', 60, 14, [['Packaging design', 1, 2800]], { pay: [[20, 1500]], lastReminder: 12 }),
    inv('c4', 40, 14, [['Virtual tour production', 3, 350]], { lastReminder: 10 }),
    inv('c3', 30, 35, [['Monthly SEO package', 1, 1100]], { taxRate: 8, pay: [[26, 600]] }),
    inv('c1', 20, 14, [['Landing page design', 1, 1500]], { pay: [[10, 500]] }),
    inv('c2', 14, 21, [['Monthly social media management', 1, 900], ['Ad creative set', 2, 150]]),
    inv('c6', 7, 14, [['Label revisions', 4, 120]]),
    inv('c5', 3, 14, [['Monthly marketing retainer', 1, 1200]], { pay: [[2, 'full']] }),
    inv('c1', 2, 14, [['Social media templates', 1, 650]], { draft: true }),
  ]

  return {
    settings: {
      businessName: 'Northlight Studio',
      businessEmail: 'hello@northlight.example',
      nextInvoiceNo: n + 1,
    },
    clients,
    invoices,
  }
}