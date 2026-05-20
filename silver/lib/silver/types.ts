export type ClientTier = 'anchor' | 'high' | 'mid' | 'entry' | 'custom'
export type ClientStatus = 'active' | 'paused' | 'churned'
export type ExpenseCategory = 'infrastructure' | 'tools' | 'personal' | 'team' | 'marketing' | 'other'
export type ExpenseScope = 'personal' | 'bralto' | 'both'
export type AdPlatform = 'meta' | 'linkedin' | 'google' | 'other'
export type HireType = 'payroll' | 'services' | 'contractor'
export type ConcentrationLevel = 'safe' | 'warning' | 'danger'
export type RatioLevel = 'excellent' | 'good' | 'warning' | 'bad'
export type HireStatus = 'ready' | 'close' | 'far'

export interface Client {
  id: string
  name: string
  monthly_amount: number
  tier: ClientTier
  status: ClientStatus
  category?: string | null
  start_date: string
  churn_date?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface FixedExpense {
  id: string
  name: string
  monthly_amount: number
  category: ExpenseCategory
  scope: ExpenseScope
  active: boolean
  notes?: string | null
  created_at: string
}

export interface MonthlyGoal {
  id: string
  month: string
  mrr_target: number
  new_clients_target: number
  ad_spend_budget: number
  narrative?: string | null
  notes?: string | null
  created_at: string
}

export interface MonthlySnapshot {
  id: string
  month: string
  mrr_actual: number
  expenses_actual: number
  ad_spend_actual: number
  new_clients_actual: number
  churned_clients_actual: number
  notes?: string | null
  created_at: string
}

export interface AdCampaign {
  id: string
  platform: AdPlatform
  name: string
  start_date: string
  end_date?: string | null
  total_spend: number
  leads_generated: number
  clients_closed: number
  mrr_generated: number
  active: boolean
  created_at: string
}

export interface TierBreakdown {
  tier: ClientTier
  count: number
  total: number
  percentage: number
}

export interface ConcentrationRisk {
  topClient: Client | null
  percentage: number
  level: ConcentrationLevel
}

export interface AdROIResult {
  leads: number
  clients: number
  cac: number
  ltv: number
  ltvCacRatio: number
  paybackMonths: number
  mrrAtMonth3: number
  ratioLevel: RatioLevel
}

export interface AdROIInput {
  budget: number
  cpl: number
  closeRate: number
  avgTicket: number
  retentionMonths: number
}

export interface MonthlyPayment {
  id: string
  client_id: string
  month: string
  paid_at: string | null
  amount: number | null
  notes: string | null
  created_at: string
}

export interface GeneralExpense {
  id: string
  description: string
  amount: number
  date: string
  category: string | null
  vendor: string | null
  notes: string | null
  created_at: string
}

export interface IncomeEntry {
  id: string
  description: string
  amount: number
  date: string
  category: string | null
  notes: string | null
  created_at: string
}
