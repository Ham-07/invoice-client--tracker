import { Sun, Moon } from 'lucide-react'

const ACCENTS = [
  { id: 'teal', color: '#0F766E' },
  { id: 'indigo', color: '#4F46E5' },
  { id: 'rose', color: '#E11D48' },
]

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}

export default function SettingsPage({ data, setData }) {
  const s = data.settings
  const set = (key, value) =>
    setData(d => ({ ...d, settings: { ...d.settings, [key]: value } }))

  return (
    <div className="grid gap-4 max-w-3xl">
      <section className="card p-6 grid gap-4">
        <h3 className="font-semibold text-lg">Business</h3>
        <Field label="Business name">
          <input className="input" value={s.businessName}
                 onChange={e => set('businessName', e.target.value)} />
        </Field>
        <Field label="Business email" hint="Reply-to address used in your invoice emails.">
          <input className="input" type="email" value={s.businessEmail}
                 onChange={e => set('businessEmail', e.target.value)} />
        </Field>
      </section>

      <section className="card p-6 grid gap-4 sm:grid-cols-3">
        <h3 className="font-semibold text-lg sm:col-span-3">Invoices</h3>
        <Field label="Currency">
          <input className="input" value="USD ($)" disabled />
        </Field>
        <Field label="Default tax (%)">
          <input className="input" type="number" min="0" step="0.01" value={s.taxRate}
                 onChange={e => set('taxRate', Number(e.target.value))} />
        </Field>
        <Field label="Invoice prefix">
          <input className="input" value={s.invoicePrefix}
                 onChange={e => set('invoicePrefix', e.target.value)} />
        </Field>
        <Field label="Next invoice number" hint="Automatically increases with each new invoice.">
          <input className="input" type="number" min="1" value={s.nextInvoiceNo}
                 onChange={e => set('nextInvoiceNo', Math.max(1, Number(e.target.value) || 1))} />
        </Field>
      </section>

      <section className="card p-6 grid gap-4">
        <h3 className="font-semibold text-lg">Appearance</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <label className="label">Theme</label>
            <div className="flex gap-2">
              {[['light', Sun, 'Light'], ['dark', Moon, 'Dark']].map(([id, Icon, name]) => (
                <button key={id} onClick={() => set('theme', id)}
                  className={s.theme === id ? 'btn-primary flex items-center gap-2' : 'btn-ghost flex items-center gap-2'}>
                  <Icon size={16} /> {name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Accent color</label>
            <div className="flex gap-3">
              {ACCENTS.map(a => (
                <button key={a.id} onClick={() => set('accent', a.id)} aria-label={a.id}
                  className="h-9 w-9 rounded-full"
                  style={{
                    background: a.color,
                    outline: s.accent === a.id ? `3px solid ${a.color}` : 'none',
                    outlineOffset: 3,
                  }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6 grid gap-4">
        <h3 className="font-semibold text-lg">Invoice email template</h3>
        <Field label="Subject">
          <input className="input" value={s.emailSubject}
                 onChange={e => set('emailSubject', e.target.value)} />
        </Field>
        <Field label="Message"
          hint="You can use: {client} {number} {amount} {dueDate} {business}">
          <textarea className="input" rows={7} value={s.emailBody}
                    onChange={e => set('emailBody', e.target.value)} />
        </Field>
      </section>
    </div>
  )
}