import { Children, useId, useRef, useState } from 'react'

export default function SwipeCarousel({ children, label, className = '' }) {
  const slides = Children.toArray(children)
  const track = useRef(null)
  const [active, setActive] = useState(0)
  const id = useId()

  const show = index => {
    const element = track.current
    const next = Math.max(0, Math.min(slides.length - 1, index))
    const slide = element?.children[next]
    if (!slide) return
    element.scrollTo({
      left: slide.offsetLeft - element.children[0].offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  const updateActive = () => {
    const element = track.current
    if (!element?.children.length) return
    const first = element.children[0].offsetLeft
    const distances = [...element.children].map(slide => Math.abs(slide.offsetLeft - first - element.scrollLeft))
    setActive(distances.indexOf(Math.min(...distances)))
  }

  if (!slides.length) return null

  return (
    <section className={`swipe-carousel ${className}`} aria-label={label} aria-roledescription="carousel">
      <div
        className="swipe-carousel-track"
        id={id}
        ref={track}
        onScroll={updateActive}
        tabIndex={slides.length > 1 ? 0 : undefined}
        aria-label={`${label}: swipe or use arrow keys`}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            show(active + (event.key === 'ArrowRight' ? 1 : -1))
          }
        }}
      >
        {slides.map((slide, index) => (
          <div className="swipe-carousel-slide" key={slide.key ?? index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
            {slide}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="swipe-carousel-controls">
          <span className="swipe-carousel-hint">Swipe to explore</span>
          <div className="swipe-carousel-pagination">
            <button type="button" aria-label={`Previous slide in ${label}`} aria-controls={id} disabled={active === 0} onClick={() => show(active - 1)}>←</button>
            <span role="status" aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, '0')} <span>/ {String(slides.length).padStart(2, '0')}</span></span>
            <button type="button" aria-label={`Next slide in ${label}`} aria-controls={id} disabled={active === slides.length - 1} onClick={() => show(active + 1)}>→</button>
          </div>
        </div>
      )}
    </section>
  )
}
