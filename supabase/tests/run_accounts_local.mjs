import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

// The isolated test runtime is intentionally separate from app dependencies.
const moduleUrl = process.argv[2]
  ? pathToFileURL(process.argv[2]).href
  : new URL('../../.tmp-account-db-check/node_modules/@electric-sql/pglite/dist/index.js', import.meta.url).href
const { PGlite } = await import(moduleUrl)
const db = new PGlite()

try {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    grant usage on schema public, auth to anon, authenticated, service_role;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    insert into auth.users values ('b1000000-0000-4000-8000-000000000001',
      '{"display_name":"Existing user","quiz_answers":{"flavor":"Sweet & fruity","vibe":"Chill and easy-going","style":"Light and refreshing","strength":2}}');
  `)

  const migration = await readFile(new URL('../migrations/003_create_account_tables.sql', import.meta.url), 'utf8')
  await db.exec(migration)
  const existing = await db.query("select display_name, role from public.user_profiles where auth_user_id = 'b1000000-0000-4000-8000-000000000001'")
  assert.deepEqual(existing.rows, [{ display_name: 'Existing user', role: 'customer' }])
  assert.equal((await db.query('select count(*)::int as count from public.user_preferences')).rows[0].count, 1)
  console.log('PASS: migration backfills existing Auth users and saved quizzes')

  await db.exec(migration)
  assert.equal((await db.query('select count(*)::int as count from public.user_profiles')).rows[0].count, 1)
  console.log('PASS: migration can be safely re-run without duplicate rows')

  // Keep the baseline out of role-isolation fixture counts.
  await db.exec("delete from auth.users where id = 'b1000000-0000-4000-8000-000000000001'")
  await db.exec(await readFile(new URL('./verify_accounts.sql', import.meta.url), 'utf8'))
  assert.equal((await db.query('select count(*)::int as count from public.user_profiles')).rows[0].count, 0)
  console.log('PASS: signup and quiz sync, cross-user isolation, anonymous denial, role protection, validation, cascade deletion, and rollback')
} catch (error) {
  console.error(`FAIL: ${error.message}${error.where ? '\n' + error.where : ''}`)
  process.exitCode = 1
} finally {
  await db.close()
}
