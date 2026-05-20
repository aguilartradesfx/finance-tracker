import { describe, it, expect } from 'vitest'
import {
  calculateMRR,
  calculateExpenses,
  calculateNet,
  calculateMargin,
  calculateConcentrationRisk,
  calculateAvgTicket,
  calculateMedianTicket,
  getTierBreakdown,
  calculateTotalCost,
  calculateRequiredMRR,
  calculateGap,
  calculateHireStatus,
  calculateAdROI,
} from '../calculations'
import type { Client, FixedExpense } from '../types'

const makeClient = (overrides: Partial<Client> = {}): Client => ({
  id: '1',
  name: 'Test',
  monthly_amount: 500,
  tier: 'mid',
  status: 'active',
  start_date: '2026-01-01',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const seedClients: Client[] = [
  makeClient({ id: '1', name: 'American Outlet', monthly_amount: 950, tier: 'anchor' }),
  makeClient({ id: '2', name: 'Ecoviva', monthly_amount: 375, tier: 'high' }),
  makeClient({ id: '3', name: 'AO Liquidators', monthly_amount: 375, tier: 'high' }),
  makeClient({ id: '4', name: 'AO Warehouse', monthly_amount: 375, tier: 'high' }),
  makeClient({ id: '5', name: 'Nanku', monthly_amount: 270, tier: 'mid' }),
  makeClient({ id: '6', name: 'Hidasol', monthly_amount: 270, tier: 'mid' }),
  makeClient({ id: '7', name: 'Aleconomies', monthly_amount: 87, tier: 'entry' }),
  makeClient({ id: '8', name: 'Travelcore', monthly_amount: 87, tier: 'entry' }),
  makeClient({ id: '9', name: 'Zenius', monthly_amount: 87, tier: 'entry' }),
  makeClient({ id: '10', name: 'Natural Lodge', monthly_amount: 87, tier: 'entry' }),
]

const seedExpenses: FixedExpense[] = [
  { id: '1', name: 'Renta', monthly_amount: 700, category: 'personal', scope: 'personal', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'Auto', monthly_amount: 400, category: 'personal', scope: 'personal', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: '3', name: 'GHL', monthly_amount: 497, category: 'infrastructure', scope: 'bralto', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: '4', name: 'Claude', monthly_amount: 105, category: 'tools', scope: 'both', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: '5', name: 'Zoom', monthly_amount: 20, category: 'tools', scope: 'bralto', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: '6', name: 'Higgsfield', monthly_amount: 100, category: 'tools', scope: 'bralto', active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: '7', name: 'LinkedIn Agent', monthly_amount: 275, category: 'marketing', scope: 'bralto', active: true, created_at: '2026-01-01T00:00:00Z' },
]

describe('calculateMRR', () => {
  it('sums active client amounts', () => {
    expect(calculateMRR(seedClients)).toBe(2963)
  })

  it('excludes churned clients', () => {
    const clients = [
      makeClient({ monthly_amount: 500, status: 'active' }),
      makeClient({ monthly_amount: 300, status: 'churned' }),
    ]
    expect(calculateMRR(clients)).toBe(500)
  })

  it('returns 0 for empty array', () => {
    expect(calculateMRR([])).toBe(0)
  })
})

describe('calculateExpenses', () => {
  it('sums all active expenses', () => {
    expect(calculateExpenses(seedExpenses)).toBe(2097)
  })

  it('filters by bralto scope (includes both)', () => {
    const result = calculateExpenses(seedExpenses, 'bralto')
    // GHL 497 + Claude 105 + Zoom 20 + Higgsfield 100 + LinkedIn 275 = 997
    expect(result).toBe(997)
  })

  it('filters by personal scope (includes both)', () => {
    const result = calculateExpenses(seedExpenses, 'personal')
    // Renta 700 + Auto 400 + Claude 105 = 1205
    expect(result).toBe(1205)
  })

  it('excludes inactive expenses', () => {
    const expenses = [
      { ...seedExpenses[0], active: false },
      seedExpenses[1],
    ]
    expect(calculateExpenses(expenses)).toBe(400)
  })
})

describe('calculateNet', () => {
  it('subtracts expenses from MRR', () => {
    expect(calculateNet(2963, 2097)).toBe(866)
  })
})

describe('calculateMargin', () => {
  it('calculates margin percentage', () => {
    const result = calculateMargin(866, 2963)
    expect(result).toBeCloseTo(29.2, 1)
  })

  it('returns 0 for zero MRR', () => {
    expect(calculateMargin(0, 0)).toBe(0)
  })
})

describe('calculateConcentrationRisk', () => {
  it('identifies American Outlet as top client at ~32%', () => {
    const risk = calculateConcentrationRisk(seedClients)
    expect(risk.topClient?.name).toBe('American Outlet')
    expect(risk.percentage).toBeCloseTo(32.1, 1)
    expect(risk.level).toBe('danger')
  })

  it('returns safe for low concentration', () => {
    const balanced = [
      makeClient({ id: '1', monthly_amount: 100 }),
      makeClient({ id: '2', monthly_amount: 100 }),
      makeClient({ id: '3', monthly_amount: 100 }),
      makeClient({ id: '4', monthly_amount: 100 }),
      makeClient({ id: '5', monthly_amount: 100 }),
      makeClient({ id: '6', monthly_amount: 100 }),
    ]
    // top = 100, total = 600, percentage = 16.6% → safe
    const risk = calculateConcentrationRisk(balanced)
    expect(risk.level).toBe('safe')
  })

  it('returns null for empty clients', () => {
    const risk = calculateConcentrationRisk([])
    expect(risk.topClient).toBeNull()
  })
})

describe('calculateAvgTicket', () => {
  it('calculates average correctly', () => {
    const result = calculateAvgTicket(seedClients)
    expect(result).toBeCloseTo(296.3, 0)
  })
})

describe('calculateMedianTicket', () => {
  it('returns correct median', () => {
    const result = calculateMedianTicket(seedClients)
    expect(result).toBe(270)
  })

  it('handles even count', () => {
    const clients = [
      makeClient({ id: '1', monthly_amount: 200 }),
      makeClient({ id: '2', monthly_amount: 400 }),
    ]
    expect(calculateMedianTicket(clients)).toBe(300)
  })
})

describe('getTierBreakdown', () => {
  it('groups clients by tier correctly', () => {
    const breakdown = getTierBreakdown(seedClients)
    const anchor = breakdown.find((t) => t.tier === 'anchor')
    expect(anchor?.count).toBe(1)
    expect(anchor?.total).toBe(950)
    expect(anchor?.percentage).toBeCloseTo(32.1, 1)
  })
})

describe('calculateTotalCost', () => {
  it('applies 1.4x for payroll', () => {
    expect(calculateTotalCost(1000, 'payroll')).toBe(1400)
  })

  it('no multiplier for services', () => {
    expect(calculateTotalCost(1000, 'services')).toBe(1000)
  })

  it('no multiplier for contractor', () => {
    expect(calculateTotalCost(1000, 'contractor')).toBe(1000)
  })
})

describe('calculateRequiredMRR', () => {
  it('calculates required MRR with 30% target margin', () => {
    const result = calculateRequiredMRR(2097, 1400)
    expect(result).toBeCloseTo(4995.7, 0)
  })
})

describe('calculateGap', () => {
  it('returns difference when MRR is below required', () => {
    expect(calculateGap(4996, 2963)).toBeCloseTo(2033, 0)
  })

  it('returns 0 when MRR exceeds required', () => {
    expect(calculateGap(2000, 3000)).toBe(0)
  })
})

describe('calculateHireStatus', () => {
  it('returns ready when gap is 0', () => {
    expect(calculateHireStatus(0)).toBe('ready')
  })

  it('returns close for gap < 500', () => {
    expect(calculateHireStatus(499)).toBe('close')
  })

  it('returns far for gap >= 500', () => {
    expect(calculateHireStatus(500)).toBe('far')
  })
})

describe('calculateAdROI', () => {
  it('calculates ad ROI correctly', () => {
    const result = calculateAdROI({
      budget: 450,
      cpl: 30,
      closeRate: 10,
      avgTicket: 296,
      retentionMonths: 12,
    })
    expect(result.leads).toBe(15)
    expect(result.clients).toBe(1.5)
    expect(result.cac).toBe(300)
    expect(result.ltv).toBe(3552)
    expect(result.ltvCacRatio).toBe(11.8)
    expect(result.ratioLevel).toBe('excellent')
  })

  it('handles zero budget gracefully', () => {
    const result = calculateAdROI({
      budget: 0,
      cpl: 30,
      closeRate: 10,
      avgTicket: 296,
      retentionMonths: 12,
    })
    expect(result.leads).toBe(0)
    expect(result.clients).toBe(0)
  })
})
