-- Default Supabase seed entry point for the first complete cocktail-detail slice.
-- Mixology owns the taste, occasion, strength and educational copy below.

insert into public.cocktails (
  slug,
  name,
  short_description,
  image_url,
  image_alt,
  taste_title,
  taste_description,
  taste_tags,
  tasting_notes,
  alcohol_intensity,
  alcohol_description,
  history,
  read_aloud,
  occasions,
  popularity_score,
  is_featured,
  is_published,
  source_name,
  source_url,
  image_source_url,
  image_attribution
)
values
  (
    'margarita',
    'Margarita',
    'A bright tequila cocktail balanced with fresh lime, orange liqueur, and a lightly saline rim.',
    'https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg',
    'A pale green Margarita in a stemmed cocktail glass with a salt rim and lime garnish',
    'Bright, tart, and lightly saline',
    'Fresh lime leads, orange liqueur rounds the edges, and tequila gives the drink an earthy agave backbone.',
    array['Citrus & Bright', 'Tart', 'Agave', 'Saline'],
    array['Fresh lime and orange', 'Earthy agave', 'Dry, lightly salty finish'],
    3,
    'Balanced: tequila remains clearly present, while citrus, sweetness, and shaking dilution keep the drink approachable.',
    'The Margarita became one of the best-known tequila cocktails of the twentieth century. Several origin stories compete for credit, but the enduring formula is defined by tequila, citrus, and orange liqueur. Its appeal comes from a precise balance: lime provides freshness, liqueur softens the acidity, and salt makes the agave character feel brighter.',
    'The Margarita became one of the best-known tequila cocktails of the twentieth century. Its enduring formula combines tequila, fresh citrus, and orange liqueur. Lime provides freshness, the liqueur softens the acidity, and a little salt makes the agave character feel brighter.',
    array['First Date', 'Weekend Unwind', 'Celebration'],
    90,
    false,
    true,
    'TheCocktailDB and Mixology editorial',
    'https://www.thecocktaildb.com/drink/11007-Margarita',
    'https://commons.wikimedia.org/wiki/File:Klassiche_Margarita.jpg',
    'Cocktailmarler'
  ),
  (
    'singapore-sling',
    'Singapore Sling',
    'A long, fruit-led gin cocktail with citrus lift, cherry richness, and a gently herbal finish.',
    'https://images.unsplash.com/photo-1615887625746-f3d2aa27e048?auto=format&fit=crop&w=1600&q=85',
    'A rose-coloured Singapore Sling served over ice in a tall glass with a fruit garnish',
    'Tropical, botanical, and gently spiced',
    'Pineapple and citrus arrive first, followed by cherry sweetness, botanical gin, and a quiet herbal finish.',
    array['Tropical', 'Citrus & Bright', 'Fruity', 'Herbal'],
    array['Pineapple and citrus', 'Cherry and botanical gin', 'Gently spiced herbal finish'],
    2,
    'Easy: the drink contains several spirits and liqueurs, but juice, ice, and dilution make it feel long and refreshing.',
    'The Singapore Sling is commonly associated with the Long Bar at Raffles Hotel and bartender Ngiam Tong Boon in the early twentieth century. The exact historical recipe has been debated and reconstructed over time, but the drink became an enduring Singapore symbol through its combination of gin, fruit, citrus, liqueurs, and bitters. Its rose colour and layered flavour helped it travel far beyond the bar where its story began.',
    'The Singapore Sling is commonly associated with the Long Bar at Raffles Hotel and bartender Ngiam Tong Boon in the early twentieth century. Although its exact historical recipe has changed over time, the drink became an enduring Singapore symbol through its combination of gin, fruit, citrus, liqueurs, and bitters.',
    array['First Date', 'Weekend Unwind', 'Celebration', 'Casual Gathering'],
    100,
    true,
    true,
    'Mixology editorial',
    'https://www.raffles.com/singapore/dining/long-bar/',
    'https://images.unsplash.com/photo-1615887625746-f3d2aa27e048',
    'Development image; replace with an approved Mixology-owned or licensed production asset'
  )
on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  taste_title = excluded.taste_title,
  taste_description = excluded.taste_description,
  taste_tags = excluded.taste_tags,
  tasting_notes = excluded.tasting_notes,
  alcohol_intensity = excluded.alcohol_intensity,
  alcohol_description = excluded.alcohol_description,
  history = excluded.history,
  read_aloud = excluded.read_aloud,
  occasions = excluded.occasions,
  popularity_score = excluded.popularity_score,
  is_featured = excluded.is_featured,
  is_published = excluded.is_published,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  image_source_url = excluded.image_source_url,
  image_attribution = excluded.image_attribution;

-- Re-seeding should replace this controlled ingredient list, not duplicate it.
delete from public.cocktail_ingredients
where cocktail_id in (
  select id
  from public.cocktails
  where slug in ('margarita', 'singapore-sling')
);

insert into public.cocktail_ingredients (
  cocktail_id,
  ingredient_name,
  amount,
  unit,
  preparation_note,
  is_optional,
  is_garnish,
  sort_order
)
select
  cocktails.id,
  seed_ingredients.ingredient_name,
  seed_ingredients.amount,
  seed_ingredients.unit,
  seed_ingredients.preparation_note,
  seed_ingredients.is_optional,
  seed_ingredients.is_garnish,
  seed_ingredients.sort_order
from public.cocktails
join (
  values
    ('margarita', 'Tequila blanco', 45::numeric, 'ml', null, false, false, 1),
    ('margarita', 'Orange liqueur', 15::numeric, 'ml', null, false, false, 2),
    ('margarita', 'Fresh lime juice', 30::numeric, 'ml', 'Freshly squeezed', false, false, 3),
    ('margarita', 'Salt', null::numeric, null, 'Apply to half of the glass rim', true, true, 4),
    ('margarita', 'Lime wheel', null::numeric, null, null, true, true, 5),

    ('singapore-sling', 'London dry gin', 30::numeric, 'ml', null, false, false, 1),
    ('singapore-sling', 'Cherry liqueur', 15::numeric, 'ml', null, false, false, 2),
    ('singapore-sling', 'Orange liqueur', 8::numeric, 'ml', null, false, false, 3),
    ('singapore-sling', 'Benedictine', 8::numeric, 'ml', null, false, false, 4),
    ('singapore-sling', 'Pineapple juice', 120::numeric, 'ml', null, false, false, 5),
    ('singapore-sling', 'Fresh lime juice', 15::numeric, 'ml', 'Freshly squeezed', false, false, 6),
    ('singapore-sling', 'Grenadine', 10::numeric, 'ml', null, false, false, 7),
    ('singapore-sling', 'Aromatic bitters', 1::numeric, 'dash', null, false, false, 8),
    ('singapore-sling', 'Pineapple wedge', null::numeric, null, null, true, true, 9),
    ('singapore-sling', 'Cocktail cherry', null::numeric, null, null, true, true, 10)
) as seed_ingredients (
  cocktail_slug,
  ingredient_name,
  amount,
  unit,
  preparation_note,
  is_optional,
  is_garnish,
  sort_order
)
  on cocktails.slug = seed_ingredients.cocktail_slug;
