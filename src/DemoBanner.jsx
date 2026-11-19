import { Sparkles } from 'lucide-react'
import { ETSY_URL } from './links'

export default function DemoBanner({ unlocked, total }) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm text-white"
      style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-2))' }}
    >
      <Sparkles size={16} />
      <span className="font-medium">
        Free demo · {unlocked} of {total} sections unlocked · Sample data resets when you close this page
      </span>
      <a
        href={ETSY_URL}
        target="_blank"
        rel="noreferrer"
        className="ml-auto rounded-lg bg-white px-3 py-1.5 font-semibold"
        style={{ color: '#0F1A22' }}
      >
        Get the full version →
      </a>
    </div>
  )
}