import { useState } from 'react'
import { X, Mail, Copy, Check } from 'lucide-react'
import { composeUrl, copyText } from './utils'

export default function EmailModal({ email, onClose, onSent }) {
  const [form, setForm] = useState(email)
  const [copied, setCopied] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const open = provider => {
    const url = composeUrl(provider, form)
    if (provider === 'mailto') window.location.href = url
    else window.open(url, '_blank', 'noopener')
    onSent?.()
  }

  const copy = async () => {
    const ok = await copyText(`To: ${form.to}\nSubject: ${form.subject}\n\n${form.body}`)
    setCopied(ok)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4"
         style={{ background: 'rgba(0,0,0,.5)' }} onClick={onClose}>
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Send email</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="label">To</label>
            <input className="input" type="email" value={form.to}
                   placeholder="client@example.com"
                   onChange={e => set('to', e.target.value)} />
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject}
                   onChange={e => set('subject', e.target.value)} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input" rows={8} value={form.body}
                      onChange={e => set('body', e.target.value)} />
          </div>
        </div>

        <p className="hint mt-3">
          Nothing is sent automatically. To attach the invoice PDF, save it first using
          "Print / Save as PDF", then attach it in your email.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary flex items-center gap-2" onClick={() => open('gmail')}>
            <Mail size={16} /> Open in Gmail
          </button>
          <button className="btn-ghost" onClick={() => open('outlook')}>Outlook</button>
          <button className="btn-ghost" onClick={() => open('mailto')}>Default mail app</button>
          <button className="btn-ghost flex items-center gap-2" onClick={copy}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}