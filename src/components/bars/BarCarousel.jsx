import { useRef, useState } from 'react'
import BarCarouselSlide from './BarCarouselSlide'

export default function BarCarousel({ bars, onSelectBar }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef(null)
  const lastWheelAt = useRef(0)
  const hasMultipleBars = bars.length > 1

  if (bars.length === 0) {
    return (
      <div className="bar-carousel-empty">
        <h2>No bars to show yet</h2>
        <p>New bar profiles will appear here when they are available.</p>
      </div>
    )
  }

  const move = direction => {
    setActiveIndex(current => (current + direction + bars.length) % bars.length)
  }

  const handleKeyDown = event => {
    if (!hasMultipleBars) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      move(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      move(1)
    }
  }

  const handleTouchStart = event => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = event => {
    if (touchStartX.current === null || !hasMultipleBars) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const distance = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(distance) < 50) return
    move(distance < 0 ? 1 : -1)
  }

  const handleWheel = event => {
    if (!hasMultipleBars) return
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    const now = Date.now()

    if (Math.abs(delta) < 18 || now - lastWheelAt.current < 650) return
    lastWheelAt.current = now
    move(delta > 0 ? 1 : -1)
  }

  const activeBar = bars[activeIndex]

  return (
    <div
      className="bar-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Explore Singapore bars"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <BarCarouselSlide
        key={activeBar.id}
        bar={activeBar}
        onSelect={() => onSelectBar(activeBar)}
      />

      {hasMultipleBars && (
        <>
          <button type="button" className="bar-carousel-arrow bar-carousel-arrow-left" onClick={() => move(-1)} aria-label="Show previous bar">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className="bar-carousel-arrow bar-carousel-arrow-right" onClick={() => move(1)} aria-label="Show next bar">
            <span aria-hidden="true">›</span>
          </button>
          <div className="bar-carousel-indicators" aria-label="Choose a bar">
            {bars.map((bar, index) => (
              <button
                type="button"
                key={bar.id}
                aria-label={`Show ${bar.name}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
