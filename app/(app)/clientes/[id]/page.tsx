import { notFound } from 'next/navigation'
import { getClientById, getClients } from '@/lib/silver/queries'
import { calculateMRR } from '@/lib/silver/calculations'
import { formatMoney } from '@/lib/silver/format'
import { Topbar } from '@/components/silver/topbar'
import { ClientDetailView } from '@/components/silver/client-detail-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params
  const [client, allClients] = await Promise.all([getClientById(id), getClients()])

  if (!client) notFound()

  const totalMRR = calculateMRR(allClients)

  return (
    <div className="flex flex-col gap-5">
      <Topbar />
      <ClientDetailView client={client} totalMRR={totalMRR} />
    </div>
  )
}
