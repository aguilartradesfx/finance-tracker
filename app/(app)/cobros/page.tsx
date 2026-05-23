import { getClients, getMonthlyPaymentsForMonth, getIncomeEntriesForMonth } from '@/lib/silver/queries'
import { isActiveNow, isFutureClient } from '@/lib/silver/calculations'
import { Topbar } from '@/components/silver/topbar'
import { CobroBoard } from '@/components/silver/cobro-board'
import { UpcomingClients } from '@/components/silver/upcoming-clients'
import { IncomeEntries } from '@/components/silver/income-entries'
import { Card, CardBody } from '@/components/silver/card'

function currentMonthISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

const MIGRATION_SQL = `create table if not exists monthly_payments (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  month        date not null,
  paid_at      timestamptz,
  amount       numeric(10,2),
  notes        text,
  created_at   timestamptz not null default now(),
  unique(client_id, month)
);

alter table monthly_payments enable row level security;

create policy "owner_all" on monthly_payments
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);`

export default async function CobrosPage() {
  const month = currentMonthISO()

  const [allClients, { payments, tableExists }, incomeEntries] = await Promise.all([
    getClients(),
    getMonthlyPaymentsForMonth(month),
    getIncomeEntriesForMonth(month),
  ])

  const clients = allClients.filter((c) => isActiveNow(c))
  const upcomingClients = allClients.filter((c) => c.status === 'active' && isFutureClient(c))

  return (
    <div className="flex flex-col gap-5">
      <Topbar />

      {!tableExists && (
        <Card>
          <CardBody>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 block size-2 shrink-0 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.8)', boxShadow: '0 0 8px rgba(251,191,36,0.4)', marginTop: 6 }}
                />
                <div>
                  <p className="text-[14px] font-medium text-[var(--text)]">
                    Falta crear la tabla <code className="font-space text-[13px]">monthly_payments</code>
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--text-mute)]">
                    Ve a{' '}
                    <a
                      href="https://supabase.com/dashboard/project/ijagfvqsfvfykxaugciu/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[var(--text)]"
                    >
                      Supabase → SQL Editor
                    </a>{' '}
                    y ejecuta el siguiente SQL. Luego recarga esta página.
                  </p>
                </div>
              </div>
              <pre
                className="overflow-x-auto rounded-xl p-4 font-space text-[12px] leading-relaxed text-[var(--text-soft)]"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {MIGRATION_SQL}
              </pre>
            </div>
          </CardBody>
        </Card>
      )}

      <CobroBoard clients={clients} payments={payments} month={month} tableExists={tableExists} />
      <UpcomingClients clients={upcomingClients} />
      <IncomeEntries entries={incomeEntries} month={month} />
    </div>
  )
}
