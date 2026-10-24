import test from 'node:test'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
import { createAccountService, getAccountProfile } from './account.js'

const answers = { flavor: 'Sweet & fruity', vibe: 'Chill and easy-going', style: 'Light and refreshing', strength: 2 }

function authFixture() {
  const stored = new Map()
  const storage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) }
  const calls = []
  let user = { id: '300c2adc-e236-4200-bdfa-8ce936fc1d95', aud: 'authenticated', email: 'test@example.invalid', user_metadata: {}, identities: [{ id: 'email-identity', provider: 'email' }] }
  let confirmed = false
  const token = () => `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: user.id, aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test-signature`
  const session = () => ({ access_token: token(), refresh_token: 'local-test-refresh', token_type: 'bearer', expires_in: 3600, user })
  const fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url)
    const body = init.body ? JSON.parse(init.body) : {}
    calls.push({ path: url.pathname, grant: url.searchParams.get('grant_type'), method: init.method || 'GET', body, headers: init.headers })
    let data
    let status = 200
    if (url.pathname.endsWith('/signup')) {
      user = { ...user, email: body.email, user_metadata: body.data }
      data = user
    } else if (url.pathname.endsWith('/token')) {
      if (url.searchParams.get('grant_type') === 'refresh_token' && body.refresh_token === 'local-test-refresh') {
        data = session()
      } else if (!confirmed || body.password !== 'test-password-123') {
        status = 400
        data = { msg: confirmed ? 'Invalid login credentials' : 'Email not confirmed', error_code: confirmed ? 'invalid_credentials' : 'email_not_confirmed' }
      } else data = session()
    } else if (url.pathname.endsWith('/user')) {
      if (init.method === 'PUT') user = { ...user, user_metadata: { ...user.user_metadata, ...body.data } }
      data = user
    } else if (url.pathname.endsWith('/resend') || url.pathname.endsWith('/logout')) data = {}
    else throw new Error(`Unexpected auth request: ${url.pathname}`)
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
  }
  const client = () => createClient('https://auth-test.supabase.co', 'local-test-key', {
    auth: { storage, storageKey: 'account-test-session', persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch },
  })
  return { client, calls, stored, confirm: () => { confirmed = true } }
}

test('email-confirmed signup, login, saved profile/quiz, session restore, and logout through the real SDK', async () => {
  const fixture = authFixture()
  const client = fixture.client()
  const service = createAccountService(client)
  const events = []
  const { data: { subscription } } = client.auth.onAuthStateChange(event => events.push(event))
  const signup = await service.signUp({ email: ' test@example.invalid ', password: 'test-password-123', name: ' Jamie ', redirectTo: 'http://localhost:8443/?auth=quiz' })
  assert.equal(signup.session, null, 'unconfirmed signup must not be treated as authenticated')
  assert.equal(signup.user.user_metadata.display_name, 'Jamie')
  assert.equal((await client.auth.getSession()).data.session, null)
  await assert.rejects(service.signIn({ email: 'test@example.invalid', password: 'test-password-123' }), /Email not confirmed/)
  await service.resendConfirmation('test@example.invalid', 'http://localhost:8443/?auth=quiz')
  assert.ok(fixture.calls.some(call => call.path.endsWith('/resend') && call.body.type === 'signup'))
  fixture.confirm()
  await assert.rejects(service.signIn({ email: 'test@example.invalid', password: 'wrong' }), /Invalid login credentials/)
  const login = await service.signIn({ email: 'test@example.invalid', password: 'test-password-123' })
  assert.equal(login.session.user.id, signup.user.id)
  await service.saveProfile('Taylor')
  const updated = await service.saveQuiz({ ...answers, ignored: 'must not be saved' })
  assert.deepEqual(getAccountProfile(updated), { name: 'Taylor', email: 'test@example.invalid', quizAnswers: answers })
  assert.equal(updated.user_metadata.quiz_answers.ignored, undefined)
  assert.ok(events.includes('SIGNED_IN'))
  assert.ok(events.includes('USER_UPDATED'))
  subscription.unsubscribe()
  client.auth.stopAutoRefresh()

  const restored = fixture.client()
  const restoredSession = (await restored.auth.getSession()).data.session
  assert.equal(restoredSession.user.id, signup.user.id)
  assert.deepEqual(getAccountProfile(restoredSession.user).quizAnswers, answers)
  assert.equal(getAccountProfile(restoredSession.user).name, 'Taylor')
  const refreshed = await restored.auth.refreshSession()
  assert.equal(refreshed.error, null)
  assert.equal(refreshed.data.session.user.id, signup.user.id)
  assert.ok(fixture.calls.some(call => call.grant === 'refresh_token'))
  await createAccountService(restored).signOut()
  assert.equal((await restored.auth.getSession()).data.session, null)
  assert.equal(fixture.stored.has('account-test-session'), false)
  restored.auth.stopAutoRefresh()
})

test('an expired stored session is refreshed before restoring the account', async () => {
  const fixture = authFixture()
  fixture.confirm()
  const client = fixture.client()
  await createAccountService(client).signIn({ email: 'test@example.invalid', password: 'test-password-123' })
  client.auth.stopAutoRefresh()
  const saved = JSON.parse(fixture.stored.get('account-test-session'))
  saved.expires_at = Math.floor(Date.now() / 1000) - 120
  fixture.stored.set('account-test-session', JSON.stringify(saved))
  const restored = fixture.client()
  const { data, error } = await restored.auth.getSession()
  assert.equal(error, null)
  assert.ok(data.session.expires_at > Math.floor(Date.now() / 1000))
  assert.ok(fixture.calls.some(call => call.grant === 'refresh_token'))
  restored.auth.stopAutoRefresh()
})

test('incomplete quiz and blank names are rejected before any remote update', async () => {
  const fixture = authFixture()
  const client = fixture.client()
  const service = createAccountService(client)
  await assert.rejects(service.saveQuiz({ ...answers, strength: 0 }), /all four/)
  await assert.rejects(service.saveQuiz({ ...answers, flavor: 'unknown' }), /all four/)
  await assert.rejects(service.saveProfile('  '), /enter your name/)
  assert.equal(fixture.calls.length, 0)
  client.auth.stopAutoRefresh()
})

test('missing configuration and remote save failures never report a successful save', async () => {
  await assert.rejects(createAccountService(null).signIn({ email: 'x', password: 'x' }), /valid Supabase/)
  const service = createAccountService({ auth: { updateUser: async () => ({ data: {}, error: new Error('Session expired') }) } })
  await assert.rejects(service.saveQuiz(answers), /Session expired/)
  assert.equal(getAccountProfile({ user_metadata: { quiz_answers: { flavor: 'invalid' } } }).quizAnswers, null)
  assert.deepEqual(getAccountProfile(null), { name: '', email: '', quizAnswers: null })
})
