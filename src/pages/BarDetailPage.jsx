import { useState } from 'react'
import BarLocationMap from '../components/bars/BarLocationMap'

export default function BarDetailPage({ bar, cocktails, onBack, onSelectCocktail }) {
  const [imageFailed, setImageFailed] = useState(false)
  const servedCocktails = (bar.cocktailIds || [])
    .map(cocktailId => cocktails.find(cocktail => cocktail.id === cocktailId))
    .filter(Boolean)
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${bar.latitude},${bar.longitude}`

  return (
    <div className="bar-detail-page">
      <div className="bar-detail-shell">
        <button type="button" className="bar-detail-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to bars
        </button>

        <section className="bar-detail-hero">
          <div className="bar-detail-image-wrap">
            {!imageFailed ? (
              <img
                src={`${bar.img}?w=1100&h=760&fit=crop&auto=format`}
                alt={`${bar.name} interior`}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="bar-detail-image-placeholder" role="img" aria-label={`${bar.name} image unavailable`}>
                <span>Mixology</span>
                <small>Image unavailable</small>
              </div>
            )}
          </div>

          <div className="bar-detail-copy">
            <p className="bar-detail-eyebrow">{bar.neighborhood} · {bar.vibe}</p>
            <h1>{bar.name}</h1>
            <div className="bar-detail-rule" />
            <p className="bar-detail-description">{bar.description}</p>

            {bar.promo && (
              <section className="bar-promotion" aria-labelledby="bar-promotion-title">
                <span className="bar-promotion-icon" aria-hidden="true">◇</span>
                <div>
                  <p id="bar-promotion-title">Current offer</p>
                  <strong>{bar.promo}</strong>
                </div>
              </section>
            )}

            <section className="bar-served-section" aria-labelledby="cocktails-served-title">
              <div className="bar-detail-section-heading">
                <h2 id="cocktails-served-title">Cocktails served</h2>
                <span>{String(servedCocktails.length).padStart(2, '0')}</span>
              </div>
              {servedCocktails.length > 0 ? (
                <div className="bar-served-grid">
                  {servedCocktails.map(cocktail => (
                    <button
                      type="button"
                      className="bar-served-card"
                      key={cocktail.id}
                      onClick={() => onSelectCocktail(cocktail)}
                      aria-label={`View ${cocktail.name}`}
                    >
                      <img
                        src={`${cocktail.img}?w=420&h=300&fit=crop&auto=format`}
                        alt={`${cocktail.name} cocktail`}
                      />
                      <span>{cocktail.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="bar-detail-empty">Cocktail information is coming soon.</p>
              )}
            </section>
          </div>
        </section>

        <section className="bar-location-section" aria-labelledby="bar-location-title">
          <div className="bar-location-copy">
            <p className="bar-detail-eyebrow">Find your way</p>
            <h2 id="bar-location-title">Location</h2>
            <address>{bar.address}</address>
            <a className="bar-directions-action" href={directionsUrl} target="_blank" rel="noreferrer">
              Get directions <span aria-hidden="true">↗</span>
            </a>
          </div>
          <BarLocationMap bar={bar} />
        </section>
      </div>
    </div>
  )
}
