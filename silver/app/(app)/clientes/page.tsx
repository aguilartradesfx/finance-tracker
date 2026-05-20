import { getClients, getMonthlyPaymentsForMonth } from '@/lib/silver/queries'
import { ClientesView } from '@/components/silver/clientes-view'
import { Topbar } from '@/components/silver/topbar'
import type { ClientTier } from '@/lib/silver/types'

interface PageProps {
  searchParams: Promise<{ tier?: string }>
}

const VALID_TIERS: ClientTier[] = ['anchor', 'high', 'mid', 'entry', 'custom']

function currentMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const { tier } = await searchParams
  const initialTier = VALID_TIERS.includes(tier as ClientTier)
    ? (tier as ClientTier)
    : 'all'

  const month = currentMonthISO()
  const [clients, { payments }] = await Promise.all([
    getClients(),
    getMonthlyPaymentsForMonth(month),
  ])

  return (
    <div className="flex flex-col gap-5">
      <Topbar />
      <ClientesView clients={clients} initialTier={initialTier} payments={payments} />
    </div>
  )
}
