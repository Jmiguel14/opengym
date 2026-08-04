-- Demo seed data for OpenGym (Ecuador)
-- Run AFTER migrations and AFTER creating your first auth user.
--
-- Currency: USD (US Dollar)
-- Ecuador uses the US dollar as its official currency. All monetary values in
-- this app are stored as integer cents (e.g. 350 = $3.50 USD).
--
-- Replace YOUR_USER_ID_HERE when linking your admin user.

-- Organization & gym
insert into organizations (id, name)
values ('11111111-1111-1111-1111-111111111111', 'OpenGym Group')
on conflict (id) do nothing;

insert into gyms (id, organization_id, name, address, timezone)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'OpenGym',
  'Calle 12, Av 24',
  'America/Guayaquil'
)
on conflict (id) do nothing;

-- Link your user (replace YOUR_USER_ID_HERE)
-- insert into user_gym_memberships (user_id, gym_id, role)
-- values ('YOUR_USER_ID_HERE', '22222222-2222-2222-2222-222222222222', 'admin');

-- Sample products — prices in USD cents (price_cents / 100 = dollars)
--                    name                          sku         price  cost   stock
insert into products (gym_id, name, sku, price_cents, cost_cents, stock_quantity, min_stock) values
  ('22222222-2222-2222-2222-222222222222', 'Batido de proteina',              'SHAKE-001',  250, 150,  50, 10),  -- $5.00 / cost $2.50
  ('22222222-2222-2222-2222-222222222222', 'Barra',                      'BAR-001',    150,   75, 100, 20),  -- $1.50 / cost $0.75
  ('22222222-2222-2222-2222-222222222222', 'Botella de Agua (Open)',     'WATER-001',   50,   25, 200, 30),  -- $0.50 / cost $0.25
  ('22222222-2222-2222-2222-222222222222', 'Power',                      'POWER-001',  250,  120,  25,  5),  -- $2.50 / cost $1.20
  ('22222222-2222-2222-2222-222222222222', 'Botella de agua (Grande)',   'WATER-002',  100,   50, 999,  0),  -- $1.00 / cost $0.50
  ('22222222-2222-2222-2222-222222222222', 'Avena',                      'AVENA-001',  350,  200,  15,  3)   -- $3.50 / cost $2.00
on conflict do nothing;
