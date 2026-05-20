'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatMoney } from '@/lib/silver/format'
import { deleteClientAction } from '@/lib/silver/actions'
import { ClientSheet } from './client-sheet'
import { Card, CardHeader, CardBody } from './card'
import type { Client } from '@/lib/silver/types'

const TIER_LABELS: Record<string, string> = {
  anchor: 'Anchor',
  high: 'High',
  mid: 'Mid',
  entry: 'Entry',
  custom: 'Custom',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  paused: 'Pausado',
  churned: 'Churned',
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface ClientDetailViewProps {
  client: Client
  totalMRR: number
}

export function ClientDetailView({ client, totalMRR }: ClientDetailViewProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()

  const pct = totalMRR > 0 ? ((client.monthly_amount / totalMRR) * 100).toFixed(1) : '0'
  const days = daysSince(client.start_date)
  const isAnchor = client.tier === 'anchor'

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteClientAction(client.id)
        toast.success('Cliente eliminado')
        router.push('/clientes')
        router.refresh()
      } catch {
        toast.error('Error al eliminar')
      }
    })
  }

  return (
    <>
      <ClientSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
      />

      {/* Back + actions bar */}
      <div className="mb-1 flex items-center justify-between">
        <Link
          href="/clientes"
          className="flex items-center gap-1.5 text-[13px] text-[var(--text-mute)] transition-colors hover:text-[var(--text)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Clientes
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-medium text-[var(--text)] transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            Editar cliente
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl px-3 py-2 text-[13px] text-[var(--text-mute)] transition-colors hover:bg-white/[0.06]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-xl px-3 py-2 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                style={{ border: '1px solid rgba(239,68,68,0.3)' }}
              >
                {isPending ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-xl px-3 py-2 text-[13px] text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Client header */}
      <div className="mb-2">
        <div className="flex items-center gap-3">
          <h1
            className="font-space text-[26px] font-semibold text-[var(--text)]"
            style={{ letterSpacing: '-0.025em' }}
          >
            {client.name}
          </h1>
          {isAnchor && (
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: 'var(--text)', boxShadow: '0 0 10px var(--glow-bright)' }}
            />
          )}
        </div>
        {client.category && (
          <p className="mt-1 text-[14px] text-[var(--text-mute)]">{client.category}</p>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Mensual',
            value: `$${formatMoney(client.monthly_amount)}`,
            sub: `${pct}% del MRR`,
          },
          {
            label: 'Tier',
            value: TIER_LABELS[client.tier] ?? client.tier,
            sub: 'Segmento',
          },
          {
            label: 'Estado',
            value: STATUS_LABELS[client.status] ?? client.status,
            sub: client.status === 'active' ? 'Sin churn' : '—',
          },
          {
            label: 'Antigüedad',
            value: `${days}d`,
            sub: `Desde ${formatDate(client.start_date)}`,
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lifted)',
            }}
          >
            <div className="font-space text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-mute)] mb-2">
              {label}
            </div>
            <div
              className="font-space text-[22px] font-semibold text-[var(--text)]"
              style={{ letterSpacing: '-0.02em' }}
            >
              {value}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-faint)]">{sub}</div>
          </div>
        ))}
      </div>

      {/* Details card */}
      <Card>
        <CardHeader title="Detalles" dot="dim" />
        <CardBody>
          <div className="flex flex-col gap-0">
            {[
              { label: 'Nombre', value: client.name },
              { label: 'Monto mensual', value: `$${formatMoney(client.monthly_amount)}` },
              { label: 'Tier', value: TIER_LABELS[client.tier] ?? client.tier },
              { label: 'Estado', value: STATUS_LABELS[client.status] ?? client.status },
              { label: 'Categoría', value: client.category ?? '—' },
              { label: 'Fecha de inicio', value: formatDate(client.start_date) },
              ...(client.churn_date
                ? [{ label: 'Fecha de churn', value: formatDate(client.churn_date) }]
                : []),
              { label: 'ID interno', value: client.id },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-start justify-between border-b py-[14px] last:border-b-0"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-[13px] text-[var(--text-mute)]">{label}</span>
                <span className="font-space text-[13px] font-medium text-[var(--text)] text-right max-w-[60%] break-all">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Notes */}
      {client.notes && (
        <Card>
          <CardHeader title="Notas" dot="dim" />
          <CardBody>
            <p className="text-[13px] leading-relaxed text-[var(--text-soft)]">{client.notes}</p>
          </CardBody>
        </Card>
      )}
    </>
  )
}
