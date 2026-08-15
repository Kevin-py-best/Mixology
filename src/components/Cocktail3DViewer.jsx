import { useState } from 'react'

const LIQUID_COLORS = {
  Gin: '#B8863E',
  Rum: '#8B5E3C',
  Whisky: '#9A5E2C',
  Bourbon: '#A8692A',
  Tequila: '#B6A36A',
  Vodka: '#B9C6C6',
}

export default function Cocktail3DViewer({ cocktail }) {
  const [rotation, setRotation] = useState({ x: -10, y: -18 })
  const [dragStart, setDragStart] = useState(null)

  const liquidColor = LIQUID_COLORS[cocktail.spirit] || '#B8863E'
  const imageUrl = `${cocktail.img}?w=900&h=900&fit=crop&auto=format`

  const beginDrag = event => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      rotation,
    })
  }

  const drag = event => {
    if (!dragStart) return

    setRotation({
      x: Math.max(-28, Math.min(18, dragStart.rotation.x - (event.clientY - dragStart.y) * 0.18)),
      y: dragStart.rotation.y + (event.clientX - dragStart.x) * 0.28,
    })
  }

  const endDrag = () => setDragStart(null)

  const rotate = direction => {
    setRotation(current => ({ ...current, y: current.y + direction * 22 }))
  }

  return (
    <section
      className="cocktail-3d-viewer"
      aria-label={`Interactive 3D view of ${cocktail.name}`}
    >
      <div className="cocktail-3d-stage">
        <div className="cocktail-3d-stage-label">Rotate the glass</div>
        <div
          className="cocktail-3d-canvas"
          onPointerDown={beginDrag}
          onPointerMove={drag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={event => {
            if (dragStart) drag(event)
          }}
          style={{ cursor: dragStart ? 'grabbing' : 'grab' }}
        >
          <div
            className="cocktail-3d-object"
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: dragStart ? 'none' : 'transform 0.35s ease',
            }}
          >
            <div className="cocktail-3d-shadow" />
            <div
              className="cocktail-3d-glass"
              style={{
                borderColor: 'rgba(240,235,225,0.55)',
                backgroundColor: 'rgba(240,235,225,0.04)',
              }}
            >
              <div
                className="cocktail-3d-liquid"
                style={{
                  backgroundColor: liquidColor,
                  opacity: cocktail.spirit === 'Vodka' ? 0.42 : 0.78,
                }}
              />
              <img
                src={imageUrl}
                alt=""
                className="cocktail-3d-liquid-image"
              />
              <div className="cocktail-3d-highlight" />
              <div className="cocktail-3d-garnish" style={{ backgroundColor: liquidColor }} />
            </div>
            <div className="cocktail-3d-stem" />
            <div className="cocktail-3d-base" />
          </div>
        </div>
        <div className="cocktail-3d-controls" aria-label="3D view controls">
          <button type="button" onClick={() => rotate(-1)} aria-label="Rotate cocktail left">
            ↺
          </button>
          <button type="button" onClick={() => setRotation({ x: -10, y: -18 })}>
            Reset view
          </button>
          <button type="button" onClick={() => rotate(1)} aria-label="Rotate cocktail right">
            ↻
          </button>
        </div>
      </div>
      <p className="cocktail-3d-hint">Drag to explore the serve from every angle.</p>
    </section>
  )
}
