-- Mixology Phase 1 cocktail catalogue.
-- Published cocktails must contain every field required by the detail page.

create table if not exists public.cocktails (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  short_description text not null check (length(trim(short_description)) > 0),

  image_url text not null check (length(trim(image_url)) > 0),
  image_alt text not null check (length(trim(image_alt)) > 0),

  taste_title text not null check (length(trim(taste_title)) > 0),
  taste_description text not null check (length(trim(taste_description)) > 0),
  taste_tags text[] not null default '{}',
  tasting_notes text[] not null default '{}',

  alcohol_intensity smallint not null
    check (alcohol_intensity between 1 and 5),
  alcohol_description text not null
    check (length(trim(alcohol_description)) > 0),

  history text not null check (length(trim(history)) > 0),
  read_aloud text not null check (length(trim(read_aloud)) > 0),
  occasions text[] not null default '{}',

  popularity_score integer not null default 0
    check (popularity_score >= 0),
  is_featured boolean not null default false,
  is_published boolean not null default false,

  source_name text,
  source_url text,
  image_source_url text,
  image_attribution text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint published_cocktail_requires_complete_detail check (
    not is_published
    or (
      cardinality(taste_tags) > 0
      and cardinality(tasting_notes) > 0
      and cardinality(occasions) > 0
      and length(trim(history)) > 0
      and length(trim(read_aloud)) > 0
      and length(trim(image_url)) > 0
      and length(trim(image_alt)) > 0
    )
  )
);

create table if not exists public.cocktail_ingredients (
  id bigint generated always as identity primary key,

  cocktail_id uuid not null
    references public.cocktails(id)
    on delete cascade,

  ingredient_name text not null
    check (length(trim(ingredient_name)) > 0),
  amount numeric check (amount is null or amount > 0),
  unit text,
  preparation_note text,

  is_optional boolean not null default false,
  is_garnish boolean not null default false,
  sort_order integer not null check (sort_order > 0),

  unique (cocktail_id, sort_order)
);

create index if not exists cocktails_name_idx
  on public.cocktails (name);

create index if not exists cocktails_alcohol_intensity_idx
  on public.cocktails (alcohol_intensity);

create index if not exists cocktails_popularity_idx
  on public.cocktails (popularity_score desc);

create index if not exists cocktails_taste_tags_idx
  on public.cocktails using gin (taste_tags);

create index if not exists cocktails_occasions_idx
  on public.cocktails using gin (occasions);

create index if not exists cocktail_ingredients_cocktail_idx
  on public.cocktail_ingredients (cocktail_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cocktails_set_updated_at on public.cocktails;

create trigger cocktails_set_updated_at
before update on public.cocktails
for each row
execute function public.set_updated_at();

-- Public clients may read published catalogue content. Inserts and updates remain
-- unavailable to anonymous/authenticated clients unless a later migration adds
-- explicit editorial policies. The Express service role bypasses these policies.
alter table public.cocktails enable row level security;
alter table public.cocktail_ingredients enable row level security;

drop policy if exists "Published cocktails are publicly readable"
  on public.cocktails;

create policy "Published cocktails are publicly readable"
  on public.cocktails
  for select
  using (is_published = true);

drop policy if exists "Ingredients of published cocktails are publicly readable"
  on public.cocktail_ingredients;

create policy "Ingredients of published cocktails are publicly readable"
  on public.cocktail_ingredients
  for select
  using (
    exists (
      select 1
      from public.cocktails
      where cocktails.id = cocktail_ingredients.cocktail_id
        and cocktails.is_published = true
    )
  );

