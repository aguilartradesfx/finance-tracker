import { getClients, getExpenses, getMonthlyGoals, getIncomeEntriesForMonth, ensureNextThreeMonthsGoals } from '@/lib/silver/queries'
import {
  calculateMRR,
  calculateExpenses,
  calculateNet,
  calculateMargin,
  calculateConcentrationRisk,
  calculateAvgTicket,
  calculateMedianTicket,
  getTierBreakdown,
} from '@/lib/silver/calculations'
import { formatMoney, formatPercent, monthLabelES } from '@/lib/silver/format'

import { Topbar } from '@/components/silver/topbar'
import { Card, CardHeader, CardBody } from '@/components/silver/card'
import { KpiHero } from '@/components/silver/kpi-hero'
import { KpiMetric } from '@/components/silver/kpi-metric'
import { ClientRow } from '@/components/silver/client-row'
import { TierBar } from '@/components/silver/tier-bar'
import { HireCalculator } from '@/components/silver/hire-calculator'
import { ProjectionChart } from '@/components/silver/projection-chart'
import { AdRoiCalculator } from '@/components/silver/ad-roi-calculator'

const SPARK_BARS = [
  { height: 40 }, { height: 45 }, { height: 50 }, { height: 55 },
  { height: 58 }, { height: 62 }, { height: 68 }, { height: 72 },
  { height: 78 }, { height: 82 }, { height: 88 },
  { height: 100, active: true },
]

function currentMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default async function PanelPage() {
  const month = currentMonthISO()
  const [clients, expenses, incomeEntries] = await Promise.all([
    getClients(),
    getExpenses(),
    getIncomeEntriesForMonth(month),
  ])

  const activeClients = clients.filter((c) => c.status === 'active')
  const mrr = calculateMRR(clients)
  const totalExpenses = calculateExpenses(expenses)
  const net = calculateNet(mrr, totalExpenses)
  const margin = calculateMargin(net, mrr)
  const concentration = calculateConcentrationRisk(clients)
  const avgTicket = calculateAvgTicket(clients)
  const medianTicket = calculateMedianTicket(clients)
  const maxTicket = Math.max(...activeClients.map((c) => c.monthly_amount), 0)
  const tierBreakdown = getTierBreakdown(clients)

  const catTotals = expenses
    .filter((e) => e.active)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.monthly_amount
      return acc
    }, {})
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]
  const topCatLabel = topCat ? `${Math.round((topCat[1] / totalExpenses) * 100)}% ${topCat[0]}` : ''
  const activeExpensesCount = expenses.filter((e) => e.active).length

  const top5 = activeClients.slice(0, 5)
  const extraIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = mrr + extraIncome
  const totalNet = totalIncome - totalExpenses

  await ensureNextThreeMonthsGoals(mrr)
  const goals = await getMonthlyGoals()

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @media (max-width: 767px) {
          .pn-hero    { grid-template-columns: repeat(2, 1fr) !important; }
          .pn-metrics { grid-template-columns: repeat(2, 1fr) !important; }
          .pn-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Topbar />

      {/* ── Hero row ────────────────────────── */}
      <div className="pn-hero grid gap-4" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}>
        <KpiHero
          label="Ingresos totales"
          value={totalIncome}
          indicatorVariant={totalNet >= 0 ? 'profit' : 'loss'}
          valueVariant="default"
          sparkBars={SPARK_BARS}
          large
          subtitle={extraIncome > 0 ? `MRR $${formatMoney(mrr)} + $${formatMoney(extraIncome)} extras` : `Solo MRR este mes`}
        />
        <KpiHero
          label="Ingresos · MRR"
          value={mrr}
          indicatorVariant="bright"
        />
        <KpiHero
          label="Gastos fijos"
          value={totalExpenses}
          indicatorVariant="dim"
          subtitle={`${activeExpensesCount} conceptos · ${topCatLabel}`}
        />
        <KpiHero
          label="Neto mensual"
          value={net}
          indicatorVariant="bright"
          valueVariant="bright"
          subtitle={`Margen del ${formatPercent(margin)} · ${net > 0 ? 'sobre el equilibrio' : 'bajo el equilibrio'}`}
        />
      </div>

      {/* ── Metrics row ─────────────────────── */}
      <div className="pn-metrics grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiMetric
          label="Margen"
          value={formatPercent(margin)}
          pill="Objetivo 35%"
          subtitle={margin >= 35 ? 'En objetivo ✓' : 'Sub-óptimo · escalar precios'}
        />
        <KpiMetric
          label="Concentración"
          value={formatPercent(concentration.percentage)}
          alertPill={concentration.level !== 'safe' ? 'Riesgo' : undefined}
          pill={concentration.level === 'safe' ? 'OK' : undefined}
          alertSubtitle={
            concentration.level !== 'safe' && concentration.topClient
              ? concentration.topClient.name
              : undefined
          }
          subtitle={
            concentration.level === 'safe' && concentration.topClient
              ? concentration.topClient.name
              : undefined
          }
          isAlert={concentration.level !== 'safe'}
        />
        <KpiMetric
          label="Clientes activos"
          value={activeClients.length}
          pill={`${activeClients.length} total`}
          subtitle="0 churn en 30 días"
        />
        <KpiMetric
          label="Ticket promedio"
          value={`$${formatMoney(Math.round(avgTicket))}`}
          subtitle={`Mediana $${formatMoney(medianTicket)} · max $${formatMoney(maxTicket)}`}
        />
      </div>

      {/* ── Proyección ──────────────────────── */}
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
          <CardBody className="pl-4 sm:pl-8">
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
                          className="absolute -left-4 top-3 bottom-3 w-[3px] rounded-full sm:-left-6"
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

      {/* ── Two column: Top clientes + Tier ─── */}
      <div className="pn-two-col grid gap-5" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <Card>
          <CardHeader
            title="Top clientes"
            dot="solid"
            meta={`Por MRR · ${activeClients.length} totales`}
          >
            <a
              href="/clientes"
              className="font-space text-[11px] font-medium text-[var(--text-mute)] transition-colors hover:text-[var(--text)]"
              style={{ letterSpacing: '0.02em' }}
            >
              Ver todos →
            </a>
          </CardHeader>
          <CardBody>
            {top5.map((client, i) => (
              <ClientRow
                key={client.id}
                client={client}
                rank={i + 1}
                totalMRR={mrr}
              />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Distribución por tier" dot="ring" meta="Mensual" />
          <CardBody>
            {tierBreakdown.map((t) => (
              <TierBar key={t.tier} breakdown={t} />
            ))}
          </CardBody>
        </Card>
      </div>

      {/* ── Hire calculator ─────────────────── */}
      <HireCalculator
        currentMRR={mrr}
        currentExpenses={totalExpenses}
        avgTicket={avgTicket}
      />

      {/* ── Ad ROI ──────────────────────────── */}
      <AdRoiCalculator defaultAvgTicket={Math.round(avgTicket)} />
    </div>
  )
}
