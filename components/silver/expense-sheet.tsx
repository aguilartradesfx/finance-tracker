'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { SlidePanel } from './slide-panel'
import { createExpenseAction, updateExpenseAction } from '@/lib/silver/actions'
import type { FixedExpense, ExpenseCategory, ExpenseScope } from '@/lib/silver/types'

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'infrastructure', label: 'Infraestructura' },
  { value: 'tools', label: 'Herramientas' },
  { value: 'personal', label: 'Personal' },
  { value: 'team', label: 'Equipo' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Otro' },
]

const SCOPES: { value: ExpenseScope; label: string }[] = [
  { value: 'bralto', label: 'Bralto' },
  { value: 'personal', label: 'Personal' },
  { value: 'both', label: 'Ambos' },
]

interface ExpenseSheetProps {
  open: boolean
  onClose: () => void
  expense?: FixedExpense
}

export function ExpenseSheet({ open, onClose, expense }: ExpenseSheetProps) {
  const isEdit = !!expense
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('tools')
  const [scope, setScope] = useState<ExpenseScope>('bralto')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setName(expense?.name ?? '')
      setAmount(expense?.monthly_amount != null ? String(expense.monthly_amount) : '')
      setCategory(expense?.category ?? 'tools')
      setScope(expense?.scope ?? 'bralto')
      setNotes(expense?.notes ?? '')
    }
  }, [open, expense?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount) return

    startTransition(async () => {
      try {
        const data = {
          name: name.trim(),
          monthly_amount: Number(amount),
          category,
          scope,
          notes: notes.trim() || undefined,
        }
        if (isEdit && expense) {
          await updateExpenseAction(expense.id, data)
          toast.success('Gasto actualizado')
        } else {
          await createExpenseAction(data)
          toast.success('Gasto creado')
        }
        onClose()
      } catch {
        toast.error('Ocurrió un error. Intenta de nuevo.')
      }
    })
  }

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar gasto' : 'Nuevo gasto'}
      subtitle={isEdit ? expense.name : 'Completa los datos del gasto fijo'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="Nombre del gasto">
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Servidor, Adobe CC, Sueldo..."
            required
          />
        </FormField>

        <FormField label="Monto mensual (USD)">
          <input
            style={inputStyle}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Categoría">
            <select
              style={inputStyle}
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Alcance">
            <select
              style={inputStyle}
              value={scope}
              onChange={(e) => setScope(e.target.value as ExpenseScope)}
            >
              {SCOPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Notas (opcional)">
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales sobre este gasto..."
          />
        </FormField>

        <button
          type="submit"
          disabled={isPending || !name.trim() || !amount}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-xl text-[13px] font-medium text-[var(--text)] transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear gasto'}
        </button>
      </form>
    </SlidePanel>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-[6px] block font-space text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-mute)]">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '9px 12px',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
}
