import type {
  Client,
  FixedExpense,
  ExpenseScope,
  HireType,
  HireStatus,
  ConcentrationRisk,
  TierBreakdown,
  AdROIInput,
  AdROIResult,
  RatioLevel,
  MonthlyPayment,
} from './types'

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function isFutureClient(client: Client, now: number = startOfToday()): boolean {
  return new Date(client.start_date).getTime() > now
}

export function isActiveNow(client: Client, now: number = startOfToday()): boolean {
  return client.status === 'active' && !isFutureClient(client, now)
}

export function calculateMRR(clients: Client[]): number {
  return clients
    .filter((c) => isActiveNow(c))
    .reduce((sum, c) => sum + c.monthly_amount, 0)
}

export function calculateCollectedMRR(
  clients: Client[],
  payments: MonthlyPayment[]
): number {
  const activeMap = new Map(
    clients
      .filter((c) => isActiveNow(c))
      .map((c) => [c.id, c.monthly_amount] as const)
  )
  return payments
    .filter((p) => activeMap.has(p.client_id))
    .reduce((sum, p) => sum + (p.amount ?? activeMap.get(p.client_id) ?? 0), 0)
}

export function calculateExpenses(
  expenses: FixedExpense[],
  scope: ExpenseScope | 'all' = 'all'
): number {
  return expenses
    .filter((e) => e.active)
    .filter((e) => scope === 'all' || e.scope === scope || e.scope === 'both')
    .reduce((sum, e) => sum + e.monthly_amount, 0)
}

export function calculateNet(mrr: number, expenses: number): number {
  return mrr - expenses
}

export function calculateMargin(net: number, mrr: number): number {
  if (mrr === 0) return 0
  return (net / mrr) * 100
}

export function calculateConcentrationRisk(clients: Client[]): ConcentrationRisk {
  const active = clients.filter((c) => isActiveNow(c))
  const mrr = active.reduce((sum, c) => sum + c.monthly_amount, 0)

  if (active.length === 0 || mrr === 0) {
    return { topClient: null, percentage: 0, level: 'safe' }
  }

  const sorted = [...active].sort((a, b) => b.monthly_amount - a.monthly_amount)
  const top = sorted[0]
  const percentage = (top.monthly_amount / mrr) * 100

  const level: ConcentrationRisk['level'] =
    percentage > 25 ? 'danger' : percentage >= 20 ? 'warning' : 'safe'

  return { topClient: top, percentage, level }
}

export function calculateAvgTicket(clients: Client[]): number {
  const active = clients.filter((c) => isActiveNow(c))
  if (active.length === 0) return 0
  return calculateMRR(active) / active.length
}

export function calculateMedianTicket(clients: Client[]): number {
  const active = clients
    .filter((c) => isActiveNow(c))
    .map((c) => c.monthly_amount)
    .sort((a, b) => a - b)

  if (active.length === 0) return 0

  const mid = Math.floor(active.length / 2)
  return active.length % 2 === 0
    ? (active[mid - 1] + active[mid]) / 2
    : active[mid]
}

export function getTierBreakdown(clients: Client[]): TierBreakdown[] {
  const active = clients.filter((c) => isActiveNow(c))
  const mrr = active.reduce((sum, c) => sum + c.monthly_amount, 0)

  const tiers = ['anchor', 'high', 'mid', 'entry', 'custom'] as const
  return tiers
    .map((tier) => {
      const tierClients = active.filter((c) => c.tier === tier)
      const total = tierClients.reduce((sum, c) => sum + c.monthly_amount, 0)
      return {
        tier,
        count: tierClients.length,
        total,
        percentage: mrr > 0 ? (total / mrr) * 100 : 0,
      }
    })
    .filter((t) => t.count > 0)
}

export function calculateTotalCost(salary: number, type: HireType): number {
  const multipliers: Record<HireType, number> = {
    payroll: 1.4,
    services: 1.0,
    contractor: 1.0,
  }
  return salary * multipliers[type]
}

export function calculateRequiredMRR(
  currentExpenses: number,
  hireCost: number,
  targetMargin = 0.3
): number {
  return (currentExpenses + hireCost) / (1 - targetMargin)
}

export function calculateGap(requiredMRR: number, currentMRR: number): number {
  return Math.max(0, requiredMRR - currentMRR)
}

export function calculateHireStatus(gap: number): HireStatus {
  if (gap === 0) return 'ready'
  if (gap < 500) return 'close'
  return 'far'
}

export function calculateAdROI(input: AdROIInput): AdROIResult {
  const { budget, cpl, closeRate, avgTicket, retentionMonths } = input

  const leads = cpl > 0 ? budget / cpl : 0
  const clients = leads * (closeRate / 100)
  const cac = clients > 0 ? budget / clients : 0
  const ltv = avgTicket * retentionMonths
  const ltvCacRatio = cac > 0 ? ltv / cac : 0
  const paybackMonths = avgTicket > 0 ? cac / avgTicket : 0
  const mrrAtMonth3 = clients * avgTicket * Math.min(3, retentionMonths)

  let ratioLevel: RatioLevel
  if (ltvCacRatio >= 5) ratioLevel = 'excellent'
  else if (ltvCacRatio >= 3) ratioLevel = 'good'
  else if (ltvCacRatio >= 1.5) ratioLevel = 'warning'
  else ratioLevel = 'bad'

  return {
    leads: Math.round(leads * 10) / 10,
    clients: Math.round(clients * 10) / 10,
    cac: Math.round(cac * 100) / 100,
    ltv: Math.round(ltv * 100) / 100,
    ltvCacRatio: Math.round(ltvCacRatio * 10) / 10,
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    mrrAtMonth3: Math.round(mrrAtMonth3 * 100) / 100,
    ratioLevel,
  }
}
