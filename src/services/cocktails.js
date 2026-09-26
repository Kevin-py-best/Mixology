import { getSupabaseClient } from "../lib/supabase"

const STRENGTH_LABELS = {
  1: "Light",
  2: "Easy",
  3: "Balanced",
  4: "Strong",
  5: "Very Strong",
}

function mapIngredient(ingredient) {
  return {
    id: ingredient.id,
    name: ingredient.ingredient_name,
    amount: ingredient.amount,
    unit: ingredient.unit,
    preparationNote: ingredient.preparation_note,
    isOptional: ingredient.is_optional,
    isGarnish: ingredient.is_garnish,
    sortOrder: ingredient.sort_order,
  }
}

function mapCocktail(row) {
  const ingredients = [...(row.cocktail_ingredients || [])]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map(mapIngredient)

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    image: {
      url: row.image_url,
      alt: row.image_alt,
    },
    taste: {
      title: row.taste_title,
      description: row.taste_description,
      tags: row.taste_tags || [],
      notes: row.tasting_notes || [],
    },
    alcoholStrength: {
      level: row.alcohol_intensity,
      label: STRENGTH_LABELS[row.alcohol_intensity] || "Unknown",
      description: row.alcohol_description,
    },
    ingredients,
    history: row.history,
    readAloud: row.read_aloud,
    occasions: row.occasions || [],
    servingBars: [],
    source: {
      name: row.source_name,
      url: row.source_url,
      imageSourceUrl: row.image_source_url,
      imageAttribution: row.image_attribution,
    },
  }
}

export async function getCocktailBySlug(slug) {
  if (!slug) return null

  const client = getSupabaseClient()
  const { data, error } = await client
    .from("cocktails")
    .select(`
      id,
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
      source_name,
      source_url,
      image_source_url,
      image_attribution,
      cocktail_ingredients (
        id,
        ingredient_name,
        amount,
        unit,
        preparation_note,
        is_optional,
        is_garnish,
        sort_order
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (error) throw error
  return data ? mapCocktail(data) : null
}
