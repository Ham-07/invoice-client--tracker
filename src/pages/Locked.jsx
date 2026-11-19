import { Lock, Check } from 'lucide-react'
import { ETSY_URL } from '../links'

const INFO = {
  getpaid: {
    title: 'Get Paid center',
    text: 'See at a glance who owes you money and how late they are.',
    points: ['Receivables aging bar', 'One-click reminder emails for overdue invoices', 'Invoices due in the next 14 days'],
  },
  payments: {
    title: 'Payments',
    text: 'Every payment you receive, in one searchable list.',
    points: ['All invoices in one place', 'Search by client, method or note', 'Running total of what you collected'],
  },
  reports: {
    title: 'Reports',
    text: 'Understand your income month by month and client by client.',
    points: ['12-month billed vs collected chart', 'Revenue by client', 'Monthly totals table'],
  },
  backup: {
    title: 'Backup & Restore',
    text: 'Your data lives in your browser, so a backup keeps it safe.',
    points: ['Download all data as a file', 'Restore on a new device or browser', 'Backup reminder after 30 days'],
  },
}

export default function LockedPage({ page }) {
  const info = INFO[page]
  if (!info) return null
  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Lock size={26} />
      </span>
      <h3 className="mt-4 text-xl font-bold">{info.title} is in the full version</h3>
      <p className="mt-2 text-sm text-muted">{info.text}</p>
      <ul className="mx-auto mt-5 grid max-w-sm gap-2 text-left text-sm">
        {info.points.map(p => (
          <li key={p} className="flex items-center gap-2">
            <Check size={16} style={{ color: 'var(--paid)' }} /> {p}
          </li>
        ))}
      </ul>
      <a href={ETSY_URL} target="_blank" rel="noreferrer" className="btn-primary mt-6 inline-block">
        Get the full version
      </a>
    </div>
  )
}