import { Card, CardHeader, CardBody } from './card'
import { formatMoney } from '@/lib/silver/format'
import type { Client } from '@/lib/silver/types'

const TIER_LABELS: Record<string, string> = {
  anchor: 'Anchor',
  high: 'High',
  mid: 'Mid',
  entry: 'Entry',
  custom: 'Custom',
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatStartDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface UpcomingClientsProps {
  clients: Client[]
}

export function UpcomingClients({ clients }: UpcomingClientsProps) {
  if (clients.length === 0) return null

  const sorted = [...clients].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )
  const committedMRR = sorted.reduce((sum, c) => sum + c.monthly_amount, 0)

  return (
    <Card>
      <CardHeader
        title="Próximos clientes"
        dot="ring"
        meta={`${clients.length} · $${formatMoney(committedMRR)} MRR comprometido`}
      />
      <CardBody className="pt-0">
        {sorted.map((client) => {
          const days = daysUntil(client.start_date)
          const isAnchor = client.tier === 'anchor'
          return (
            <div
              key={client.id}
              className="flex items-center gap-3 border-b py-[13px] last:border-b-0"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-medium text-[var(--text)]">
                    {client.name}
                  </span>
                  {isAnchor && (
                    <span
                      className="inline-block size-[5px] shrink-0 rounded-full"
                      style={{ background: 'var(--text)', boxShadow: '0 0 8px var(--glow-bright)' }}
                    />
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className="font-space text-[10px] font-medium uppercase text-[var(--text-soft)]"
                    style={{
                      letterSpacing: '0.07em',
                      padding: '2px 6px',
                      borderRadius: 100,
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    {TIER_LABELS[client.tier] ?? client.tier}
                  </span>
                  <span className="text-[11px] text-[var(--text-faint)]">
                    {days <= 0
                      ? 'Inicia hoy'
                      : days === 1
                      ? 'Inicia mañana'
                      : `Inicia en ${days} días · ${formatStartDate(client.start_date)}`}
                  </span>
                </div>
              </div>

              <span className="shrink-0 font-space text-[14px] font-semibold tabular text-[var(--text-soft)]">
                ${formatMoney(client.monthly_amount)}
              </span>

              <div className="shrink-0">
                <span
                  className="font-space text-[10px] font-medium uppercase"
                  style={{
                    letterSpacing: '0.07em',
                    padding: '4px 10px',
                    borderRadius: 100,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px dashed rgba(255,255,255,0.12)',
                    color: 'var(--text-faint)',
                  }}
                >
                  Próximo
                </span>
              </div>
            </div>
          )
        })}
      </CardBody>
    </Card>
  )
}
