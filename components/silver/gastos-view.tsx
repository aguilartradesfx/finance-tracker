'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/silver/format'
import { deleteExpenseAction, toggleExpenseAction } from '@/lib/silver/actions'
import { ExpenseSheet } from './expense-sheet'
import type { FixedExpense, ExpenseCategory } from '@/lib/silver/types'

const CAT_LABELS: Record<ExpenseCategory, string> = {
  infrastructure: 'Infraestructura',
  tools: 'Herramientas',
  personal: 'Personal',
  team: 'Equipo',
  marketing: 'Marketing',
  other: 'Otro',
}

interface GastosViewProps {
  expenses: FixedExpense[]
}

export function GastosView({ expenses }: GastosViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [catFilter, setCatFilter] = useState<ExpenseCategory | 'all'>('all')
  const [showInactive, setShowInactive] = useState(false)
  const [isPending, startTransition] = useTransition()

  const active = expenses.filter((e) => e.active)
  const totalActive = active.reduce((s, e) => s + e.monthly_amount, 0)

  const filtered = expenses
    .filter((e) => showInactive || e.active)
    .filter((e) => catFilter === 'all' || e.category === catFilter)

  const openEdit = (expense: FixedExpense) => {
    setEditingExpense(expense)
    setSheetOpen(true)
  }

  const openNew = () => {
    setEditingExpense(undefined)
    setSheetOpen(true)
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteExpenseAction(id)
        toast.success('Gasto eliminado')
        setDeletingId(null)
      } catch {
        toast.error('Error al eliminar')
      }
    })
  }

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleExpenseAction(id, !currentActive)
        toast.success(currentActive ? 'Gasto desactivado' : 'Gasto activado')
      } catch {
        toast.error('Error al actualizar')
      }
    })
  }

  const categories = Array.from(new Set(expenses.map((e) => e.category)))

  return (
    <>
      <ExpenseSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        expense={editingExpense}
      />

      {/* Page header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1
            className="font-space text-[22px] font-semibold text-[var(--text)]"
            style={{ letterSpacing: '-0.02em' }}
          >
            Gastos fijos
          </h1>
          <p className="mt-0.5 text-[13px] text-[var(--text-mute)]">
            {active.length} activos · Total{' '}
            <span className="font-space font-semibold text-[var(--text)]">
              ${formatMoney(totalActive)}
            </span>
            {' '}/ mes
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
          Nuevo gasto
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        {/* Category filter */}
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as ExpenseCategory | 'all')}
          className="rounded-xl px-3 py-[7px] text-[12px] font-medium"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'var(--text-mute)',
            outline: 'none',
          }}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CAT_LABELS[c]}
            </option>
          ))}
        </select>

        {/* Show inactive toggle */}
        <button
          onClick={() => setShowInactive((v) => !v)}
          className="rounded-xl px-3 py-[7px] text-[12px] font-medium transition-all"
          style={
            showInactive
              ? { background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }
              : {
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'var(--text-mute)',
                }
          }
        >
          Mostrar inactivos
        </button>
      </div>

      {/* Table */}
      <style>{`
        @media (max-width: 767px) {
          .gs-hdr, .gs-row { grid-template-columns: 1fr 90px 110px !important; }
          .gs-hide { display: none !important; }
          .gs-scroll { overflow-x: hidden !important; }
          .gs-inner { min-width: unset !important; }
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
      <div className="gs-scroll overflow-x-auto" style={{ scrollbarWidth: 'none' }}><div className="gs-inner" style={{ minWidth: 540 }}>
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

        {/* Header */}
        <div
          className="gs-hdr grid border-b px-6 py-3"
          style={{ gridTemplateColumns: '1fr 130px 100px 90px 110px', gap: 16, borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">Gasto</span>
          <span className="gs-hide font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">Categoría</span>
          <span className="gs-hide font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">Alcance</span>
          <span className="font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">Estado</span>
          <span className="font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)] text-right">Mensual</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-[13px] text-[var(--text-mute)]">
            No hay gastos en este filtro
          </div>
        ) : (
          filtered.map((expense) => {
            const isDeleting = deletingId === expense.id

            return (
              <div
                key={expense.id}
                className="gs-row grid items-center border-b px-6 py-[14px] transition-colors last:border-b-0 hover:bg-white/[0.02]"
                style={{ gridTemplateColumns: '1fr 130px 100px 90px 110px', gap: 16, borderColor: 'rgba(255,255,255,0.04)', opacity: expense.active ? 1 : 0.45 }}
              >
                {/* Name + actions */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-[14px] font-medium text-[var(--text)]">{expense.name}</div>
                    {expense.notes && <div className="text-[11px] text-[var(--text-faint)]">{expense.notes}</div>}
                  </div>
                  {!isDeleting && (
                    <div className="flex items-center gap-1 ml-auto">
                      <button onClick={() => openEdit(expense)} className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-mute)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text)]">Editar</button>
                      <button onClick={() => setDeletingId(expense.id)} className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400">✕</button>
                    </div>
                  )}
                  {isDeleting && (
                    <div className="flex items-center gap-1 ml-auto">
                      <button onClick={() => setDeletingId(null)} className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-mute)] transition-colors hover:bg-white/[0.06]">Cancelar</button>
                      <button onClick={() => handleDelete(expense.id)} disabled={isPending} className="rounded-lg px-2 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50">Confirmar</button>
                    </div>
                  )}
                </div>

                {/* Category — hidden on mobile */}
                <span className="gs-hide font-space text-[11px] font-medium text-[var(--text-mute)]" style={{ padding: '3px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', display: 'inline-block' }}>
                  {CAT_LABELS[expense.category]}
                </span>

                {/* Scope — hidden on mobile */}
                <span className="gs-hide font-space text-[12px] capitalize text-[var(--text-mute)]">
                  {expense.scope}
                </span>

                {/* Toggle active */}
                <div>
                  <button
                    onClick={() => handleToggle(expense.id, expense.active)}
                    disabled={isPending}
                    className="rounded-lg px-2 py-1 font-space text-[10px] font-medium uppercase transition-all disabled:opacity-50"
                    style={{ letterSpacing: '0.06em', ...(expense.active ? { color: 'var(--text)', background: 'rgba(255,255,255,0.06)' } : { color: 'var(--text-faint)', background: 'transparent' }) }}
                  >
                    {expense.active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>

                {/* Amount */}
                <div className="text-right font-space text-[14px] font-semibold tabular text-[var(--text)]">
                  ${formatMoney(expense.monthly_amount)}
                </div>
              </div>
            )
          })
        )}

        {/* Summary footer */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', minHeight: 64 }}
        >
          <span className="text-[12px] text-[var(--text-mute)]">
            Total activos ({active.length} conceptos)
          </span>
          <span className="font-space text-[16px] font-semibold text-[var(--text)]">
            ${formatMoney(totalActive)} / mes
          </span>
        </div>
      </div></div></div>
    </>
  )
}
