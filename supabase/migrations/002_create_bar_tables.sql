-- Mixology Phase 1 bar catalogue.
-- Cocktail relationships intentionally remain outside this table and will be
-- introduced by 003_create_bar_cocktail_relationships.sql.

create table if not exists public.bars (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  short_description text,

  image_url text,
  image_alt text,

  vibe text,
  area text,
  address_line text,
  latitude numeric(9, 6)
    check (latitude is null or latitude between -90 and 90),
  longitude numeric(9, 6)
    check (longitude is null or longitude between -180 and 180),

  website_url text,
  menu_url text,
  reservation_url text,

  is_featured boolean not null default false,
  is_published boolean not null default false,
  is_permanently_closed boolean not null default false,

  source_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bars_name_idx
  on public.bars (name);

create index if not exists bars_area_idx
  on public.bars (area);

create index if not exists bars_vibe_idx
  on public.bars (vibe);

create index if not exists bars_public_catalogue_idx
  on public.bars (is_featured desc, name)
  where is_published = true
    and is_permanently_closed = false;

-- public.set_updated_at() is created by 001_create_cocktail_tables.sql.
drop trigger if exists bars_set_updated_at on public.bars;

create trigger bars_set_updated_at
before update on public.bars
for each row
execute function public.set_updated_at();

-- Anonymous and signed-in public clients can only read bars that are both
-- published and currently open. No public mutation policies are created.
alter table public.bars enable row level security;

drop policy if exists "Published open bars are publicly readable"
  on public.bars;

create policy "Published open bars are publicly readable"
  on public.bars
  for select
  to anon, authenticated
  using (
    is_published = true
    and is_permanently_closed = false
  );
