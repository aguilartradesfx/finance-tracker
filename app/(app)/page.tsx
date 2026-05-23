import {
  getClients,
  getExpenses,
  getMonthlyGoals,
  getMonthlyPaymentsForMonth,
  getIncomeEntriesForMonth,
  ensureNextThreeMonthsGoals,
} from '@/lib/silver/queries'
import {
  calculateMRR,
  calculateCollectedMRR,
  calculateExpenses,
  calculateMargin,
  isActiveNow,
  isFutureClient,
} from '@/lib/silver/calculations'
import { formatMoney, formatPercent, monthLabelES } from '@/lib/silver/format'

import { Topbar } from '@/components/silver/topbar'
import { Card, CardHeader, CardBody } from '@/components/silver/card'
import { KpiHero } from '@/components/silver/kpi-hero'
import { CobroBoard } from '@/components/silver/cobro-board'
import { UpcomingClients } from '@/components/silver/upcoming-clients'
import { IncomeEntries } from '@/components/silver/income-entries'
import { ProjectionChart } from '@/components/silver/projection-chart'

function currentMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default async function InicioPage() {
  const month = currentMonthISO()

  const [allClients, expenses, { payments, tableExists }, incomeEntries] = await Promise.all([
    getClients(),
    getExpenses(),
    getMonthlyPaymentsForMonth(month),
    getIncomeEntriesForMonth(month),
  ])

  const mrr = calculateMRR(allClients)
  const collectedMRR = calculateCollectedMRR(allClients, payments)
  const totalExpenses = calculateExpenses(expenses)
  const extraIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)

  const expectedIncome = mrr + extraIncome
  const collectedIncome = collectedMRR + extraIncome
  const collectedNet = collectedIncome - totalExpenses
  const margin = calculateMargin(collectedNet, collectedIncome)
  const mrrCollectedPct = mrr > 0 ? (collectedMRR / mrr) * 100 : 0
  const expectedCollectedPct = expectedIncome > 0 ? (collectedIncome / expectedIncome) * 100 : 0
  const activeExpensesCount = expenses.filter((e) => e.active).length

  await ensureNextThreeMonthsGoals(mrr)
  const goals = await getMonthlyGoals()

  const activeClients = allClients.filter((c) => isActiveNow(c))
  const upcomingClients = allClients.filter((c) => c.status === 'active' && isFutureClient(c))

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @media (max-width: 767px) {
          .home-hero { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      <Topbar />

      {/* ── Hero row ────────────────────────── */}
      <div className="home-hero grid gap-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiHero
          label="Cashflow"
          value={collectedIncome}
          indicatorVariant={collectedNet >= 0 ? 'profit' : 'loss'}
          subtitle={`${expectedCollectedPct.toFixed(0)}% del expectado · cobrado este mes`}
        />
        <KpiHero
          label="Ingreso expectado de este mes"
          value={expectedIncome}
          indicatorVariant="dim"
          subtitle={`MRR $${formatMoney(mrr)} + $${formatMoney(extraIncome)} extras`}
        />
        <KpiHero
          label="Ingresos · MRR"
          value={mrr}
          indicatorVariant="bright"
          subtitle={`Cobrado $${formatMoney(collectedMRR)} · ${mrrCollectedPct.toFixed(0)}%`}
        />
        <KpiHero
          label="Gastos fijos"
          value={totalExpenses}
          indicatorVariant="dim"
          subtitle={`${activeExpensesCount} conceptos`}
        />
        <KpiHero
          label="Neto mensual"
          value={collectedNet}
          indicatorVariant="bright"
          valueVariant="bright"
          subtitle={`Margen del ${formatPercent(margin)} · sobre lo cobrado`}
        />
      </div>

      {/* ── Cobros del mes ──────────────────── */}
      <CobroBoard
        clients={activeClients}
        payments={payments}
        month={month}
        tableExists={tableExists}
      />

      {/* ── Próximos clientes ───────────────── */}
      <UpcomingClients clients={upcomingClients} />

      {/* ── Otros ingresos ──────────────────── */}
      <IncomeEntries entries={incomeEntries} month={month} />

      {/* ── Proyección · 3 meses ────────────── */}
      {goals.length > 0 && (
        <Card className="mb-0">
          <CardHeader
            title="Proyección · 3 meses"
            dot="solid"
            meta={
              goals.length > 1
                ? `Meta $${formatMoney(goals[goals.length - 1].mrr_target)} en ${monthLabelES(goals[goals.length - 1].month)}`
                : 'Editable'
            }
          />
          <CardBody>
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <div style={{ minWidth: 520 }}>
                <div
                  className="grid border-b pb-3 font-space text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-mute)]"
                  style={{ gridTemplateColumns: '70px 1fr 90px 70px 80px 90px', gap: 16, borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <span>Mes</span>
                  <span>Narrativa</span>
                  <span className="text-right">Meta MRR</span>
                  <span className="text-right">Clientes</span>
                  <span className="text-right">Ad spend</span>
                  <span className="text-right">Margen</span>
                </div>
                {goals.map((goal, i) => {
                  const projNet = goal.mrr_target - totalExpenses - goal.ad_spend_budget
                  const isCurrent = i === 0
                  return (
                    <div
                      key={goal.id}
                      className="relative grid border-b py-[14px] last:border-b-0"
                      style={{ gridTemplateColumns: '70px 1fr 90px 70px 80px 90px', gap: 16, borderColor: 'rgba(255,255,255,0.04)' }}
                    >
                      {isCurrent && (
                        <div
                          className="absolute -left-4 top-3 bottom-3 w-[3px] rounded-full"
                          style={{ background: 'linear-gradient(180deg, #ffffff, #a1a1aa)', boxShadow: '0 0 12px var(--glow-soft)' }}
                        />
                      )}
                      <span className="font-space text-[14px] font-semibold text-[var(--text)]">{monthLabelES(goal.month)}</span>
                      <span className="text-[13px] text-[var(--text-soft)]">{goal.narrative ?? '—'}</span>
                      <span className="text-right font-space text-[14px] font-semibold tabular text-[var(--text)]">${formatMoney(goal.mrr_target)}</span>
                      <span className="text-right font-space text-[14px] tabular text-[var(--text-mute)]">{goal.new_clients_target > 0 ? `+${goal.new_clients_target}` : '—'}</span>
                      <span className="text-right font-space text-[14px] tabular text-[var(--text-mute)]">{goal.ad_spend_budget > 0 ? `$${formatMoney(goal.ad_spend_budget)}` : '$0'}</span>
                      <span className="text-right font-space text-[14px] font-semibold tabular text-[var(--text)]">${formatMoney(projNet)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <ProjectionChart goals={goals} breakEven={totalExpenses} />
          </CardBody>
        </Card>
      )}
    </div>
  )
}
