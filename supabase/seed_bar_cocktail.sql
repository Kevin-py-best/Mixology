-- Import prototype relationships only when both live parent records exist.
-- Keep them unpublished until current menu availability is confirmed.
insert into public.bar_cocktail (bar_id, cocktail_id)
select b.id, c.id
from (values
  ('atlas-bar', 'singapore-sling'),
  ('atlas-bar', 'raffles-gimlet'),
  ('native', 'jungle-bird'),
  ('native', 'night-jasmine'),
  ('operation-dagger', 'lychee-martini'),
  ('operation-dagger', 'tamarind-sour'),
  ('analogue-initiative', 'chrysanthemum-negroni'),
  ('employees-only-sg', 'pandan-old-fashioned')
) as fixture(bar_slug, cocktail_slug)
join public.bars b on b.slug = fixture.bar_slug
join public.cocktails c on c.slug = fixture.cocktail_slug
on conflict (bar_id, cocktail_id) do nothing;
