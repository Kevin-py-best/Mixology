-- Post-seed smoke checks: two complete cocktails and zero validation rows.

select
  id,
  slug,
  name,
  taste_tags,
  alcohol_intensity,
  occasions,
  is_published
from public.cocktails
where slug in ('margarita', 'singapore-sling')
order by name;

select
  cocktails.name as cocktail,
  cocktail_ingredients.ingredient_name,
  cocktail_ingredients.amount,
  cocktail_ingredients.unit,
  cocktail_ingredients.is_garnish,
  cocktail_ingredients.sort_order
from public.cocktails
join public.cocktail_ingredients
  on cocktail_ingredients.cocktail_id = cocktails.id
where cocktails.slug in ('margarita', 'singapore-sling')
order by cocktails.name, cocktail_ingredients.sort_order;

-- Expected result: zero rows.
select
  slug,
  name
from public.cocktails
where is_published = true
  and (
    cardinality(taste_tags) = 0
    or cardinality(tasting_notes) = 0
    or cardinality(occasions) = 0
    or length(trim(history)) = 0
    or length(trim(read_aloud)) = 0
    or length(trim(image_url)) = 0
    or length(trim(image_alt)) = 0
  );
