import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'

const tip = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--text)',
  fontSize: 13,
}

export function RevenueChart({ data }) {
  // data: [{ month: 'Jan', billed: 1800, collected: 1200 }, ...]
  return (
    <div className="card p-5">
      <h3 className="font-semibold">Revenue by month</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--muted)" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip contentStyle={tip} cursor={{ fill: 'var(--primary-soft)' }} />
            <Bar dataKey="billed" fill="var(--primary-2)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="collected" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full" style={{ background: 'var(--primary-2)' }} /> Billed
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full" style={{ background: 'var(--primary)' }} /> Collected
        </span>
      </div>
    </div>
  )
}

const STATUS_COLORS = {
  Paid: 'var(--paid)',
  Pending: 'var(--pending)',
  Overdue: 'var(--overdue)',
  Draft: 'var(--draft)',
}

export function StatusDonut({ data }) {
  // data: [{ name: 'Paid', value: 12 }, ...]
  return (
    <div className="card p-5">
      <h3 className="font-semibold">Invoice status</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              stroke="none"
            >
              {data.map(d => (
                <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
        {data.map(d => (
          <span key={d.name} className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  )
}