import { useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { accountService } from '../hooks/useAccount'

export default function AccountPage({ mode = 'account', onNavigate, onAuthenticated }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const isSignup = mode === 'signup'
  const isChoice = mode === 'account'

  const handleSubmit = async event => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const email = values.get('email').trim()
    const password = values.get('password')
    setError('')
    setMessage('')
    if (isSignup && password !== values.get('confirmPassword')) {
      setError('Your passwords do not match.')
      return
    }
    setPending(true)
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}?auth=quiz`
      const data = isSignup
        ? await accountService.signUp({ email, password, name: values.get('name'), redirectTo })
        : await accountService.signIn({ email, password })
      if (data.session) {
        onAuthenticated(data.session.user)
      } else if (isSignup) {
        setConfirmationEmail(email)
        setMessage('Check your email to confirm your account, then return here to log in and take the quiz.')
      } else {
        setError('Unable to log in. Please try again.')
      }
    } catch (authError) {
      setError(authError.message || 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const resendConfirmation = async () => {
    setPending(true)
    setError('')
    try {
      await accountService.resendConfirmation(confirmationEmail, `${window.location.origin}${window.location.pathname}?auth=quiz`)
      setMessage('Confirmation email requested. Please check your inbox and spam folder.')
    } catch (failure) { setError(failure.message || 'Unable to resend the email. Please try again.') }
    finally { setPending(false) }
  }

  return (
    <section className="account-page">
      <div className="account-top-nav">
        <button className="account-back" aria-label="Go back" onClick={() => onNavigate(isChoice ? 'home' : 'account')} disabled={pending}>
          ←
        </button>
      </div>
      <div className="account-card">
        {isChoice ? (
          <div className="account-intro">
            <h1>MIXOLOGY</h1>
            <p className="account-eyebrow">Your taste, your way</p>
          </div>
        ) : (
          <>
            <p className="account-eyebrow">Your taste, your way</p>
            <h1>{isSignup ? 'Create your account.' : 'Welcome back.'}</h1>
            <p className="account-description">
              {isSignup ? 'Sign up to begin your taste quiz.' : 'Log in to continue to your taste quiz.'}
            </p>
          </>
        )}

        {isChoice ? (
          <div className="account-options">
            <button className="account-primary" onClick={() => onNavigate('signup')}>Sign up</button>
            <button className="account-secondary" onClick={() => onNavigate('login')}>Log in</button>
          </div>
        ) : (
          <form className="account-form" onSubmit={handleSubmit}>
            {!isSupabaseConfigured && <p className="account-error" role="alert">Account access is not configured yet. Please try again later.</p>}
            {isSignup && (
              <>
                <label htmlFor="account-name">Your name</label>
                <input id="account-name" name="name" autoComplete="name" maxLength={80} placeholder="Your name" required disabled={pending || Boolean(confirmationEmail)} />
              </>
            )}
            <label htmlFor="account-email">Email address</label>
            <input id="account-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required disabled={pending || Boolean(message)} />
            <label htmlFor="account-password">Password</label>
            <input id="account-password" name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : undefined} placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'} required disabled={pending || Boolean(message)} />
            {isSignup && (
              <>
                <label htmlFor="account-confirm-password">Confirm password</label>
                <input id="account-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" minLength={8} required disabled={pending || Boolean(message)} />
              </>
            )}
            {error && <p className="account-error" role="alert">{error}</p>}
            {message && <p className="account-message" role="status">{message}</p>}
            <button className="account-primary" type="submit" disabled={pending || Boolean(confirmationEmail) || !isSupabaseConfigured}>
              {pending ? 'Please wait…' : isSignup ? 'Create account' : 'Log in & take the quiz'}
            </button>
            {confirmationEmail && <button className="account-secondary" type="button" onClick={resendConfirmation} disabled={pending}>Resend confirmation email</button>}
            <p className="account-switch">
              {isSignup ? 'Already have an account?' : 'New to Mixology?'}{' '}
              <button type="button" onClick={() => onNavigate(isSignup ? 'login' : 'signup')} disabled={pending}>
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
