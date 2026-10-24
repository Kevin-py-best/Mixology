import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import test from 'node:test'

// Replace only the client boundary so these tests run without Vite env injection.
const source = readFileSync(new URL('./bars.js', import.meta.url), 'utf8')
  .replace("import { getSupabaseClient } from '../lib/supabase'", 'const getSupabaseClient = () => globalThis.barTestClient')
const service = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
function mockClient(result) {
  const calls = []
  const query = {
    select(value) { calls.push(['select', value]); return this },
    eq(column, value) { calls.push(['eq', column, value]); return this },
    order(column, options) { calls.push(['order', column, options]); return this },
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject) },
  }
  globalThis.barTestClient = { from(table) { calls.push(['from', table]); return query } }
  return calls
}

test('maps live bar columns and preserves UUIDs and missing coordinates', () => {
  const bar = service.mapBar({ id: '03f575db-48dc-4010-bd5a-1f3c0ab7c628', name: 'Atlas Bar', short_description: 'Description', area: 'Bugis', address_line: 'Address', latitude: '1.299200', longitude: null, is_featured: true })
  assert.equal(bar.id, '03f575db-48dc-4010-bd5a-1f3c0ab7c628')
  assert.equal(bar.description, 'Description')
  assert.equal(bar.neighborhood, 'Bugis')
  assert.equal(bar.address, 'Address')
  assert.equal(bar.latitude, 1.2992)
  assert.equal(bar.longitude, null)
  assert.equal(bar.featured, true)
})

test('bar catalogue requests published, open bars from live data', async () => {
  const calls = mockClient({ data: [], error: null })
  assert.deepEqual(await service.getBars(), [])
  assert.deepEqual(calls.filter(call => call[0] === 'eq'), [['eq', 'is_published', true], ['eq', 'is_permanently_closed', false]])
  assert.deepEqual(calls[0], ['from', 'bars'])
})

test('bar menu uses the junction and maps live cocktail UUIDs', async () => {
  const calls = mockClient({ data: [{ cocktails: { id: 'a4c3a234-17d2-4bc8-886f-abf56dc328ed', slug: 'singapore-sling', name: 'Singapore Sling', image_url: 'image.jpg', image_alt: 'Sling' } }], error: null })
  const result = await service.getBarCocktails('03f575db-48dc-4010-bd5a-1f3c0ab7c628')
  assert.equal(result[0].id, 'a4c3a234-17d2-4bc8-886f-abf56dc328ed')
  assert.equal(result[0].slug, 'singapore-sling')
  assert.equal(result[0].img, 'image.jpg')
  assert.deepEqual(calls[0], ['from', 'bar_cocktail'])
  assert.ok(calls.some(call => call[1] === 'bar_id' && call[2] === '03f575db-48dc-4010-bd5a-1f3c0ab7c628'))
  assert.ok(calls.some(call => call[1] === 'is_published' && call[2] === true))
})

test('reverse relationship filters closed bars and sorts featured bars first', async () => {
  const calls = mockClient({ data: [{ bars: { id: 'b', name: 'A bar', is_featured: false } }, { bars: { id: 'a', name: 'Z bar', is_featured: true } }], error: null })
  assert.deepEqual((await service.getServingBars('cocktail-uuid')).map(bar => bar.id), ['a', 'b'])
  assert.ok(calls.some(call => call[1] === 'cocktail_id' && call[2] === 'cocktail-uuid'))
  assert.ok(calls.some(call => call[1] === 'bars.is_permanently_closed' && call[2] === false))
})

test('missing cocktail ID skips the query; query errors remain errors', async () => {
  const calls = mockClient({ data: null, error: new Error('Table unavailable') })
  assert.deepEqual(await service.getServingBars(null), [])
  assert.equal(calls.length, 0)
  await assert.rejects(service.getBarCocktails('bar-uuid'), /Table unavailable/)
  await assert.rejects(service.getServingBars('cocktail-uuid'), /Table unavailable/)
  await assert.rejects(service.getBars(), /Table unavailable/)
  delete globalThis.barTestClient
})
