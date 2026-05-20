import { getExpenses, getGeneralExpensesForMonth } from '@/lib/silver/queries'
import { GastosView } from '@/components/silver/gastos-view'
import { GeneralExpenses } from '@/components/silver/general-expenses'
import { Topbar } from '@/components/silver/topbar'

function currentMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default async function GastosPage() {
  const month = currentMonthISO()
  const [expenses, generalExpenses] = await Promise.all([
    getExpenses(),
    getGeneralExpensesForMonth(month),
  ])

  return (
    <div className="flex flex-col gap-5">
      <Topbar />
      <GastosView expenses={expenses} />
      <GeneralExpenses expenses={generalExpenses} month={month} />
    </div>
  )
}
