'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ClientTier, ClientStatus, ExpenseCategory, ExpenseScope } from './types'

// ── Client actions ─────────────────────────────────────

export async function createClientAction(data: {
  name: string
  monthly_amount: number
  tier: ClientTier
  status: ClientStatus
  category?: string
  start_date: string
  notes?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('clients').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateClientAction(
  id: string,
  data: Partial<{
    name: string
    monthly_amount: number
    tier: ClientTier
    status: ClientStatus
    category: string | null
    start_date: string
    churn_date: string | null
    notes: string | null
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('clients').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

// ── Expense actions ────────────────────────────────────

export async function createExpenseAction(data: {
  name: string
  monthly_amount: number
  category: ExpenseCategory
  scope: ExpenseScope
  notes?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('fixed_expenses').insert({ active: true, ...data })
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateExpenseAction(
  id: string,
  data: Partial<{
    name: string
    monthly_amount: number
    category: ExpenseCategory
    scope: ExpenseScope
    active: boolean
    notes: string | null
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('fixed_expenses').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteExpenseAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('fixed_expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function toggleExpenseAction(id: string, active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('fixed_expenses').update({ active }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

// ── Payment actions ────────────────────────────────────

export async function markClientPaidAction(clientId: string, month: string, amount: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('monthly_payments')
    .upsert(
      { client_id: clientId, month, paid_at: new Date().toISOString(), amount },
      { onConflict: 'client_id,month' }
    )
  if (error) throw new Error(error.message)
  revalidatePath('/cobros')
}

export async function unmarkClientPaidAction(clientId: string, month: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('monthly_payments')
    .delete()
    .eq('client_id', clientId)
    .eq('month', month)
  if (error) throw new Error(error.message)
  revalidatePath('/cobros')
}

// ── Income entry actions ───────────────────────────────

export async function createIncomeEntryAction(data: {
  description: string
  amount: number
  date: string
  category?: string | null
  notes?: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('income_entries').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateIncomeEntryAction(
  id: string,
  data: Partial<{
    description: string
    amount: number
    date: string
    category: string | null
    notes: string | null
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('income_entries').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteIncomeEntryAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('income_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

// ── General expense actions ────────────────────────────

export async function createGeneralExpenseAction(data: {
  description: string
  amount: number
  date: string
  category?: string | null
  vendor?: string | null
  notes?: string | null
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('general_expenses').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/gastos')
}

export async function deleteGeneralExpenseAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('general_expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/gastos')
}
