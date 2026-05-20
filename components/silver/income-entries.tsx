'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/silver/format'
import {
  createIncomeEntryAction,
  updateIncomeEntryAction,
  deleteIncomeEntryAction,
  createClientAction,
} from '@/lib/silver/actions'
import { SlidePanel } from './slide-panel'
import type { IncomeEntry, ClientTier } from '@/lib/silver/types'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function monthLabel(month: string): string {
  const d = new Date(month + 'T12:00:00')
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

function formatEntryDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface IncomeEntriesProps {
  entries: IncomeEntry[]
  month: string
}

export function IncomeEntries({ entries, month }: IncomeEntriesProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<IncomeEntry | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const total = entries.reduce((sum, e) => sum + e.amount, 0)

  const openNew = () => {
    setEditing(undefined)
    setSheetOpen(true)
  }

  const openEdit = (entry: IncomeEntry) => {
    setEditing(entry)
    setSheetOpen(true)
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteIncomeEntryAction(id)
        toast.success('Ingreso eliminado')
        setDeletingId(null)
      } catch {
        toast.error('Error al eliminar')
      }
    })
  }

  return (
    <>
      <IncomeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        entry={editing}
        month={month}
      />

      <div
        className="relative overflow-hidden"
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          boxShadow: 'var(--shadow-lifted)',
        }}
      >
        {/* Top highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{
            height: 100,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
            borderRadius: '24px 24px 0 0',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-[22px] pt-[18px] pb-[14px]">
          <div className="flex items-center gap-[10px]">
            <span
              className="block size-[7px] shrink-0 rounded-full"
              style={{ background: 'var(--text)', boxShadow: '0 0 8px var(--glow-bright)' }}
            />
            <span
              className="font-space text-[13px] font-medium text-[var(--text)]"
              style={{ letterSpacing: '-0.005em' }}
            >
              Otros ingresos
            </span>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="font-space text-[13px] font-semibold text-[var(--text)]">
                ${formatMoney(total)}
              </span>
            )}
            <span className="font-space text-[11px] text-[var(--text-mute)]">
              {monthLabel(month)}
            </span>
            <button
              onClick={openNew}
              className="flex h-7 items-center gap-1 rounded-lg px-3 text-[12px] font-medium text-[var(--text)] transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
              Nuevo ingreso
            </button>
          </div>
        </div>

        {/* List */}
        <div className="px-[22px] pb-[22px] pt-[6px]">
          {entries.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-[var(--text-mute)]">
              Sin ingresos adicionales este mes
            </div>
          ) : (
            entries.map((entry) => {
              const isDeleting = deletingId === entry.id
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 border-b py-[13px] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-medium text-[var(--text)] truncate">
                        {entry.description}
                      </span>
                      {entry.category && (
                        <span
                          className="shrink-0 font-space text-[10px] font-medium uppercase text-[var(--text-soft)]"
                          style={{
                            letterSpacing: '0.07em',
                            padding: '2px 7px',
                            borderRadius: 100,
                            background: 'rgba(255,255,255,0.05)',
                          }}
                        >
                          {entry.category}
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <div className="mt-0.5 text-[11px] text-[var(--text-faint)] truncate">
                        {entry.notes}
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <span className="shrink-0 font-space text-[12px] text-[var(--text-mute)]">
                    {formatEntryDate(entry.date)}
                  </span>

                  {/* Amount */}
                  <span className="shrink-0 font-space text-[14px] font-semibold tabular text-[var(--text)]">
                    ${formatMoney(entry.amount)}
                  </span>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-1">
                    {isDeleting ? (
                      <>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-mute)] transition-colors hover:bg-white/[0.06]"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={isPending}
                          className="rounded-lg px-2 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openEdit(entry)}
                          className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-mute)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text)]"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeletingId(entry.id)}
                          className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

// ── Form sheet ─────────────────────────────────────────

interface IncomeSheetProps {
  open: boolean
  onClose: () => void
  entry?: IncomeEntry
  month: string
}

function IncomeSheet({ open, onClose, entry, month }: IncomeSheetProps) {
  const [tipo, setTipo] = useState<'unico' | 'recurrente'>('unico')

  // Pago único fields
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')

  // Recurrente (new client) fields
  const [clientName, setClientName] = useState('')
  const [clientAmount, setClientAmount] = useState('')
  const [clientTier, setClientTier] = useState<ClientTier>('mid')
  const [clientStartDate, setClientStartDate] = useState('')
  const [clientCategory, setClientCategory] = useState('')
  const [clientNotes, setClientNotes] = useState('')

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setTipo('unico')
      setDescription(entry?.description ?? '')
      setAmount(entry ? String(entry.amount) : '')
      setDate(entry?.date ?? todayISO())
      setCategory(entry?.category ?? '')
      setNotes(entry?.notes ?? '')
      setClientName('')
      setClientAmount('')
      setClientTier('mid')
      setClientStartDate(todayISO())
      setClientCategory('')
      setClientNotes('')
    }
  }, [open, entry?.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (entry) {
          await updateIncomeEntryAction(entry.id, {
            description: description.trim(),
            amount: parseFloat(amount),
            date,
            category: category.trim() || null,
            notes: notes.trim() || null,
          })
          toast.success('Ingreso actualizado')
        } else if (tipo === 'unico') {
          await createIncomeEntryAction({
            description: description.trim(),
            amount: parseFloat(amount),
            date,
            category: category.trim() || null,
            notes: notes.trim() || null,
          })
          toast.success('Ingreso registrado')
        } else {
          await createClientAction({
            name: clientName.trim(),
            monthly_amount: parseFloat(clientAmount),
            tier: clientTier,
            status: 'active',
            category: clientCategory.trim() || undefined,
            start_date: clientStartDate,
            notes: clientNotes.trim() || undefined,
          })
          toast.success('Cliente creado')
        }
        onClose()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  const fieldStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: 'var(--text)',
    outline: 'none',
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: 'var(--text-mute)',
    marginBottom: 6,
    fontFamily: 'var(--font-space)',
  }

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title={entry ? 'Editar ingreso' : 'Nuevo ingreso'}
      subtitle={entry ? entry.description : monthLabel(month)}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Tipo toggle — only for new entries */}
        {!entry && (
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              borderRadius: 14,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {(['unico', 'recurrente'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: 'none',
                  ...(tipo === t
                    ? { background: 'rgba(255,255,255,0.1)', color: 'var(--text)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }
                    : { background: 'transparent', color: 'var(--text-mute)' }),
                }}
              >
                {t === 'unico' ? 'Pago único' : 'Recurrente MRR'}
              </button>
            ))}
          </div>
        )}

        {/* Pago único form */}
        {(entry || tipo === 'unico') && (
          <>
            <div>
              <label style={labelStyle}>Descripción *</label>
              <input
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Proyecto de branding para empresa X"
                style={fieldStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Monto *</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-mute)',
                      fontSize: 14,
                      fontFamily: 'var(--font-space)',
                    }}
                  >
                    $
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ ...fieldStyle, paddingLeft: 24 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Fecha *</label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ ...fieldStyle, colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Categoría</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej: Consultoría, Proyecto, Diseño…"
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles adicionales…"
                rows={3}
                style={{ ...fieldStyle, resize: 'vertical' }}
              />
            </div>
          </>
        )}

        {/* Recurrente (new client) form */}
        {!entry && tipo === 'recurrente' && (
          <>
            <div>
              <label style={labelStyle}>Nombre del cliente *</label>
              <input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre de la empresa o persona"
                style={fieldStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Mensual *</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-mute)',
                      fontSize: 14,
                      fontFamily: 'var(--font-space)',
                    }}
                  >
                    $
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={clientAmount}
                    onChange={(e) => setClientAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ ...fieldStyle, paddingLeft: 24 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tier *</label>
                <select
                  required
                  value={clientTier}
                  onChange={(e) => setClientTier(e.target.value as ClientTier)}
                  style={{ ...fieldStyle, cursor: 'pointer' }}
                >
                  <option value="anchor">Anchor</option>
                  <option value="high">High</option>
                  <option value="mid">Mid</option>
                  <option value="entry">Entry</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Inicio *</label>
              <input
                required
                type="date"
                value={clientStartDate}
                onChange={(e) => setClientStartDate(e.target.value)}
                style={{ ...fieldStyle, colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Categoría / Industria</label>
              <input
                value={clientCategory}
                onChange={(e) => setClientCategory(e.target.value)}
                placeholder="Ej: Ecommerce, SaaS, Retail…"
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Notas</label>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Detalles adicionales…"
                rows={3}
                style={{ ...fieldStyle, resize: 'vertical' }}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            marginTop: 8,
            height: 40,
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'var(--text)',
            opacity: isPending ? 0.5 : 1,
          }}
        >
          {isPending
            ? 'Guardando…'
            : entry
            ? 'Guardar cambios'
            : tipo === 'unico'
            ? 'Registrar ingreso'
            : 'Crear cliente'}
        </button>
      </form>
    </SlidePanel>
  )
}
