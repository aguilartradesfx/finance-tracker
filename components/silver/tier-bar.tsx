import Link from 'next/link'
import { formatMoney } from '@/lib/silver/format'
import type { TierBreakdown } from '@/lib/silver/types'

const TIER_LABELS: Record<string, string> = {
  anchor: 'Anchor',
  high: 'High',
  mid: 'Mid',
  entry: 'Entry',
  custom: 'Custom',
}

const TIER_FILL: Record<string, React.CSSProperties> = {
  anchor: {
    background: 'linear-gradient(90deg, #ffffff, #a1a1aa)',
    boxShadow: '0 0 14px var(--glow-soft)',
  },
  high: { background: 'linear-gradient(90deg, #d4d4d8, #71717a)' },
  mid: { background: 'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.2))' },
  entry: { background: 'rgba(255,255,255,0.2)' },
  custom: { background: 'rgba(255,255,255,0.15)' },
}

interface TierBarProps {
  breakdown: TierBreakdown
}

export function TierBar({ breakdown }: TierBarProps) {
  const { tier, count, total, percentage } = breakdown

  return (
    <Link
      href={`/clientes?tier=${tier}`}
      className="mb-[18px] block last:mb-1 transition-opacity hover:opacity-80"
      style={{ textDecoration: 'none' }}
    >
      {/* Header */}
      <div className="mb-2 flex items-baseline justify-between">
        <div className="text-[13px] font-medium text-[var(--text)]">
          {TIER_LABELS[tier] ?? tier}
          <span className="ml-1.5 font-normal text-[var(--text-mute)]">
            {count} {count === 1 ? 'cliente' : 'clientes'}
          </span>
        </div>
        <div className="font-space text-[14px] font-semibold tabular text-[var(--text)]">
          ${formatMoney(total)}
          <span className="ml-1.5 font-normal text-[11px] text-[var(--text-mute)]">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%`, ...TIER_FILL[tier] }}
        />
      </div>
    </Link>
  )
}
