-- Expected result: five unpublished, unverified placeholder bars.
select
  id,
  slug,
  name,
  is_featured,
  is_published,
  is_permanently_closed,
  verified_at
from public.bars
order by name;

-- Expected result: zero rows. Placeholder records must never be published or
-- represented as verified production data.
select
  slug,
  name
from public.bars
where is_published = true
   or verified_at is not null;

-- Expected result: the public-read policy and its predicate.
select
  policyname,
  roles,
  cmd,
  qual
from pg_policies
where schemaname = 'public'
  and tablename = 'bars';
