import { useEffect, useMemo, useState } from 'react'
import Cocktail3DViewer from '../components/Cocktail3DViewer'
import { bars } from '../data/cocktails'
import { getCocktailDetails } from '../data/cocktailDetails'

const VIBE_COLORS = {
  Classic: '#B8863E',
  Speakeasy: '#9C9589',
  Rooftop: '#B8863E',
  Casual: '#9C9589',
  'Live Music': '#9C9589',
}

export default function CocktailDetailPage({ cocktail, onBack, onNavigate }) {
  const details = getCocktailDetails(cocktail.id)
  const [barIndex, setBarIndex] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [speechNotice, setSpeechNotice] = useState('')

  const servingBars = useMemo(() => {
    const selectedBars = details.servingBarIds
      .map(id => bars.find(bar => bar.id === id))
      .filter(Boolean)

    return selectedBars.length > 0 ? selectedBars : [bars[0]]
  }, [details])

  const activeBar = servingBars[barIndex % servingBars.length]

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const moveBar = direction => {
    setBarIndex(current => (current + direction + servingBars.length) % servingBars.length)
  }

  const toggleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechNotice('Read aloud is not supported in this browser.')
      return
    }

    if (isReading) {
      window.speechSynthesis.cancel()
      setIsReading(false)
      setSpeechNotice('')
      return
    }

    const utterance = new SpeechSynthesisUtterance(details.readAloud || details.history)
    utterance.rate = 0.94
    utterance.pitch = 0.96
    utterance.onend = () => setIsReading(false)
    utterance.onerror = () => {
      setIsReading(false)
      setSpeechNotice('The story could not be read aloud right now.')
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeechNotice('')
    setIsReading(true)
  }

  return (
    <div className="cocktail-detail-page">
      <div className="cocktail-detail-shell">
        <div className="cocktail-detail-back-row">
          <button type="button" className="cocktail-back-button" onClick={onBack}>
            ← Back to cocktails
          </button>
          <span className="cocktail-detail-kicker">Cocktail profile</span>
        </div>

        <section className="cocktail-detail-hero">
          <div>
            <Cocktail3DViewer cocktail={cocktail} />

            <section className="cocktail-taste-card">
              <p className="cocktail-eyebrow">How it tastes</p>
              <h2>{details.tasteTitle}</h2>
              <p className="cocktail-muted-copy">{details.tasteDescription}</p>
              <div className="cocktail-note-list">
                {details.tastingNotes.map(note => (
                  <span key={note}>{note}</span>
                ))}
              </div>
            </section>
          </div>

          <div className="cocktail-detail-info-column">
            <section className="cocktail-identity-card">
              <p className="cocktail-eyebrow">The serve</p>
              <h1>{cocktail.name}</h1>
              <div className="cocktail-origin-divider" />
              <p className="cocktail-origin-label">Place of birth</p>
              <p className="cocktail-origin">{details.origin}</p>
            </section>

            <section className="cocktail-facts-card">
              <div className="cocktail-fact cocktail-fact-wide">
                <p className="cocktail-fact-label">Who drinks it</p>
                <p className="cocktail-fact-value">{details.whoDrinks}</p>
              </div>
              <div className="cocktail-facts-grid">
                <div className="cocktail-fact">
                  <p className="cocktail-fact-label">Spirit</p>
                  <p className="cocktail-fact-value">{cocktail.spirit}</p>
                </div>
                <div className="cocktail-fact">
                  <p className="cocktail-fact-label">Strength</p>
                  <p className="cocktail-fact-value">{details.strength}</p>
                </div>
                <div className="cocktail-fact cocktail-fact-wide">
                  <p className="cocktail-fact-label">Best occasion</p>
                  <p className="cocktail-fact-value">{details.occasion}</p>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="serving-bars-section">
          <div className="detail-section-heading">
            <div>
              <p className="cocktail-eyebrow">Follow the drink</p>
              <h2>Where to drink it</h2>
            </div>
            <div className="bar-slide-controls">
              <button type="button" onClick={() => moveBar(-1)} aria-label="Previous bar">
                ←
              </button>
              <span>{String((barIndex % servingBars.length) + 1).padStart(2, '0')} / {String(servingBars.length).padStart(2, '0')}</span>
              <button type="button" onClick={() => moveBar(1)} aria-label="Next bar">
                →
              </button>
            </div>
          </div>

          <div className="serving-bar-slide" key={activeBar.id}>
            <div className="serving-bar-image-wrap">
              <img
                src={`${activeBar.img}?w=1000&h=700&fit=crop&auto=format`}
                alt={activeBar.name}
              />
              {activeBar.promo && <span className="serving-bar-offer">Offer</span>}
            </div>
            <div className="serving-bar-copy">
              <p className="cocktail-eyebrow">Serves {cocktail.name}</p>
              <h3>{activeBar.name}</h3>
              <p className="serving-bar-location">
                {activeBar.neighborhood} <span>·</span>{' '}
                <span style={{ color: VIBE_COLORS[activeBar.vibe] || '#9C9589' }}>{activeBar.vibe}</span>
              </p>
              {activeBar.promo && <p className="serving-bar-promo">{activeBar.promo}</p>}
              <button type="button" className="outline-action" onClick={() => onNavigate('bars')}>
                Explore the bars
              </button>
            </div>
          </div>

          <div className="bar-slide-dots" aria-label="Bars serving this cocktail">
            {servingBars.map((bar, index) => (
              <button
                key={bar.id}
                type="button"
                aria-label={`Show ${bar.name}`}
                aria-current={index === barIndex % servingBars.length ? 'true' : undefined}
                onClick={() => setBarIndex(index)}
              />
            ))}
          </div>
        </section>

        <section className="cocktail-history-card">
          <div className="history-card-heading">
            <div>
              <p className="cocktail-eyebrow">The story behind the glass</p>
              <h2>A short history of the {cocktail.name}</h2>
            </div>
            <span className="history-card-mark">01</span>
          </div>
          <p className="cocktail-history-copy">{details.history}</p>
          <div className="history-read-row">
            <button type="button" className="read-aloud-button" onClick={toggleReadAloud}>
              <span aria-hidden="true">{isReading ? 'Ⅱ' : '◖'}</span>
              {isReading ? 'Stop reading' : 'Read it out'}
            </button>
            <span className="speech-status" role="status" aria-live="polite">
              {speechNotice || (isReading ? 'Reading the story aloud…' : 'Listen while you browse.')}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
