-- Shelf Scout multi-country schema
create table if not exists countries (
  id text primary key,
  name text not null,
  code text not null unique,
  currency text not null,
  created_at timestamptz default now()
);

create table if not exists regions (
  id text primary key,
  country_id text not null references countries(id) on delete cascade,
  name text not null,
  slug text not null,
  lat numeric not null,
  lng numeric not null,
  tier text not null default 'sensing',
  waitlist_count integer not null default 0,
  launch_readiness integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  region_id text not null references regions(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists stores (
  id text primary key,
  region_id text not null references regions(id) on delete cascade,
  city text,
  name text not null,
  location text,
  created_at timestamptz default now()
);

create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  image_url text,
  unit text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists prices (
  product_id text not null references products(id) on delete cascade,
  store_id text not null references stores(id) on delete cascade,
  price numeric not null,
  gct_tag text,
  created_at timestamptz default now(),
  primary key (product_id, store_id)
);

create table if not exists signups (
  id uuid primary key default gen_random_uuid(),
  region_id text not null references regions(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz default now()
);

create index if not exists idx_regions_country_id on regions(country_id);
create index if not exists idx_cities_region_id on cities(region_id);
create index if not exists idx_stores_region_id on stores(region_id);
create index if not exists idx_prices_store_id on prices(store_id);
create index if not exists idx_signups_region_id on signups(region_id);
