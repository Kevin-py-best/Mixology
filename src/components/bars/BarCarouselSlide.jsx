import { useState } from 'react'

export default function BarCarouselSlide({ bar, onSelect }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className="bar-carousel-slide">
      <div className="bar-carousel-media">
        {!imageFailed && bar.img ? (
          <img
            src={bar.img}
            alt={bar.imageAlt || `${bar.name} interior`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="bar-carousel-placeholder" role="img" aria-label={`${bar.name} image unavailable`}>
            <span>Mixology</span>
            <small>Image unavailable</small>
          </div>
        )}
      </div>

      <div className="bar-carousel-copy">
        <div>
          <p>{bar.neighborhood} · {bar.vibe}</p>
          <h2>{bar.name}</h2>
          <span className="bar-carousel-description">{bar.description}</span>
          {bar.promo && <span className="bar-carousel-promo">Current offer · {bar.promo}</span>}
        </div>
        <button type="button" className="bar-carousel-action" onClick={onSelect}>
          View bar <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  )
}
