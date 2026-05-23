import Link from 'next/link'
import { formatMoney } from '@/lib/silver/format'
import type { Client } from '@/lib/silver/types'

function clientTenureLabel(dateStr: string): string {
  const start = new Date(dateStr)
  start.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (diff >= 0) return `${diff} días activo`
  const days = -diff
  if (days === 1) return 'Inicia mañana'
  return `Inicia en ${days} días`
}

interface ClientRowProps {
  client: Client
  rank: number
  totalMRR: number
}

const TIER_LABELS: Record<string, string> = {
  anchor: 'Anchor',
  high: 'High',
  mid: 'Mid',
  entry: 'Entry',
  custom: 'Custom',
}

export function ClientRow({ client, rank, totalMRR }: ClientRowProps) {
  const isAnchor = client.tier === 'anchor'
  const pct = totalMRR > 0 ? ((client.monthly_amount / totalMRR) * 100).toFixed(1) : '0'
  const tenure = clientTenureLabel(client.start_date)

  return (
    <Link
      href={`/clientes/${client.id}`}
      className="grid items-center border-b py-[13px] transition-colors last:border-b-0 hover:bg-white/[0.03]"
      style={{
        gridTemplateColumns: '22px 1fr 70px 100px',
        gap: 14,
        borderColor: 'rgba(255,255,255,0.04)',
        textDecoration: 'none',
        display: 'grid',
      }}
    >
      {/* Rank */}
      <span className="font-space text-[11px] font-medium tabular text-[var(--text-faint)]">
        {String(rank).padStart(2, '0')}
      </span>

      {/* Info */}
      <div>
        <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--text)]">
          {client.name}
          {isAnchor && (
            <span
              className="inline-block size-[6px] rounded-full"
              style={{ background: 'var(--text)', boxShadow: '0 0 8px var(--glow-bright)' }}
            />
          )}
        </div>
        <div className="mt-0.5 text-[11px] font-normal text-[var(--text-mute)]">
          {tenure}{client.category ? ` · ${client.category}` : ''}
        </div>
      </div>

      {/* Tier badge */}
      <span
        className="text-center font-space text-[10px] font-medium uppercase"
        style={{
          letterSpacing: '0.08em',
          padding: '3px 8px',
          borderRadius: 100,
          ...(isAnchor
            ? {
                color: 'var(--text)',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.2)',
              }
            : {
                color: 'var(--text-soft)',
                background: 'rgba(255,255,255,0.05)',
              }),
        }}
      >
        {TIER_LABELS[client.tier] ?? client.tier}
      </span>

      {/* Amount */}
      <div className="text-right font-space text-[16px] font-semibold tabular text-[var(--text)]">
        ${formatMoney(client.monthly_amount)}
        <span className="mt-px block font-space text-[10px] font-normal text-[var(--text-mute)]">
          {pct}%
        </span>
      </div>
    </Link>
  )
}
