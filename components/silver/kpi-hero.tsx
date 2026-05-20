import { Card } from '@/components/silver/card'
import { SilverText } from '@/components/silver/silver-text'
import { formatMoney } from '@/lib/silver/format'

interface SparkBar {
  height: number // 0–100
  active?: boolean
}

interface KpiHeroProps {
  label: string
  value: number
  indicatorVariant?: 'bright' | 'dim' | 'profit' | 'loss'
  valueVariant?: 'default' | 'bright'
  subtitle?: string
  delta?: { amount: number; label: string } | null
  sparkBars?: SparkBar[]
  large?: boolean
}

export function KpiHero({
  label,
  value,
  indicatorVariant = 'bright',
  valueVariant = 'default',
  subtitle,
  delta,
  sparkBars,
  large = false,
}: KpiHeroProps) {
  return (
    <Card className="px-[26px] py-[24px]">
      {/* Label row */}
      <div className="mb-[18px] flex items-center gap-2.5">
        <span
          className="block size-[6px] shrink-0 rounded-full"
          style={
            indicatorVariant === 'profit'
              ? { background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.6)' }
              : indicatorVariant === 'loss'
              ? { background: '#f87171', boxShadow: '0 0 8px rgba(248,113,113,0.6)' }
              : indicatorVariant === 'bright'
              ? { background: 'var(--text)', boxShadow: '0 0 8px var(--glow-bright)' }
              : { background: 'var(--silver-dim)', boxShadow: '0 0 6px rgba(161,161,170,0.3)' }
          }
        />
        <span
          className="font-space text-[11px] font-medium uppercase text-[var(--text-mute)]"
          style={{ letterSpacing: '0.1em' }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div
        className={`font-space font-medium tabular leading-none ${large ? 'text-[62px]' : 'text-[44px]'}`}
        style={{ letterSpacing: large ? '-0.04em' : '-0.035em', marginBottom: 10 }}
      >
        {valueVariant === 'bright' ? (
          <SilverText variant="bright">
            <span
              className="font-normal"
              style={{
                fontSize: large ? 36 : 26,
                verticalAlign: '0.22em',
                marginRight: large ? 2 : 1,
                opacity: valueVariant === 'bright' ? 1 : 0.55,
              }}
            >
              $
            </span>
            {formatMoney(value)}
          </SilverText>
        ) : (
          <SilverText>
            <span
              className="font-normal"
              style={{
                fontSize: large ? 36 : 26,
                verticalAlign: '0.22em',
                marginRight: large ? 2 : 1,
                opacity: large ? 0.55 : 1,
                color: large ? undefined : 'var(--text-mute)',
              }}
            >
              $
            </span>
            {formatMoney(value)}
          </SilverText>
        )}
      </div>

      {/* Delta badge */}
      {delta != null && (
        <div
          className="mb-2 inline-flex items-center gap-1.5 font-space text-[11px] font-medium text-[var(--text)]"
          style={{
            padding: '4px 10px 4px 8px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 100,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          +${formatMoney(delta.amount)} {delta.label}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className="mt-2 text-[12px] font-normal text-[var(--text-mute)]">{subtitle}</div>
      )}

      {/* Sparkline bars */}
      {sparkBars && (
        <div className="mt-[18px] flex h-9 items-end gap-1">
          {sparkBars.map((bar, i) => (
            <div
              key={i}
              className="flex-1 rounded-[4px]"
              style={{
                height: `${bar.height}%`,
                background: bar.active
                  ? 'linear-gradient(180deg, #ffffff, rgba(255,255,255,0.25))'
                  : 'rgba(255,255,255,0.06)',
                boxShadow: bar.active ? '0 0 16px var(--glow-soft)' : undefined,
              }}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
