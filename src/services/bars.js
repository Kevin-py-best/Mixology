import { getSupabaseClient } from '../lib/supabase'

export function mapBar(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.short_description || '',
    neighborhood: row.area || '',
    address: row.address_line || '',
    vibe: row.vibe || '',
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    img: row.image_url || '',
    imageAlt: row.image_alt || `${row.name} interior`,
    featured: row.is_featured,
  }
}

export async function getBars() {
  const { data, error } = await getSupabaseClient()
    .from('bars')
    .select('*')
    .eq('is_published', true)
    .eq('is_permanently_closed', false)
    .order('is_featured', { ascending: false })
    .order('name')
  if (error) throw error
  return (data || []).map(mapBar)
}

export async function getBarCocktails(barId) {
  const { data, error } = await getSupabaseClient()
    .from('bar_cocktail')
    .select('cocktails!inner(id, slug, name, image_url, image_alt, is_published)')
    .eq('bar_id', barId)
    .eq('is_published', true)
    .eq('cocktails.is_published', true)
  if (error) throw error
  return (data || []).map(({ cocktails: cocktail }) => ({
    id: cocktail.id,
    slug: cocktail.slug,
    name: cocktail.name,
    img: cocktail.image_url,
    imageAlt: cocktail.image_alt,
  })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getServingBars(cocktailId) {
  if (!cocktailId) return []
  const { data, error } = await getSupabaseClient()
    .from('bar_cocktail')
    .select('bars!inner(*)')
    .eq('cocktail_id', cocktailId)
    .eq('is_published', true)
    .eq('bars.is_published', true)
    .eq('bars.is_permanently_closed', false)
  if (error) throw error
  return (data || []).map(({ bars }) => mapBar(bars))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name))
}
