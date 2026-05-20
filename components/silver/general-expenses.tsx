'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/silver/format'
import { createGeneralExpenseAction, deleteGeneralExpenseAction } from '@/lib/silver/actions'
import { SlidePanel } from './slide-panel'
import type { GeneralExpense } from '@/lib/silver/types'

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

interface GeneralExpensesProps {
  expenses: GeneralExpense[]
  month: string
}

export function GeneralExpenses({ expenses, month }: GeneralExpensesProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [prefill, setPrefill] = useState<Partial<GeneralExpense> | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  const openNew = (pre?: Partial<GeneralExpense>) => {
    setPrefill(pre)
    setSheetOpen(true)
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteGeneralExpenseAction(id)
        toast.success('Gasto eliminado')
        setDeletingId(null)
      } catch {
        toast.error('Error al eliminar')
      }
    })
  }

  return (
    <>
      <ExpenseSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        prefill={prefill}
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
        <div className="flex flex-wrap items-center justify-between gap-3 px-[22px] pt-[18px] pb-[14px]">
          <div className="flex items-center gap-[10px]">
            <span
              className="block size-[7px] shrink-0 rounded-full"
              style={{ background: 'var(--silver-dim)', boxShadow: '0 0 6px rgba(161,161,170,0.4)' }}
            />
            <span
              className="font-space text-[13px] font-medium text-[var(--text)]"
              style={{ letterSpacing: '-0.005em' }}
            >
              Facturas y gastos generales
            </span>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="font-space text-[13px] font-semibold text-[var(--text-soft)]">
                ${formatMoney(total)}
              </span>
            )}
            <span className="font-space text-[11px] text-[var(--text-mute)]">
              {monthLabel(month)}
            </span>
            <ReceiptUploadButton onAnalyzed={(data) => openNew(data)} />
            <button
              onClick={() => openNew()}
              className="flex h-7 items-center gap-1 rounded-lg px-3 text-[12px] font-medium text-[var(--text)] transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
              Manual
            </button>
          </div>
        </div>

        {/* List */}
        <div className="px-[22px] pb-[22px] pt-[6px]">
          {expenses.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[13px] text-[var(--text-mute)]">Sin gastos registrados este mes</p>
              <p className="mt-1 text-[11px] text-[var(--text-faint)]">
                Sube una foto de una factura y la IA extrae los datos automáticamente
              </p>
            </div>
          ) : (
            expenses.map((expense) => {
              const isDeleting = deletingId === expense.id
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 border-b py-[13px] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-medium text-[var(--text)] truncate">
                        {expense.description}
                      </span>
                      {expense.category && (
                        <span
                          className="shrink-0 font-space text-[10px] font-medium uppercase text-[var(--text-soft)]"
                          style={{
                            letterSpacing: '0.07em',
                            padding: '2px 7px',
                            borderRadius: 100,
                            background: 'rgba(255,255,255,0.05)',
                          }}
                        >
                          {expense.category}
                        </span>
                      )}
                    </div>
                    {expense.vendor && (
                      <div className="mt-0.5 text-[11px] text-[var(--text-faint)]">
                        {expense.vendor}
                      </div>
                    )}
                  </div>

                  <span className="shrink-0 font-space text-[12px] text-[var(--text-mute)]">
                    {formatEntryDate(expense.date)}
                  </span>

                  <span className="shrink-0 font-space text-[14px] font-semibold tabular text-[var(--text-soft)]">
                    ${formatMoney(expense.amount)}
                  </span>

                  <div className="shrink-0 flex items-center gap-1">
                    {isDeleting ? (
                      <>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-mute)] hover:bg-white/[0.06] transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          disabled={isPending}
                          className="rounded-lg px-2 py-1 text-[11px] font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeletingId(expense.id)}
                        className="rounded-lg px-2 py-1 text-[11px] text-[var(--text-faint)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
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

// ── Receipt upload button ──────────────────────────────

interface ReceiptUploadButtonProps {
  onAnalyzed: (data: Partial<GeneralExpense>) => void
}

function ReceiptUploadButton({ onAnalyzed }: ReceiptUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleFile = async (file: File) => {
    setAnalyzing(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/analyze-receipt', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || data.error) {
        toast.error(data.error ?? 'No se pudo analizar la imagen')
        return
      }
      toast.success('Factura analizada — revisa los datos')
      onAnalyzed({
        description: data.description ?? '',
        amount: data.amount ?? undefined,
        date: data.date ?? undefined,
        category: data.category ?? null,
        vendor: data.vendor ?? null,
      })
    } catch {
      toast.error('Error de conexión al analizar')
    } finally {
      setAnalyzing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={analyzing}
        className="flex h-7 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-all disabled:opacity-50"
        style={{
          background: analyzing
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.04)',
          border: '1px dashed rgba(255,255,255,0.15)',
          color: 'var(--text-mute)',
        }}
      >
        {analyzing ? (
          <>
            <svg
              className="animate-spin"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Analizando…
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            Subir factura
          </>
        )}
      </button>
    </>
  )
}

// ── Form sheet ─────────────────────────────────────────

interface ExpenseSheetProps {
  open: boolean
  onClose: () => void
  prefill?: Partial<GeneralExpense>
  month: string
}

function ExpenseSheet({ open, onClose, prefill, month }: ExpenseSheetProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [vendor, setVendor] = useState('')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setDescription(prefill?.description ?? '')
      setAmount(prefill?.amount != null ? String(prefill.amount) : '')
      setDate(prefill?.date ?? todayISO())
      setCategory(prefill?.category ?? '')
      setVendor(prefill?.vendor ?? '')
      setNotes(prefill?.notes ?? '')
    }
  }, [open, prefill?.description])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      description: description.trim(),
      amount: parseFloat(amount),
      date,
      category: category.trim() || null,
      vendor: vendor.trim() || null,
      notes: notes.trim() || null,
    }
    startTransition(async () => {
      try {
        await createGeneralExpenseAction(data)
        toast.success('Gasto registrado')
        onClose()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al guardar')
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
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    color: 'var(--text-mute)',
    marginBottom: 6,
    fontFamily: 'var(--font-space)',
  }

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title="Registrar gasto"
      subtitle={monthLabel(month)}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label style={labelStyle}>Descripción *</label>
          <input
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Almuerzo con cliente, gasolina, etc."
            style={fieldStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Monto *</label>
            <div className="relative">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Categoría</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Comida, Transporte…"
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Comercio / Proveedor</label>
            <input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Nombre del lugar"
              style={fieldStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles adicionales…"
            rows={2}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 h-10 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'var(--text)',
          }}
        >
          {isPending ? 'Guardando…' : 'Registrar gasto'}
        </button>
      </form>
    </SlidePanel>
  )
}
