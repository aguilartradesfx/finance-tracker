import {
  getClients,
  getExpenses,
  getMonthlyGoals,
  getMonthlyPaymentsForMonth,
  getIncomeEntriesForMonth,
  ensureNextThreeMonthsGoals,
} from '@/lib/silver/queries'
import { calculateMRR, calculateExpenses } from '@/lib/silver/calculations'
import { formatMoney, monthLabelES } from '@/lib/silver/format'

import { Topbar } from '@/components/silver/topbar'
import { Card, CardHeader, CardBody } from '@/components/silver/card'
import { CobroBoard } from '@/components/silver/cobro-board'
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
  const totalExpenses = calculateExpenses(expenses)

  await ensureNextThreeMonthsGoals(mrr)
  const goals = await getMonthlyGoals()

  const activeClients = allClients.filter((c) => c.status === 'active')

  return (
    <div className="flex flex-col gap-5">
      <Topbar />

      {/* ── Cobros del mes ──────────────────── */}
      <CobroBoard
        clients={activeClients}
        payments={payments}
        month={month}
        tableExists={tableExists}
      />

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
