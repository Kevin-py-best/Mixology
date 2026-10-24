import { useState } from 'react'
import BarLocationMap from '../components/bars/BarLocationMap'
import { getBarCocktails } from '../services/bars'
import useLiveData from '../hooks/useLiveData'

export default function BarDetailPage({ bar, onBack, onSelectCocktail }) {
  const [imageFailed, setImageFailed] = useState(false)
  const { data: servedCocktails, status, retry } = useLiveData(getBarCocktails, bar.id)
  const hasCoordinates = Number.isFinite(bar.latitude) && Number.isFinite(bar.longitude)
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${bar.latitude},${bar.longitude}`

  return (
    <div className="bar-detail-page">
      <div className="bar-detail-shell">
        <button type="button" className="bar-detail-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to bars
        </button>

        <section className="bar-detail-hero">
          <div className="bar-detail-image-wrap">
            {!imageFailed && bar.img ? (
              <img
                src={bar.img}
                alt={bar.imageAlt || `${bar.name} interior`}
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
              {status === 'loading' ? <p role="status">Loading cocktails…</p> : status === 'error' ? (
                <div role="alert"><p>Unable to load cocktails served here.</p><button className="outline-action" onClick={retry}>Try again</button></div>
              ) : servedCocktails.length > 0 ? (
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
                        src={cocktail.img}
                        alt={cocktail.imageAlt || `${cocktail.name} cocktail`}
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
            {hasCoordinates && <a className="bar-directions-action" href={directionsUrl} target="_blank" rel="noreferrer">
              Get directions <span aria-hidden="true">↗</span>
            </a>}
          </div>
          {hasCoordinates ? <BarLocationMap bar={bar} /> : <p>Location information is coming soon.</p>}
        </section>
      </div>
    </div>
  )
}
