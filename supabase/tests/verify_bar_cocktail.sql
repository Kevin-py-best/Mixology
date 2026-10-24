-- Run after the migrations and seed.sql. Fixtures are rolled back at the end.
begin;

insert into public.bars (
  id, slug, name, short_description, vibe, area, address_line,
  latitude, longitude, is_published
) values (
  '00000000-0000-0000-0000-000000000001',
  'migration-test-bar', 'Migration test bar', 'Temporary test fixture',
  'Classic', 'Bugis', 'Test address', 1.2992, 103.8554, true
);

insert into public.cocktails
select (jsonb_populate_record(null::public.cocktails,
  to_jsonb(c) || jsonb_build_object(
    'id', '00000000-0000-0000-0000-000000000003',
    'slug', 'migration-test-cocktail'
  ))).*
from public.cocktails c where slug = 'margarita';

do $$
declare
  test_cocktail_id uuid;
begin
  select id into strict test_cocktail_id
  from public.cocktails where slug = 'migration-test-cocktail';

  insert into public.bar_cocktail (bar_id, cocktail_id, is_published)
  values ('00000000-0000-0000-0000-000000000001', test_cocktail_id, true);

  begin
    insert into public.bar_cocktail (bar_id, cocktail_id)
    values ('00000000-0000-0000-0000-000000000001', test_cocktail_id);
    raise exception 'Duplicate pair was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into public.bar_cocktail (bar_id, cocktail_id)
    values ('00000000-0000-0000-0000-000000000002', test_cocktail_id);
    raise exception 'Missing bar was accepted';
  exception when foreign_key_violation then null;
  end;

  begin
    insert into public.bar_cocktail (bar_id, cocktail_id)
    values ('00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002');
    raise exception 'Missing cocktail was accepted';
  exception when foreign_key_violation then null;
  end;
end;
$$;

set local role anon;
do $$
begin
  if (select count(*) from public.bar_cocktail
      where bar_id = '00000000-0000-0000-0000-000000000001') <> 1 then
    raise exception 'Published relationship was not publicly readable';
  end if;
  begin
    delete from public.bar_cocktail
    where bar_id = '00000000-0000-0000-0000-000000000001';
    raise exception 'Anonymous delete was allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

-- Unpublished menu relationships must stay private even with published parents.
update public.bar_cocktail set is_published = false
where bar_id = '00000000-0000-0000-0000-000000000001';
set local role anon;
do $$
begin
  if exists (select 1 from public.bar_cocktail
             where bar_id = '00000000-0000-0000-0000-000000000001') then
    raise exception 'Unpublished relationship leaked';
  end if;
end;
$$;
reset role;
update public.bar_cocktail set is_published = true
where bar_id = '00000000-0000-0000-0000-000000000001';

update public.bars set is_permanently_closed = true
where id = '00000000-0000-0000-0000-000000000001';
set local role authenticated;
do $$
begin
  if exists (select 1 from public.bar_cocktail
             where bar_id = '00000000-0000-0000-0000-000000000001') then
    raise exception 'Closed bar relationship leaked';
  end if;
end;
$$;
reset role;
update public.bars set is_permanently_closed = false
where id = '00000000-0000-0000-0000-000000000001';

update public.bars set is_published = false
where id = '00000000-0000-0000-0000-000000000001';
set local role anon;
do $$
begin
  if exists (select 1 from public.bar_cocktail
             where bar_id = '00000000-0000-0000-0000-000000000001') then
    raise exception 'Unpublished bar relationship leaked';
  end if;
end;
$$;
reset role;

update public.bars set is_published = true
where id = '00000000-0000-0000-0000-000000000001';
update public.cocktails set is_published = false where slug = 'migration-test-cocktail';
set local role authenticated;
do $$
begin
  if exists (select 1 from public.bar_cocktail
             where bar_id = '00000000-0000-0000-0000-000000000001') then
    raise exception 'Unpublished cocktail relationship leaked';
  end if;
end;
$$;
reset role;

delete from public.cocktails where slug = 'migration-test-cocktail';
do $$
begin
  if exists (select 1 from public.bar_cocktail
             where bar_id = '00000000-0000-0000-0000-000000000001') then
    raise exception 'Cocktail deletion did not cascade';
  end if;
end;
$$;

insert into public.bar_cocktail (bar_id, cocktail_id)
select '00000000-0000-0000-0000-000000000001', id
from public.cocktails where slug = 'singapore-sling';
delete from public.bars where id = '00000000-0000-0000-0000-000000000001';
do $$
begin
  if exists (select 1 from public.bar_cocktail
             where bar_id = '00000000-0000-0000-0000-000000000001') then
    raise exception 'Bar deletion did not cascade';
  end if;
end;
$$;

rollback;
