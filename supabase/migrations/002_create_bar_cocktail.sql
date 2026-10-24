-- One row means a bar serves a cocktail. The singular table name is intentional.
-- Matched to the live public.bars schema on 2026-10-05.
-- Uses the existing live bar table; it does not create or alter bar profiles.
begin;

create table if not exists public.bar_cocktail (
  bar_id uuid not null references public.bars(id) on delete cascade,
  cocktail_id uuid not null references public.cocktails(id) on delete cascade,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (bar_id, cocktail_id)
);

-- The primary key supports bar -> cocktails; this index supports the reverse.
create index if not exists bar_cocktail_cocktail_idx
  on public.bar_cocktail (cocktail_id);

drop trigger if exists bar_cocktail_set_updated_at on public.bar_cocktail;
create trigger bar_cocktail_set_updated_at
before update on public.bar_cocktail
for each row execute function public.set_updated_at();

alter table public.bar_cocktail enable row level security;
drop policy if exists "Published bar cocktail relationships are publicly readable"
  on public.bar_cocktail;
create policy "Published bar cocktail relationships are publicly readable"
  on public.bar_cocktail for select to anon, authenticated
  using (
    is_published = true
    and
    exists (
      select 1 from public.bars
      where bars.id = bar_cocktail.bar_id and bars.is_published = true
        and bars.is_permanently_closed = false
    )
    and exists (
      select 1 from public.cocktails
      where cocktails.id = bar_cocktail.cocktail_id
        and cocktails.is_published = true
    )
  );

-- Public clients can read eligible relationships; writes require the backend.
grant select on public.bar_cocktail to anon, authenticated;
grant all on public.bar_cocktail to service_role;

notify pgrst, 'reload schema';
commit;
