import { createClient } from '@/lib/supabase/server'
import type { Client, FixedExpense, MonthlyGoal, MonthlySnapshot, AdCampaign, MonthlyPayment, IncomeEntry, GeneralExpense } from './types'

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('monthly_amount', { ascending: false })
  if (error) throw error
  return data as Client[]
}

export async function getExpenses(): Promise<FixedExpense[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fixed_expenses')
    .select('*')
    .order('monthly_amount', { ascending: false })
  if (error) throw error
  return data as FixedExpense[]
}

export async function getMonthlyGoals(): Promise<MonthlyGoal[]> {
  const today = new Date()
  const startOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_goals')
    .select('*')
    .gte('month', startOfMonth)
    .order('month', { ascending: true })
    .limit(3)
  if (error) throw error
  return data as MonthlyGoal[]
}

export async function ensureNextThreeMonthsGoals(currentMRR: number): Promise<void> {
  const today = new Date()
  const months = [0, 1, 2].map((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('monthly_goals')
    .select('month')
    .in('month', months)

  const existingSet = new Set((existing ?? []).map((g) => g.month))
  const missing = months.filter((m) => !existingSet.has(m))

  if (missing.length === 0) return

  await supabase.from('monthly_goals').insert(
    missing.map((month) => ({
      month,
      mrr_target: currentMRR,
      new_clients_target: 0,
      ad_spend_budget: 0,
      narrative: null,
      notes: null,
    }))
  )
}

export async function getMonthlySnapshots(): Promise<MonthlySnapshot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_snapshots')
    .select('*')
    .order('month', { ascending: true })
  if (error) throw error
  return data as MonthlySnapshot[]
}

export async function getAdCampaigns(): Promise<AdCampaign[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .order('start_date', { ascending: false })
  if (error) throw error
  return data as AdCampaign[]
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Client
}

export async function getGeneralExpensesForMonth(
  month: string
): Promise<GeneralExpense[]> {
  const d = new Date(month)
  const startDate = month
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  const endDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('general_expenses')
    .select('*')
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: false })
  if (error) return []
  return data as GeneralExpense[]
}

export async function getIncomeEntriesForMonth(
  month: string
): Promise<IncomeEntry[]> {
  const d = new Date(month)
  const startDate = month
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  const endDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('income_entries')
    .select('*')
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: false })
  if (error) return []
  return data as IncomeEntry[]
}

export async function getMonthlyPaymentsForMonth(
  month: string
): Promise<{ payments: MonthlyPayment[]; tableExists: boolean }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_payments')
    .select('*')
    .eq('month', month)
  if (error) {
    const tableExists = error.code !== 'PGRST205'
    return { payments: [], tableExists }
  }
  return { payments: data as MonthlyPayment[], tableExists: true }
}
