import BarCarousel from '../components/bars/BarCarousel'
import BarMapPreview from '../components/bars/BarMapPreview'
import { getBars } from '../services/bars'
import useLiveData from '../hooks/useLiveData'

export default function BarsPage({ onSelectBar }) {
  const { data: orderedBars, status, retry } = useLiveData(getBars)
  if (status !== 'success') return (
    <div className="bars-index-page" role={status === 'error' ? 'alert' : 'status'}>
      <h1>{status === 'loading' ? 'Loading bars…' : 'Unable to load bars'}</h1>
      {status === 'error' && <button className="outline-action" onClick={retry}>Try again</button>}
    </div>
  )

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
