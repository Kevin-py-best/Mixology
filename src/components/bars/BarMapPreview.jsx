import { useState } from 'react'

const neighborhoods = [
  { name: 'Clarke Quay', top: '48%', left: '30%' },
  { name: 'Raffles Place', top: '52%', left: '40%' },
  { name: 'Tanjong Pagar', top: '60%', left: '38%' },
  { name: 'Ann Siang', top: '57%', left: '42%' },
  { name: 'Bugis', top: '35%', left: '45%' },
  { name: 'CBD', top: '50%', left: '44%' },
]

const markerPositions = [
  { top: '38%', left: '48%' },
  { top: '48%', left: '41%' },
  { top: '58%', left: '39%' },
  { top: '55%', left: '44%' },
  { top: '44%', left: '31%' },
]

export default function BarMapPreview({ bars, onSelectBar }) {
  const [selectedBarId, setSelectedBarId] = useState(bars[0]?.id ?? null)

  return (
    <>
      <div className="bars-map-placeholder">
        <div className="bars-map-grid" aria-hidden="true" />
        <div className="bars-map-island" aria-hidden="true" />
        <div className="bars-map-water" aria-hidden="true" />
        <span className="bars-map-water-label">Strait of Singapore</span>

        {neighborhoods.map(neighborhood => (
          <span
            className="bars-neighborhood-label"
            key={neighborhood.name}
            style={{ top: neighborhood.top, left: neighborhood.left }}
          >
            {neighborhood.name}
          </span>
        ))}

        {bars.map((bar, index) => {
          const position = markerPositions[index] || { top: '50%', left: '50%' }
          const selected = selectedBarId === bar.id

          return (
            <div
              className={`bars-map-marker-wrap${selected ? ' is-selected' : ''}`}
              key={bar.id}
              style={{ top: position.top, left: position.left }}
            >
              <button
                type="button"
                className="bars-map-marker"
                onClick={() => setSelectedBarId(selected ? null : bar.id)}
                aria-label={`Open ${bar.name} preview`}
                aria-expanded={selected}
              />
              {selected && (
                <div className="bars-map-preview">
                  <p>{bar.name}</p>
                  <span>{bar.neighborhood} · {bar.vibe}</span>
                  <button type="button" onClick={() => onSelectBar(bar)}>
                    View more <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bars-accessible-list" aria-label="All bars list">
        {bars.map(bar => (
          <button type="button" key={bar.id} onClick={() => onSelectBar(bar)}>
            <span>{bar.name}</span>
            <small>{bar.neighborhood} · {bar.vibe}</small>
          </button>
        ))}
      </div>
    </>
  )
}
