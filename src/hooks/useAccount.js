import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { createAccountService, getAccountProfile } from '../services/account'

export const accountService = createAccountService(supabase)

export default function useAccount() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!supabase)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!supabase) return
    let active = true
    // Keep the callback synchronous: auth events run while the SDK holds its session lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user || null)
        if (session) setError('')
        setReady(true)
      }
    })
    supabase.auth.getSession().then(({ error: sessionError }) => {
      if (active && sessionError) {
        setError(sessionError.message)
        setReady(true)
      }
    }).catch(() => {
      if (active) {
        setError('Unable to restore your session. Please log in again.')
        setReady(true)
      }
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  return { user, ready, error, setUser, profile: getAccountProfile(user) }
}
