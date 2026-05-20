import { getMonthlyGoals } from '@/lib/silver/queries'
import { formatMoney, monthLabelES } from '@/lib/silver/format'
import { Topbar } from '@/components/silver/topbar'
import { Card, CardHeader, CardBody } from '@/components/silver/card'

export default async function ConfiguracionPage() {
  const goals = await getMonthlyGoals()

  return (
    <div className="flex flex-col gap-5">
      <Topbar />

      {/* Page header */}
      <div className="mb-1">
        <h1
          className="font-space text-[22px] font-semibold text-[var(--text)]"
          style={{ letterSpacing: '-0.02em' }}
        >
          Configuración
        </h1>
        <p className="mt-0.5 text-[13px] text-[var(--text-mute)]">
          Parámetros y metas del panel
        </p>
      </div>

      {/* Monthly goals */}
      <Card>
        <CardHeader title="Metas mensuales" dot="solid" meta="Próximos 3 meses" />
        <CardBody>
          {goals.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-[var(--text-mute)]">
              No hay metas configuradas
            </p>
          ) : (
            <div className="flex flex-col gap-0">
              {/* Header */}
              <div
                className="grid border-b pb-3 font-space text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-mute)]"
                style={{
                  gridTemplateColumns: '80px 1fr 110px 70px 90px',
                  gap: 16,
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <span>Mes</span>
                <span>Narrativa</span>
                <span className="text-right">Meta MRR</span>
                <span className="text-right">Clientes</span>
                <span className="text-right">Ad spend</span>
              </div>

              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="grid border-b py-[14px] last:border-b-0"
                  style={{
                    gridTemplateColumns: '80px 1fr 110px 70px 90px',
                    gap: 16,
                    borderColor: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <span className="font-space text-[14px] font-semibold text-[var(--text)]">
                    {monthLabelES(goal.month)}
                  </span>
                  <span className="text-[13px] text-[var(--text-soft)]">
                    {goal.narrative ?? '—'}
                  </span>
                  <span className="text-right font-space text-[14px] font-semibold tabular text-[var(--text)]">
                    ${formatMoney(goal.mrr_target)}
                  </span>
                  <span className="text-right font-space text-[14px] tabular text-[var(--text-mute)]">
                    {goal.new_clients_target > 0 ? `+${goal.new_clients_target}` : '—'}
                  </span>
                  <span className="text-right font-space text-[14px] tabular text-[var(--text-mute)]">
                    {goal.ad_spend_budget > 0 ? `$${formatMoney(goal.ad_spend_budget)}` : '$0'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* App info */}
      <Card>
        <CardHeader title="Información" dot="dim" />
        <CardBody>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Versión', value: 'Silver 1.0' },
              { label: 'Base de datos', value: 'Supabase (PostgreSQL)' },
              { label: 'Margen objetivo', value: '30%' },
              { label: 'Moneda', value: 'USD' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-[13px] text-[var(--text-mute)]">{label}</span>
                <span className="font-space text-[13px] font-medium text-[var(--text)]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
