import { getClients, getExpenses } from '@/lib/silver/queries'
import {
  calculateMRR,
  calculateExpenses,
  calculateAvgTicket,
  isActiveNow,
} from '@/lib/silver/calculations'
import { formatMoney } from '@/lib/silver/format'
import { Topbar } from '@/components/silver/topbar'
import { HireCalculator } from '@/components/silver/hire-calculator'
import { KpiMetric } from '@/components/silver/kpi-metric'

export default async function ContratacionPage() {
  const [clients, expenses] = await Promise.all([getClients(), getExpenses()])

  const mrr = calculateMRR(clients)
  const totalExpenses = calculateExpenses(expenses)
  const avgTicket = calculateAvgTicket(clients)
  const activeClients = clients.filter((c) => isActiveNow(c)).length

  return (
    <div className="flex flex-col gap-5">
      <Topbar />

      {/* Context KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiMetric
          label="MRR actual"
          value={`$${formatMoney(mrr)}`}
          subtitle="Base de cálculo"
        />
        <KpiMetric
          label="Gastos fijos"
          value={`$${formatMoney(totalExpenses)}`}
          subtitle="Costo base mensual"
        />
        <KpiMetric
          label="Ticket promedio"
          value={`$${formatMoney(Math.round(avgTicket))}`}
          subtitle={`${activeClients} clientes activos`}
        />
      </div>

      {/* Full hire calculator */}
      <HireCalculator
        currentMRR={mrr}
        currentExpenses={totalExpenses}
        avgTicket={avgTicket}
      />
    </div>
  )
}
