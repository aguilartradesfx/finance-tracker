'use client'

import { useMemo, useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/silver/card'
import {
  calculateTotalCost,
  calculateRequiredMRR,
  calculateGap,
  calculateHireStatus,
} from '@/lib/silver/calculations'
import { formatMoney } from '@/lib/silver/format'
import type { HireType } from '@/lib/silver/types'
import Link from 'next/link'

const HIRE_TYPES: { key: HireType; label: string }[] = [
  { key: 'payroll', label: 'Planilla' },
  { key: 'services', label: 'Servicios prof.' },
  { key: 'contractor', label: 'Contractor' },
]

const COST_NOTES: Record<HireType, string> = {
  payroll: 'Incluye CCSS 26.67% + aguinaldo + vacaciones + cesantía',
  services: 'Sin cargas sociales — factura profesional',
  contractor: 'Sin cargas sociales — contrato por servicios',
}

interface HireCalculatorProps {
  currentMRR: number
  currentExpenses: number
  avgTicket: number
}

export function HireCalculator({ currentMRR, currentExpenses, avgTicket }: HireCalculatorProps) {
  const [salary, setSalary] = useState(1000)
  const [hireType, setHireType] = useState<HireType>('payroll')

  const { totalCost, gap, status, clientsNeeded } = useMemo(() => {
    const totalCost = calculateTotalCost(salary, hireType)
    const requiredMRR = calculateRequiredMRR(currentExpenses, totalCost, 0.3)
    const gap = calculateGap(requiredMRR, currentMRR)
    const status = calculateHireStatus(gap)
    const clientsNeeded = avgTicket > 0 ? Math.ceil(gap / avgTicket) : 0
    return { totalCost, gap, status, clientsNeeded }
  }, [salary, hireType, currentMRR, currentExpenses, avgTicket])

  const statusLabel = status === 'ready' ? 'Listo' : status === 'close' ? 'Casi' : 'Aún no'
  const isAlert = status !== 'ready'

  return (
    <Card className="mb-5">
      <CardHeader title="¿Es momento de contratar?" dot="solid" meta="Calculadora · Costa Rica 2026" />
      <CardBody>
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: '1.2fr 1fr' }}
        >
          {/* Controls */}
          <div style={{ paddingRight: 32, borderRight: '1px solid var(--border)' }}>
            {/* Salary slider */}
            <div className="mb-6">
              <div className="mb-[14px] flex items-baseline justify-between">
                <span
                  className="font-space text-[11px] font-medium uppercase text-[var(--text-mute)]"
                  style={{ letterSpacing: '0.08em' }}
                >
                  Sueldo base mensual
                </span>
                <span
                  className="font-space text-[28px] font-semibold tabular text-[var(--text)]"
                  style={{ letterSpacing: '-0.025em', textShadow: '0 0 24px var(--glow-soft)' }}
                >
                  ${formatMoney(salary)}
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={2500}
                step={50}
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full cursor-pointer appearance-none rounded-full outline-none"
                style={{
                  height: 6,
                  background: `linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) ${((salary - 400) / 2100) * 100}%, rgba(255,255,255,0.06) ${((salary - 400) / 2100) * 100}%, rgba(255,255,255,0.06) 100%)`,
                }}
              />
            </div>

            {/* Hire type */}
            <div className="mb-3">
              <span
                className="block font-space text-[11px] font-medium uppercase text-[var(--text-mute)]"
                style={{ letterSpacing: '0.08em', marginBottom: 8 }}
              >
                Tipo de contratación
              </span>
              <div
                className="flex gap-1 rounded-xl p-1"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {HIRE_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setHireType(t.key)}
                    className="flex-1 rounded-lg py-[9px] text-center text-[12px] font-medium transition-all"
                    style={
                      hireType === t.key
                        ? {
                            background: 'rgba(255,255,255,0.10)',
                            color: 'var(--text)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.25)',
                          }
                        : { color: 'var(--text-mute)' }
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost breakdown */}
            <div
              className="mt-[18px] rounded-xl text-[12px] text-[var(--text-mute)]"
              style={{
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              Costo total cargado ·{' '}
              <span className="font-space text-[14px] font-semibold text-[var(--text)]">
                ${formatMoney(totalCost)} / mes
              </span>
              <br />
              <span style={{ opacity: 0.7 }}>{COST_NOTES[hireType]}</span>
            </div>
          </div>

          {/* Verdict */}
          <div className="flex flex-col justify-center">
            {/* Status badge */}
            <div
              className="mb-[18px] inline-flex w-fit items-center gap-2 font-space text-[11px] font-medium uppercase text-[var(--text)]"
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: isAlert ? '1px dashed rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: 100,
                letterSpacing: '0.08em',
              }}
            >
              {isAlert && (
                <span
                  className="animate-silver-pulse block size-[5px] rounded-full"
                  style={{ background: 'var(--text)', boxShadow: '0 0 6px var(--glow-bright)' }}
                />
              )}
              {statusLabel}
            </div>

            {/* Headline */}
            <h3
              className="mb-[14px] font-space font-medium leading-[1.1] text-[var(--text)]"
              style={{ fontSize: 30, letterSpacing: '-0.03em' }}
            >
              {status === 'ready' ? (
                <>¡Podés contratar y mantener el margen del 30%.</>
              ) : (
                <>
                  Faltan{' '}
                  <span
                    className="font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 40%, #71717a 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ${formatMoney(gap)}
                  </span>{' '}
                  en MRR para mantener el margen del 30%.
                </>
              )}
            </h3>

            {/* Body */}
            <p className="mb-4 text-[13px] leading-[1.6] text-[var(--text-soft)]">
              {status === 'ready' ? (
                <>
                  Con el MRR actual de{' '}
                  <strong className="font-semibold text-[var(--text)]">${formatMoney(currentMRR)}</strong>{' '}
                  cubrís el costo de{' '}
                  <strong className="font-semibold text-[var(--text)]">${formatMoney(totalCost)}/mes</strong>{' '}
                  y mantenés el margen objetivo.
                </>
              ) : (
                <>
                  Eso equivale a{' '}
                  <strong className="font-semibold text-[var(--text)]">
                    {clientsNeeded} cliente{clientsNeeded !== 1 ? 's' : ''} nuevo{clientsNeeded !== 1 ? 's' : ''}
                  </strong>{' '}
                  al ticket promedio actual. Bajo servicios profesionales el umbral baja a{' '}
                  <strong className="font-semibold text-[var(--text)]">
                    ${formatMoney(calculateGap(calculateRequiredMRR(currentExpenses, salary, 0.3), currentMRR))}
                  </strong>
                  .
                </>
              )}
            </p>

            {/* Actions */}
            <div className="flex gap-2.5">
              <Link
                href="/contratacion"
                className="rounded-[10px] px-3.5 py-2 text-[12px] font-medium text-[var(--text-soft)] transition-all hover:bg-white/[0.08] hover:text-[var(--text)]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
              >
                Ver escenarios
              </Link>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
