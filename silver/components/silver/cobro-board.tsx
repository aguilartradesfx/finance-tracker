'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/silver/format'
import { markClientPaidAction, unmarkClientPaidAction } from '@/lib/silver/actions'
import { Card, CardHeader, CardBody } from './card'
import type { Client, MonthlyPayment } from '@/lib/silver/types'

const TIER_LABELS: Record<string, string> = {
  anchor: 'Anchor',
  high: 'High',
  mid: 'Mid',
  entry: 'Entry',
  custom: 'Custom',
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function currentMonthLabel(): string {
  const d = new Date()
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

function formatPaidAt(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
}

interface CobroBoardProps {
  clients: Client[]
  payments: MonthlyPayment[]
  month: string
  tableExists: boolean
}

export function CobroBoard({ clients, payments, month, tableExists }: CobroBoardProps) {
  const [isPending, startTransition] = useTransition()

  const paymentMap = new Map(payments.map((p) => [p.client_id, p]))
  const paid = clients.filter((c) => paymentMap.has(c.id))
  const pending = clients.filter((c) => !paymentMap.has(c.id))

  const expectedTotal = clients.reduce((s, c) => s + c.monthly_amount, 0)
  const collectedTotal = paid.reduce((s, c) => {
    const p = paymentMap.get(c.id)
    return s + (p?.amount ?? c.monthly_amount)
  }, 0)
  const pendingTotal = expectedTotal - collectedTotal
  const progress = expectedTotal > 0 ? (collectedTotal / expectedTotal) * 100 : 0

  const handleMarkPaid = (client: Client) => {
    startTransition(async () => {
      try {
        await markClientPaidAction(client.id, month, client.monthly_amount)
        toast.success(`${client.name} marcado como pagado`)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al registrar pago')
      }
    })
  }

  const handleUnmark = (client: Client) => {
    startTransition(async () => {
      try {
        await unmarkClientPaidAction(client.id, month)
        toast.success(`${client.name} revertido a pendiente`)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al revertir')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Summary row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <MetricCard
          label="Esperado"
          value={`$${formatMoney(expectedTotal)}`}
          sub={`${clients.length} clientes activos · ${currentMonthLabel()}`}
          dim
        />
        <MetricCard
          label="Cobrado"
          value={`$${formatMoney(collectedTotal)}`}
          sub={`${paid.length} pagos confirmados`}
          bright={collectedTotal > 0}
        />
        <MetricCard
          label="Pendiente"
          value={`$${formatMoney(pendingTotal)}`}
          sub={`${pending.length} sin confirmar`}
          dim={pendingTotal === 0}
        />
      </div>

      {/* ── Progress bar ─── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 20,
          padding: '20px 24px',
          background: 'var(--glass)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lifted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-mute)' }}>
            Progreso de cobros
          </span>
          <span style={{ fontFamily: 'var(--font-space)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {progress.toFixed(0)}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            overflow: 'hidden',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 999,
              transition: 'width 0.7s ease',
              width: `${Math.min(progress, 100)}%`,
              background: progress >= 100
                ? 'linear-gradient(90deg, #ffffff, #a1a1aa)'
                : 'linear-gradient(90deg, rgba(255,255,255,0.75), rgba(255,255,255,0.3))',
              boxShadow: progress > 0 ? '0 0 12px var(--glow-soft)' : 'none',
            }}
          />
        </div>
        {!tableExists && (
          <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-faint)' }}>
            Los cobros se guardarán cuando la tabla esté creada en Supabase.
          </p>
        )}
      </div>

      {/* ── Kanban ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Pendiente */}
        <Card>
          <CardHeader
            title="Pendiente"
            dot="ring"
            meta={`${pending.length} ${pending.length === 1 ? 'cliente' : 'clientes'}`}
          />
          <CardBody className="pt-0">
            {pending.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-[var(--text-mute)]">
                Todos los clientes han pagado este mes 🎉
              </div>
            ) : (
              pending.map((client) => (
                <CobroRow
                  key={client.id}
                  client={client}
                  status="pending"
                  onMarkPaid={() => handleMarkPaid(client)}
                  isPending={isPending}
                  tableExists={tableExists}
                />
              ))
            )}
          </CardBody>
        </Card>

        {/* Pagado */}
        <Card>
          <CardHeader
            title="Pagado"
            dot="solid"
            meta={`${paid.length} ${paid.length === 1 ? 'cliente' : 'clientes'}`}
          />
          <CardBody className="pt-0">
            {paid.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-[var(--text-mute)]">
                Aún no hay pagos confirmados este mes
              </div>
            ) : (
              paid.map((client) => (
                <CobroRow
                  key={client.id}
                  client={client}
                  status="paid"
                  payment={paymentMap.get(client.id)}
                  onUnmark={() => handleUnmark(client)}
                  isPending={isPending}
                  tableExists={tableExists}
                />
              ))
            )}
          </CardBody>
        </Card>

      </div>
    </div>
  )
}

// ── MetricCard ────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  bright,
  dim,
}: {
  label: string
  value: string
  sub: string
  bright?: boolean
  dim?: boolean
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 20,
        padding: 20,
        background: 'var(--glass)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lifted)',
      }}
    >
      <div
        aria-hidden
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 64,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
          borderRadius: '20px 20px 0 0',
        }}
      />
      <div style={{ fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-mute)', marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-space)',
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '-0.025em',
          color: dim ? 'var(--text-soft)' : 'var(--text)',
          opacity: dim ? 0.5 : 1,
          ...(bright
            ? {
                background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: 1,
              }
            : {}),
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-faint)' }}>{sub}</div>
    </div>
  )
}

// ── CobroRow ──────────────────────────────────────────

interface CobroRowProps {
  client: Client
  status: 'pending' | 'paid'
  payment?: MonthlyPayment
  onMarkPaid?: () => void
  onUnmark?: () => void
  isPending: boolean
  tableExists: boolean
}

function CobroRow({
  client,
  status,
  payment,
  onMarkPaid,
  onUnmark,
  isPending,
  tableExists,
}: CobroRowProps) {
  const [confirm, setConfirm] = useState(false)
  const isAnchor = client.tier === 'anchor'

  return (
    <div
      className="flex items-center gap-3 border-b py-[13px] last:border-b-0 hover:bg-white/[0.02] transition-colors"
      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-[var(--text)] truncate">
            {client.name}
          </span>
          {isAnchor && (
            <span
              className="shrink-0 inline-block size-[5px] rounded-full"
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
          {status === 'paid' && payment?.paid_at && (
            <span className="text-[11px] text-[var(--text-faint)]">
              {formatPaidAt(payment.paid_at)}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <span className="shrink-0 font-space text-[14px] font-semibold tabular text-[var(--text)]">
        ${formatMoney(client.monthly_amount)}
      </span>

      {/* Action */}
      <div className="shrink-0">
        {status === 'pending' && (
          confirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirm(false)}
                className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-mute)] transition-colors hover:bg-white/[0.06]"
              >
                No
              </button>
              <button
                onClick={() => { setConfirm(false); onMarkPaid?.() }}
                disabled={isPending || !tableExists}
                className="rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all disabled:opacity-40"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'var(--text)',
                }}
              >
                Sí, pagó ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              disabled={isPending}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all disabled:opacity-40"
              style={{
                background: 'rgba(251,191,36,0.08)',
                border: '1px dashed rgba(251,191,36,0.4)',
                color: 'rgba(251,191,36,0.9)',
              }}
            >
              ¿Ya pagó?
            </button>
          )
        )}

        {status === 'paid' && (
          <button
            onClick={onUnmark}
            disabled={isPending}
            className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-faint)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-mute)] disabled:opacity-40"
          >
            ✓ pagado
          </button>
        )}
      </div>
    </div>
  )
}
