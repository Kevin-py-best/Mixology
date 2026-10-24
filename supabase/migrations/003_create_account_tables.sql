-- Account credentials remain in Supabase Auth. These tables contain app data.
-- Run as the project database owner through the Supabase SQL Editor or migrations.
begin;

create schema if not exists mixology_private;
revoke all on schema mixology_private from public, anon, authenticated;

create table if not exists public.user_profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  flavor text not null check (flavor in ('Sweet & fruity', 'Sour & refreshing', 'Bitter & bold', 'Smooth & creamy')),
  vibe text not null check (vibe in ('Fun and energetic', 'Chill and easy-going', 'Bold and adventurous', 'Classy and sophisticated')),
  drink_style text not null check (drink_style in ('Light and refreshing', 'Fruity and easy to drink', 'Strong with a noticeable kick', 'Something unique and different')),
  strength smallint not null check (strength between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;

-- Read only your own records. Writes pass through authenticated Supabase Auth
-- operations and the owner-controlled sync trigger below, never a public RPC.
revoke all on public.user_profiles, public.user_preferences from public, anon, authenticated;
grant select on public.user_profiles, public.user_preferences to authenticated;
grant all on public.user_profiles, public.user_preferences to service_role;

drop policy if exists "Read own account profile" on public.user_profiles;
create policy "Read own account profile" on public.user_profiles
  for select to authenticated using ((select auth.uid()) = auth_user_id);

drop policy if exists "Read own taste preferences" on public.user_preferences;
create policy "Read own taste preferences" on public.user_preferences
  for select to authenticated using ((select auth.uid()) = auth_user_id);

create or replace function mixology_private.set_account_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function mixology_private.set_account_updated_at() from public, anon, authenticated;

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at before update on public.user_profiles
  for each row execute function mixology_private.set_account_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at before update on public.user_preferences
  for each row execute function mixology_private.set_account_updated_at();

create or replace function mixology_private.sync_account_data(p_user_id uuid, p_metadata jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  account_name text := '';
  answers jsonb := p_metadata -> 'quiz_answers';
begin
  if (select auth.uid()) is not null and (select auth.uid()) <> p_user_id then
    raise insufficient_privilege using message = 'Cannot sync a different account';
  end if;
  if jsonb_typeof(p_metadata -> 'display_name') = 'string' then
    account_name := left(btrim(p_metadata ->> 'display_name'), 80);
  end if;

  -- Never copy a role from user-editable metadata. Existing admin assignments
  -- made by a trusted backend are preserved when profile details change.
  insert into public.user_profiles (auth_user_id, display_name)
  values (p_user_id, account_name)
  on conflict (auth_user_id) do update set display_name = excluded.display_name
  where public.user_profiles.display_name is distinct from excluded.display_name;

  -- Invalid or incomplete legacy quiz data does not prevent account creation.
  -- A missing quiz leaves the user without a preferences row until completion.
  if jsonb_typeof(answers) = 'object'
    and answers ->> 'flavor' in ('Sweet & fruity', 'Sour & refreshing', 'Bitter & bold', 'Smooth & creamy')
    and answers ->> 'vibe' in ('Fun and energetic', 'Chill and easy-going', 'Bold and adventurous', 'Classy and sophisticated')
    and answers ->> 'style' in ('Light and refreshing', 'Fruity and easy to drink', 'Strong with a noticeable kick', 'Something unique and different')
    and jsonb_typeof(answers -> 'strength') = 'number'
    and answers ->> 'strength' in ('1', '2', '3', '4', '5')
  then
    insert into public.user_preferences (auth_user_id, flavor, vibe, drink_style, strength)
    values (p_user_id, answers ->> 'flavor', answers ->> 'vibe', answers ->> 'style', (answers ->> 'strength')::smallint)
    on conflict (auth_user_id) do update set
      flavor = excluded.flavor,
      vibe = excluded.vibe,
      drink_style = excluded.drink_style,
      strength = excluded.strength
    where (public.user_preferences.flavor, public.user_preferences.vibe, public.user_preferences.drink_style, public.user_preferences.strength)
      is distinct from (excluded.flavor, excluded.vibe, excluded.drink_style, excluded.strength);
  end if;
end;
$$;
revoke all on function mixology_private.sync_account_data(uuid, jsonb) from public, anon, authenticated;

create or replace function mixology_private.handle_account_metadata()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform mixology_private.sync_account_data(new.id, new.raw_user_meta_data);
  return new;
end;
$$;
revoke all on function mixology_private.handle_account_metadata() from public, anon, authenticated;

drop trigger if exists mixology_sync_account on auth.users;
create trigger mixology_sync_account
  after insert or update of raw_user_meta_data on auth.users
  for each row execute function mixology_private.handle_account_metadata();

-- Include any users who registered before this migration. Re-running is safe.
do $$
begin
  perform mixology_private.sync_account_data(id, raw_user_meta_data) from auth.users;
end;
$$;

notify pgrst, 'reload schema';
commit;
