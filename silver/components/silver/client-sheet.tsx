'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { SlidePanel } from './slide-panel'
import { createClientAction, updateClientAction } from '@/lib/silver/actions'
import type { Client, ClientTier, ClientStatus } from '@/lib/silver/types'

const TIERS: { value: ClientTier; label: string }[] = [
  { value: 'anchor', label: 'Anchor' },
  { value: 'high', label: 'High' },
  { value: 'mid', label: 'Mid' },
  { value: 'entry', label: 'Entry' },
  { value: 'custom', label: 'Custom' },
]

const STATUSES: { value: ClientStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'churned', label: 'Churned' },
]

interface ClientSheetProps {
  open: boolean
  onClose: () => void
  client?: Client
}

export function ClientSheet({ open, onClose, client }: ClientSheetProps) {
  const isEdit = !!client
  const [isPending, startTransition] = useTransition()

  const today = new Date().toISOString().slice(0, 10)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [tier, setTier] = useState<ClientTier>('mid')
  const [status, setStatus] = useState<ClientStatus>('active')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [notes, setNotes] = useState('')

  // Sync form fields when panel opens or client changes
  useEffect(() => {
    if (open) {
      setName(client?.name ?? '')
      setAmount(client?.monthly_amount != null ? String(client.monthly_amount) : '')
      setTier(client?.tier ?? 'mid')
      setStatus(client?.status ?? 'active')
      setCategory(client?.category ?? '')
      setStartDate(client?.start_date ?? today)
      setNotes(client?.notes ?? '')
    }
  }, [open, client?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount) return

    startTransition(async () => {
      try {
        const data = {
          name: name.trim(),
          monthly_amount: Number(amount),
          tier,
          status,
          category: category.trim() || undefined,
          start_date: startDate,
          notes: notes.trim() || undefined,
        }
        if (isEdit && client) {
          await updateClientAction(client.id, data)
          toast.success('Cliente actualizado')
        } else {
          await createClientAction(data)
          toast.success('Cliente creado')
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
      title={isEdit ? 'Editar cliente' : 'Nuevo cliente'}
      subtitle={isEdit ? client.name : 'Completa los datos del cliente'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="Nombre del cliente">
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Empresa o persona"
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
            placeholder="1000"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tier">
            <select
              style={inputStyle}
              value={tier}
              onChange={(e) => setTier(e.target.value as ClientTier)}
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Estado">
            <select
              style={inputStyle}
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Categoría (opcional)">
          <input
            style={inputStyle}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="ej. E-commerce, SaaS, Consultoría..."
          />
        </FormField>

        <FormField label="Fecha de inicio">
          <input
            style={inputStyle}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Notas (opcional)">
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales sobre el cliente..."
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
          {isPending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
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
