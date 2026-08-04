-- OpenGym: multi-gym inventory + cash register schema

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('admin', 'manager', 'cashier');
create type payment_method as enum ('cash', 'card', 'transfer');
create type stock_movement_type as enum ('sale', 'adjustment', 'purchase', 'return');
create type cash_movement_type as enum ('in', 'out');
create type session_status as enum ('open', 'closed');

-- Organizations (gym owner account)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Gyms (locations)
create table gyms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  address text,
  timezone text not null default 'America/Bogota',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_gyms_organization_id on gyms(organization_id);

-- User ↔ gym membership (roles per location)
create table user_gym_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gym_id uuid not null references gyms(id) on delete cascade,
  role user_role not null default 'cashier',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, gym_id)
);

create index idx_memberships_user_id on user_gym_memberships(user_id);
create index idx_memberships_gym_id on user_gym_memberships(gym_id);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  name text not null,
  sku text,
  description text,
  price_cents integer not null check (price_cents >= 0),
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gym_id, sku)
);

create index idx_products_gym_id on products(gym_id);
create index idx_products_gym_active on products(gym_id, active);

-- Stock movements (audit trail)
create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity <> 0),
  movement_type stock_movement_type not null,
  reason text,
  reference_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index idx_stock_movements_gym_id on stock_movements(gym_id);
create index idx_stock_movements_product_id on stock_movements(product_id);

-- Cash register sessions
create table cash_register_sessions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  opened_by uuid not null references auth.users(id),
  opened_at timestamptz not null default now(),
  opening_cash_cents integer not null default 0 check (opening_cash_cents >= 0),
  closed_by uuid references auth.users(id),
  closed_at timestamptz,
  expected_cash_cents integer,
  counted_cash_cents integer,
  variance_cents integer,
  notes text,
  status session_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sessions_gym_status on cash_register_sessions(gym_id, status);

-- Only one open session per gym at a time
create unique index idx_one_open_session_per_gym
  on cash_register_sessions(gym_id)
  where status = 'open';

-- Sales
create table sales (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  session_id uuid not null references cash_register_sessions(id) on delete restrict,
  total_cents integer not null check (total_cents >= 0),
  payment_method payment_method not null,
  sold_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index idx_sales_gym_id on sales(gym_id);
create index idx_sales_session_id on sales(session_id);
create index idx_sales_created_at on sales(gym_id, created_at desc);

-- Sale line items
create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  created_at timestamptz not null default now()
);

create index idx_sale_items_sale_id on sale_items(sale_id);

-- Manual cash in/out during a session
create table cash_movements (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  session_id uuid not null references cash_register_sessions(id) on delete restrict,
  amount_cents integer not null check (amount_cents <> 0),
  movement_type cash_movement_type not null,
  reason text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index idx_cash_movements_session_id on cash_movements(session_id);

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at before update on organizations
  for each row execute function set_updated_at();
create trigger gyms_updated_at before update on gyms
  for each row execute function set_updated_at();
create trigger memberships_updated_at before update on user_gym_memberships
  for each row execute function set_updated_at();
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger sessions_updated_at before update on cash_register_sessions
  for each row execute function set_updated_at();

-- Helper: gyms the current user belongs to
create or replace function public.user_gym_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select gym_id from user_gym_memberships where user_id = auth.uid();
$$;

-- Helper: check role at gym
create or replace function public.user_has_gym_role(p_gym_id uuid, p_roles user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from user_gym_memberships
    where user_id = auth.uid()
      and gym_id = p_gym_id
      and role = any(p_roles)
  );
$$;

-- RPC: adjust stock
create or replace function public.adjust_product_stock(
  p_product_id uuid,
  p_quantity integer,
  p_movement_type stock_movement_type,
  p_reason text default null
)
returns products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product products;
  v_new_qty integer;
begin
  select * into v_product from products where id = p_product_id for update;

  if v_product.id is null then
    raise exception 'Product not found';
  end if;

  if not user_has_gym_role(v_product.gym_id, array['admin', 'manager']::user_role[]) then
    raise exception 'Insufficient permissions';
  end if;

  v_new_qty := v_product.stock_quantity + p_quantity;
  if v_new_qty < 0 then
    raise exception 'Insufficient stock';
  end if;

  update products set stock_quantity = v_new_qty where id = p_product_id
  returning * into v_product;

  insert into stock_movements (gym_id, product_id, quantity, movement_type, reason, created_by)
  values (v_product.gym_id, p_product_id, p_quantity, p_movement_type, p_reason, auth.uid());

  return v_product;
end;
$$;

-- RPC: create sale (atomic)
create or replace function public.create_sale(
  p_session_id uuid,
  p_payment_method payment_method,
  p_items jsonb
)
returns sales
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session cash_register_sessions;
  v_sale sales;
  v_item jsonb;
  v_product products;
  v_qty integer;
  v_unit_price integer;
  v_subtotal integer;
  v_total integer := 0;
begin
  select * into v_session from cash_register_sessions where id = p_session_id for update;

  if v_session.id is null then
    raise exception 'Session not found';
  end if;

  if v_session.status <> 'open' then
    raise exception 'Cash register session is not open';
  end if;

  if not user_has_gym_role(v_session.gym_id, array['admin', 'manager', 'cashier']::user_role[]) then
    raise exception 'Insufficient permissions';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Sale must have at least one item';
  end if;

  -- Validate stock and compute total
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products
    where id = (v_item->>'product_id')::uuid and gym_id = v_session.gym_id and active = true
    for update;

    if v_product.id is null then
      raise exception 'Product not found or inactive';
    end if;

    v_qty := (v_item->>'quantity')::integer;
    if v_qty <= 0 then
      raise exception 'Invalid quantity';
    end if;

    if v_product.stock_quantity < v_qty then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;

    v_unit_price := v_product.price_cents;
    v_subtotal := v_unit_price * v_qty;
    v_total := v_total + v_subtotal;
  end loop;

  insert into sales (gym_id, session_id, total_cents, payment_method, sold_by)
  values (v_session.gym_id, p_session_id, v_total, p_payment_method, auth.uid())
  returning * into v_sale;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products
    where id = (v_item->>'product_id')::uuid and gym_id = v_session.gym_id
    for update;

    v_qty := (v_item->>'quantity')::integer;
    v_unit_price := v_product.price_cents;
    v_subtotal := v_unit_price * v_qty;

    insert into sale_items (sale_id, product_id, quantity, unit_price_cents, subtotal_cents)
    values (v_sale.id, v_product.id, v_qty, v_unit_price, v_subtotal);

    update products set stock_quantity = stock_quantity - v_qty where id = v_product.id;

    insert into stock_movements (gym_id, product_id, quantity, movement_type, reason, reference_id, created_by)
    values (v_session.gym_id, v_product.id, -v_qty, 'sale', 'POS sale', v_sale.id, auth.uid());
  end loop;

  return v_sale;
end;
$$;

-- RPC: close cash register session
create or replace function public.close_cash_register_session(
  p_session_id uuid,
  p_counted_cash_cents integer,
  p_notes text default null
)
returns cash_register_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session cash_register_sessions;
  v_cash_sales integer;
  v_cash_in integer;
  v_cash_out integer;
  v_expected integer;
begin
  select * into v_session from cash_register_sessions where id = p_session_id for update;

  if v_session.id is null then
    raise exception 'Session not found';
  end if;

  if v_session.status <> 'open' then
    raise exception 'Session is already closed';
  end if;

  if not user_has_gym_role(v_session.gym_id, array['admin', 'manager']::user_role[]) then
    raise exception 'Insufficient permissions to close register';
  end if;

  select coalesce(sum(total_cents), 0) into v_cash_sales
  from sales where session_id = p_session_id and payment_method = 'cash';

  select coalesce(sum(amount_cents), 0) into v_cash_in
  from cash_movements where session_id = p_session_id and movement_type = 'in';

  select coalesce(sum(amount_cents), 0) into v_cash_out
  from cash_movements where session_id = p_session_id and movement_type = 'out';

  v_expected := v_session.opening_cash_cents + v_cash_sales + v_cash_in - v_cash_out;

  update cash_register_sessions set
    status = 'closed',
    closed_by = auth.uid(),
    closed_at = now(),
    expected_cash_cents = v_expected,
    counted_cash_cents = p_counted_cash_cents,
    variance_cents = p_counted_cash_cents - v_expected,
    notes = p_notes
  where id = p_session_id
  returning * into v_session;

  return v_session;
end;
$$;

-- RLS
alter table organizations enable row level security;
alter table gyms enable row level security;
alter table user_gym_memberships enable row level security;
alter table products enable row level security;
alter table stock_movements enable row level security;
alter table cash_register_sessions enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table cash_movements enable row level security;

-- Organizations: users see orgs for their gyms
create policy "users_view_own_organizations" on organizations for select
  using (id in (select g.organization_id from gyms g where g.id in (select user_gym_ids())));

-- Gyms
create policy "users_view_own_gyms" on gyms for select
  using (id in (select user_gym_ids()));

create policy "admins_manage_gyms" on gyms for all
  using (user_has_gym_role(id, array['admin']::user_role[]))
  with check (user_has_gym_role(id, array['admin']::user_role[]));

-- Memberships
create policy "users_view_gym_memberships" on user_gym_memberships for select
  using (gym_id in (select user_gym_ids()));

-- Products
create policy "users_view_products" on products for select
  using (gym_id in (select user_gym_ids()));

create policy "managers_manage_products" on products for insert
  with check (user_has_gym_role(gym_id, array['admin', 'manager']::user_role[]));

create policy "managers_update_products" on products for update
  using (user_has_gym_role(gym_id, array['admin', 'manager']::user_role[]))
  with check (user_has_gym_role(gym_id, array['admin', 'manager']::user_role[]));

-- Stock movements (read only via API; writes via RPC)
create policy "users_view_stock_movements" on stock_movements for select
  using (gym_id in (select user_gym_ids()));

-- Sessions
create policy "users_view_sessions" on cash_register_sessions for select
  using (gym_id in (select user_gym_ids()));

create policy "staff_open_sessions" on cash_register_sessions for insert
  with check (user_has_gym_role(gym_id, array['admin', 'manager', 'cashier']::user_role[]));

create policy "managers_update_sessions" on cash_register_sessions for update
  using (user_has_gym_role(gym_id, array['admin', 'manager']::user_role[]))
  with check (user_has_gym_role(gym_id, array['admin', 'manager']::user_role[]));

-- Sales
create policy "users_view_sales" on sales for select
  using (gym_id in (select user_gym_ids()));

create policy "staff_insert_sales" on sales for insert
  with check (user_has_gym_role(gym_id, array['admin', 'manager', 'cashier']::user_role[]));

-- Sale items
create policy "users_view_sale_items" on sale_items for select
  using (sale_id in (select id from sales where gym_id in (select user_gym_ids())));

create policy "staff_insert_sale_items" on sale_items for insert
  with check (sale_id in (select id from sales where gym_id in (select user_gym_ids())));

-- Cash movements
create policy "users_view_cash_movements" on cash_movements for select
  using (gym_id in (select user_gym_ids()));

create policy "managers_manage_cash_movements" on cash_movements for insert
  with check (user_has_gym_role(gym_id, array['admin', 'manager']::user_role[]));
