import { useState } from 'react'

export default function ProfilePage({ profile, onSave, onSignOut, onNavigate }) {
  const [name, setName] = useState(profile.name)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const run = async (action, success) => {
    setBusy(true)
    setError('')
    setMessage('')
    try { await action(); setMessage(success) }
    catch (failure) { setError(failure.message || 'Please try again.') }
    finally { setBusy(false) }
  }
  return (
    <section className="account-page">
      <div className="account-top-nav">
        <button className="account-back" aria-label="Go back" onClick={() => onNavigate('home')}>←</button>
      </div>
      <div className="account-card">
        <p className="account-eyebrow">Your taste, your way</p>
        <h1>Your profile.</h1>
        <p className="account-description">{profile.email}</p>
        <form className="account-form" onSubmit={event => { event.preventDefault(); run(() => onSave(name), 'Your profile has been saved.') }}>
          <label htmlFor="profile-name">Your name</label>
          <input id="profile-name" value={name} onChange={event => setName(event.target.value)} autoComplete="name" maxLength={80} required disabled={busy} />
          <button className="account-primary" disabled={busy}>{busy ? 'Please wait…' : 'Save profile'}</button>
        </form>
        {error && <p className="account-error" role="alert">{error}</p>}
        {message && <p className="account-message" role="status">{message}</p>}
        <div className="profile-taste">
          <h2>Your taste profile</h2>
          {profile.quizAnswers ? (
            <dl>
              <dt>Flavour</dt><dd>{profile.quizAnswers.flavor}</dd>
              <dt>Vibe</dt><dd>{profile.quizAnswers.vibe}</dd>
              <dt>Drink style</dt><dd>{profile.quizAnswers.style}</dd>
              <dt>Strength</dt><dd>{profile.quizAnswers.strength} / 5</dd>
            </dl>
          ) : <p>Take the quiz to save your cocktail preferences.</p>}
          <button className="account-secondary" onClick={() => onNavigate('quiz')} disabled={busy}>
            {profile.quizAnswers ? 'Retake the taste quiz' : 'Take the taste quiz'}
          </button>
        </div>
        <button className="profile-signout" disabled={busy} onClick={() => run(onSignOut, '')}>Log out</button>
      </div>
    </section>
  )
}
