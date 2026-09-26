import BarCarousel from '../components/bars/BarCarousel'
import BarMapPreview from '../components/bars/BarMapPreview'
import { bars } from '../data/cocktails'

export default function BarsPage({ onSelectBar }) {
  const orderedBars = [...bars].sort((a, b) => Number(b.featured) - Number(a.featured))

  return (
    <div className="bars-index-page">
      <h1 className="visually-hidden">Bars</h1>

      <section className="bars-collection bars-hero-section" aria-label="Explore bars">
        <BarCarousel bars={orderedBars} onSelectBar={onSelectBar} />
      </section>

      <section className="bars-map-section" aria-labelledby="all-bars-map-title">
        <div className="bars-section-heading">
          <h2 id="all-bars-map-title">All bars in Singapore</h2>
          <span>Select a marker for details</span>
        </div>
        <BarMapPreview bars={orderedBars} onSelectBar={onSelectBar} />
      </section>
    </div>
  )
}
