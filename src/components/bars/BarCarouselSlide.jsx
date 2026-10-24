import { useState } from 'react'

export default function BarCarouselSlide({ bar, position, total, onSelect }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className="bar-carousel-slide">
      <div className="bar-carousel-topline">
        <span>Mixology / Places worth discovering</span>
        <span>{String(position).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      </div>
      <div className="bar-carousel-media">
        {!imageFailed && bar.img ? (
          <img
            src={bar.img}
            alt={bar.imageAlt || `${bar.name} interior`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="bar-carousel-placeholder" role="img" aria-label={`${bar.name} image unavailable`}>
            <span>{bar.name.charAt(0)}</span>
            <small>{bar.neighborhood || 'Singapore'}</small>
          </div>
        )}
      </div>

      <div className="bar-carousel-copy">
        <div>
          <p>{bar.neighborhood || 'Singapore'}{bar.vibe ? ` · ${bar.vibe}` : ''}</p>
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
