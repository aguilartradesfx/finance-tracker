-- Silver — Seed inicial
-- Ejecutar DESPUÉS de 20260515_initial_schema.sql

-- ─── Clientes ────────────────────────────────────────────────────
insert into clients (name, monthly_amount, tier, category, start_date) values
  ('American Outlet',     950.00, 'anchor', 'retail',            '2025-09-09'),
  ('Ecoviva Desarrollos', 375.00, 'high',   'real estate',       '2025-11-29'),
  ('AO Liquidators',      375.00, 'high',   'retail',            '2025-11-29'),
  ('AO Warehouse',        375.00, 'high',   'retail',            '2025-11-29'),
  ('Nanku',               270.00, 'mid',    'hospitality',       '2025-12-02'),
  ('Hidasol',             270.00, 'mid',    'graphic solutions', '2025-12-15'),
  ('Aleconomies',          87.00, 'entry',  null,                '2026-01-01'),
  ('Travelcore',           87.00, 'entry',  null,                '2026-01-01'),
  ('Zenius',               87.00, 'entry',  null,                '2026-01-01'),
  ('Natural Lodge',        87.00, 'entry',  'hospitality',       '2026-01-01');

-- ─── Gastos fijos ────────────────────────────────────────────────
insert into fixed_expenses (name, monthly_amount, category, scope) values
  ('Renta',          700.00, 'personal',       'personal'),
  ('Auto',           400.00, 'personal',       'personal'),
  ('GHL',            497.00, 'infrastructure', 'bralto'),
  ('Claude',         105.00, 'tools',          'both'),
  ('Zoom',            20.00, 'tools',          'bralto'),
  ('Higgsfield',     100.00, 'tools',          'bralto'),
  ('LinkedIn Agent', 275.00, 'marketing',      'bralto');

-- ─── Meta mayo 2026 ──────────────────────────────────────────────
insert into monthly_goals (month, mrr_target, new_clients_target, ad_spend_budget, narrative) values
  ('2026-05-01', 2963.00, 0, 0.00, 'Base de partida · estado actual');

-- ─── Proyección Q2-Q3 2026 ───────────────────────────────────────
insert into monthly_goals (month, mrr_target, new_clients_target, ad_spend_budget, narrative) values
  ('2026-06-01', 3463.00, 2, 0.00,   'LinkedIn Agent en producción'),
  ('2026-07-01', 4263.00, 3, 450.00, 'Meta Ads piloto · CAC controlado'),
  ('2026-08-01', 5263.00, 4, 600.00, 'Ventana de contratación abierta');
