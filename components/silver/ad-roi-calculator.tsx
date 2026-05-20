'use client'

import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/silver/card'
import { calculateAdROI } from '@/lib/silver/calculations'
import { formatMoney } from '@/lib/silver/format'

interface AdRoiCalculatorProps {
  defaultAvgTicket?: number
}

export function AdRoiCalculator({ defaultAvgTicket = 296 }: AdRoiCalculatorProps) {
  const [budget, setBudget] = useState(450)
  const [cpl, setCpl] = useState(30)
  const [closeRate, setCloseRate] = useState(10)
  const [retention, setRetention] = useState(12)

  const result = calculateAdROI({
    budget,
    cpl,
    closeRate,
    avgTicket: defaultAvgTicket,
    retentionMonths: retention,
  })

  const INPUTS = [
    { label: 'Presupuesto / mes', value: budget, setValue: setBudget, prefix: '$', step: 50 },
    { label: 'CPL esperado', value: cpl, setValue: setCpl, prefix: '$', step: 5 },
    { label: 'Tasa de cierre', value: closeRate, setValue: setCloseRate, suffix: '%', step: 1 },
    { label: 'Retención (meses)', value: retention, setValue: setRetention, step: 1 },
  ]

  const OUTPUTS = [
    { label: 'Leads', value: `${result.leads}` },
    { label: 'Clientes', value: `${result.clients}` },
    { label: 'CAC', value: `$${formatMoney(result.cac)}` },
    { label: 'LTV', value: `$${formatMoney(result.ltv)}` },
    { label: 'LTV / CAC', value: `${result.ltvCacRatio}×`, highlight: true },
    { label: 'Payback', value: `${result.paybackMonths} m` },
  ]

  return (
    <Card>
      <CardHeader title="Simulador de anuncios" dot="solid" meta="Meta Ads · escenario base" />
      <CardBody>
        {/* Inputs */}
        <div className="mb-[18px] grid grid-cols-4 gap-3">
          {INPUTS.map((inp) => (
            <div
              key={inp.label}
              className="rounded-xl transition-all"
              style={{
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <label className="mb-1.5 block font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">
                {inp.label}
              </label>
              <div className="flex items-baseline gap-0.5 font-space text-lg font-semibold text-[var(--text)]">
                {inp.prefix && <span className="text-sm text-[var(--text-mute)]">{inp.prefix}</span>}
                <input
                  type="number"
                  value={inp.value}
                  onChange={(e) => inp.setValue(Number(e.target.value))}
                  step={inp.step}
                  min={0}
                  className="w-full bg-transparent tabular outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                />
                {inp.suffix && <span className="text-sm text-[var(--text-mute)]">{inp.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Outputs */}
        <div className="grid grid-cols-6 gap-2.5">
          {OUTPUTS.map((out) => (
            <div
              key={out.label}
              className="rounded-xl"
              style={{
                padding: 14,
                ...(out.highlight
                  ? {
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                      border: '1px solid rgba(255,255,255,0.22)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 0 24px -8px var(--glow-bright)',
                    }
                  : {
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }),
              }}
            >
              <div
                className="mb-2 font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]"
              >
                {out.label}
              </div>
              <div
                className="font-space text-[20px] font-semibold tabular"
                style={{
                  letterSpacing: '-0.02em',
                  ...(out.highlight
                    ? {
                        background: 'linear-gradient(135deg, #ffffff, #d4d4d8)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }
                    : { color: 'var(--text)' }),
                }}
              >
                {out.value}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
