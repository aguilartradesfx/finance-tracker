'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/silver/format'
import { deleteClientAction } from '@/lib/silver/actions'
import { ClientSheet } from './client-sheet'
import type { Client, ClientTier, ClientStatus, MonthlyPayment } from '@/lib/silver/types'

const TIER_LABELS: Record<ClientTier, string> = {
  anchor: 'Anchor',
  high: 'High',
  mid: 'Mid',
  entry: 'Entry',
  custom: 'Custom',
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Activo',
  paused: 'Pausado',
  churned: 'Churned',
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function activeMRR(clients: Client[]) {
  return clients.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.monthly_amount, 0)
}

function formatPaymentDate(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })
}

interface ClientesViewProps {
  clients: Client[]
  initialTier?: ClientTier | 'all'
  payments?: MonthlyPayment[]
}

export function ClientesView({ clients, initialTier = 'all', payments = [] }: ClientesViewProps) {
  const totalMRR = activeMRR(clients)
  const paymentMap = new Map(payments.map((p) => [p.client_id, p]))

  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<ClientTier | 'all'>(initialTier)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = clients
    .filter((c) => statusFilter === 'all' || c.status === statusFilter)
    .filter((c) => tierFilter === 'all' || c.tier === tierFilter)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  const statusCounts = {
    all: clients.length,
    active: clients.filter((c) => c.status === 'active').length,
    paused: clients.filter((c) => c.status === 'paused').length,
    churned: clients.filter((c) => c.status === 'churned').length,
  }

  const openEdit = (client: Client) => {
    setEditingClient(client)
    setSheetOpen(true)
  }

  const openNew = () => {
    setEditingClient(undefined)
    setSheetOpen(true)
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteClientAction(id)
        toast.success('Cliente eliminado')
        setDeletingId(null)
      } catch {
        toast.error('Error al eliminar')
      }
    })
  }

  return (
    <>
      <ClientSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        client={editingClient}
      />

      {/* Page header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1
            className="font-space text-[22px] font-semibold text-[var(--text)]"
            style={{ letterSpacing: '-0.02em' }}
          >
            Clientes
          </h1>
          <p className="mt-0.5 text-[13px] text-[var(--text-mute)]">
            {clients.length} totales · MRR activo{' '}
            <span className="font-space font-semibold text-[var(--text)]">
              ${formatMoney(totalMRR)}
            </span>
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-medium text-[var(--text)] transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          Nuevo cliente
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        {/* Status tabs */}
        <div
          className="flex gap-0.5 rounded-xl p-1"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {(['all', 'active', 'paused', 'churned'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="rounded-lg px-3 py-[6px] text-[12px] font-medium transition-all"
              style={
                statusFilter === s
                  ? { background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }
                  : { color: 'var(--text-mute)' }
              }
            >
              {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
              <span className="ml-1.5 font-space text-[10px] text-[var(--text-faint)]">
                {statusCounts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Tier filter */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as ClientTier | 'all')}
          className="rounded-xl px-3 py-[7px] text-[12px] font-medium transition-all"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'var(--text-mute)',
            outline: 'none',
          }}
        >
          <option value="all">Todos los tiers</option>
          <option value="anchor">Anchor</option>
          <option value="high">High</option>
          <option value="mid">Mid</option>
          <option value="entry">Entry</option>
          <option value="custom">Custom</option>
        </select>

        {/* Search */}
        <div
          className="flex flex-1 min-w-[160px] items-center gap-2 rounded-xl px-3 py-[7px]"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--text-mute)', flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 bg-transparent text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
          />
        </div>
      </div>

      {/* Table */}
      <style>{`
        @media (max-width: 767px) {
          .cl-hdr, .cl-row { grid-template-columns: 1fr 110px 110px !important; }
          .cl-hide { display: none !important; }
          .cl-scroll { overflow-x: hidden !important; }
          .cl-inner { min-width: unset !important; }
        }
      `}</style>
      <div
        className="relative overflow-hidden"
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-lifted)',
        }}
      >
      <div className="cl-scroll overflow-x-auto" style={{ scrollbarWidth: 'none' }}><div className="cl-inner" style={{ minWidth: 680 }}>
        {/* Top highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{
            height: 80,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
            borderRadius: '20px 20px 0 0',
          }}
        />

        {/* Header row */}
        <div
          className="cl-hdr grid border-b px-6 py-3"
          style={{ gridTemplateColumns: '1fr 90px 90px 110px 70px 100px 110px', gap: 16, borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">Cliente</span>
          <span className="cl-hide font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">Tier</span>
          <span className="cl-hide font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">Estado</span>
          <span className="font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)] text-right">Mensual</span>
          <span className="cl-hide font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)] text-right">Días</span>
          <span className="cl-hide font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)] text-right">Pago mes</span>
          <span></span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-[13px] text-[var(--text-mute)]">
            {search
              ? 'Sin resultados para esa búsqueda'
              : 'No hay clientes en este filtro'}
          </div>
        ) : (
          filtered.map((client) => {
            const pct =
              totalMRR > 0 ? ((client.monthly_amount / totalMRR) * 100).toFixed(1) : '0'
            const isAnchor = client.tier === 'anchor'
            const isDeleting = deletingId === client.id

            return (
              <div
                key={client.id}
                className="cl-row grid items-center border-b px-6 py-[14px] transition-colors last:border-b-0 hover:bg-white/[0.02]"
                style={{ gridTemplateColumns: '1fr 90px 90px 110px 70px 100px 110px', gap: 16, borderColor: 'rgba(255,255,255,0.04)' }}
              >
                {/* Name */}
                <Link href={`/clientes/${client.id}`} className="flex flex-col group">
                  <span className="flex items-center gap-2 text-[14px] font-medium text-[var(--text)] group-hover:opacity-80 transition-opacity">
                    {client.name}
                    {isAnchor && (
                      <span className="inline-block size-[5px] rounded-full" style={{ background: 'var(--text)', boxShadow: '0 0 8px var(--glow-bright)' }} />
                    )}
                  </span>
                  {client.category && (
                    <span className="text-[11px] text-[var(--text-faint)]">{client.category}</span>
                  )}
                </Link>

                {/* Tier — hidden on mobile */}
                <span
                  className="cl-hide text-center font-space text-[10px] font-medium uppercase"
                  style={{ letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 100, ...(isAnchor ? { color: 'var(--text)', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.2)' } : { color: 'var(--text-soft)', background: 'rgba(255,255,255,0.05)' }) }}
                >
                  {TIER_LABELS[client.tier] ?? client.tier}
                </span>

                {/* Status — hidden on mobile */}
                <span
                  className="cl-hide text-center font-space text-[10px] font-medium uppercase"
                  style={{ letterSpacing: '0.07em', padding: '3px 8px', borderRadius: 100, ...(client.status === 'active' ? { color: 'var(--text)', background: 'rgba(255,255,255,0.05)' } : { color: 'var(--text-faint)', background: 'rgba(255,255,255,0.02)' }) }}
                >
                  {STATUS_LABELS[client.status]}
                </span>

                {/* Amount */}
                <div className="text-right">
                  <div className="font-space text-[14px] font-semibold tabular text-[var(--text)]">${formatMoney(client.monthly_amount)}</div>
                  {client.status === 'active' && (
                    <div className="font-space text-[10px] text-[var(--text-faint)]">{pct}%</div>
                  )}
                </div>

                {/* Days — hidden on mobile */}
                <div className="cl-hide text-right font-space text-[13px] text-[var(--text-mute)]">
                  {daysSince(client.start_date)}d
                </div>

                {/* Payment — hidden on mobile */}
                <div className="cl-hide text-right">
                  {client.status !== 'active' ? (
                    <span className="font-space text-[12px] text-[var(--text-faint)]">—</span>
                  ) : paymentMap.has(client.id) ? (
                    <span className="inline-block font-space text-[11px] font-medium" style={{ padding: '3px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', color: 'var(--text-soft)' }}>
                      {formatPaymentDate(paymentMap.get(client.id)!.paid_at!)}
                    </span>
                  ) : (
                    <span className="inline-block font-space text-[11px] font-medium" style={{ padding: '3px 8px', borderRadius: 100, background: 'rgba(251,191,36,0.08)', border: '1px dashed rgba(251,191,36,0.35)', color: 'rgba(251,191,36,0.85)' }}>
                      Pendiente
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  {isDeleting ? (
                    <>
                      <button onClick={() => setDeletingId(null)} className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-mute)] transition-colors hover:bg-white/[0.06]">Cancelar</button>
                      <button onClick={() => handleDelete(client.id)} disabled={isPending} className="rounded-lg px-2 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50">Confirmar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => openEdit(client)} className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-mute)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text)]">Editar</button>
                      <button onClick={() => setDeletingId(client.id)} className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400">✕</button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div></div></div>
    </>
  )
}
