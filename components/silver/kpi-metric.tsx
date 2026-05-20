import { Card } from '@/components/silver/card'
import { formatMoney, formatPercent } from '@/lib/silver/format'

interface PillProps {
  label: string
  alert?: boolean
}

function Pill({ label, alert }: PillProps) {
  if (alert) {
    return (
      <span
        className="flex shrink-0 items-center gap-[5px] font-space text-[10px] font-medium text-[var(--text)]"
        style={{
          padding: '2px 8px 2px 6px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px dashed rgba(255,255,255,0.25)',
          borderRadius: 100,
        }}
      >
        <span
          className="animate-silver-pulse block size-1 rounded-full"
          style={{ background: 'var(--text)', boxShadow: '0 0 6px var(--glow-bright)' }}
        />
        {label}
      </span>
    )
  }
  return (
    <span
      className="shrink-0 font-space text-[10px] font-medium text-[var(--text-faint)]"
      style={{
        padding: '2px 8px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 100,
      }}
    >
      {label}
    </span>
  )
}

interface KpiMetricProps {
  label: string
  value: number | string
  pill?: string
  alertPill?: string
  subtitle?: string
  alertSubtitle?: string
  isAlert?: boolean
}

export function KpiMetric({
  label,
  value,
  pill,
  alertPill,
  subtitle,
  alertSubtitle,
  isAlert = false,
}: KpiMetricProps) {
  return (
    <Card className="px-5 py-[18px]">
      {/* Label row */}
      <div className="mb-[14px] flex items-center justify-between gap-2">
        <span className="font-space text-[11px] font-medium text-[var(--text-mute)]">{label}</span>
        {alertPill && <Pill label={alertPill} alert />}
        {pill && !alertPill && <Pill label={pill} />}
      </div>

      {/* Value */}
      <div
        className="font-space text-[32px] font-medium leading-none tabular"
        style={{
          letterSpacing: '-0.03em',
          ...(isAlert
            ? {
                background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }
            : { color: 'var(--text)' }),
        }}
      >
        {value}
      </div>

      {/* Subtitle */}
      {alertSubtitle && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--text-soft)]">
          <span
            className="animate-silver-pulse block size-[7px] rounded-full"
            style={{ background: 'var(--text)', boxShadow: '0 0 8px var(--glow-bright)' }}
          />
          {alertSubtitle}
        </div>
      )}
      {subtitle && !alertSubtitle && (
        <div className="mt-2 text-[11px] text-[var(--text-mute)]">{subtitle}</div>
      )}
    </Card>
  )
}
