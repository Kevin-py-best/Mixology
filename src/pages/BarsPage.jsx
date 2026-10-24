import BarCarousel from '../components/bars/BarCarousel'
import BarMapPreview from '../components/bars/BarMapPreview'
import { getBars, getSpotlightBars } from '../services/bars'
import useLiveData from '../hooks/useLiveData'

export default function BarsPage({ onSelectBar }) {
  const { data: bars, status, retry } = useLiveData(getBars)
  const spotlightBars = getSpotlightBars(bars)

  if (status !== 'success') return (
    <div className="bars-index-page bars-page-status" role={status === 'error' ? 'alert' : 'status'}>
      <p className="bars-kicker">Discover / Singapore</p>
      <h1>{status === 'loading' ? 'Finding your next favourite bar…' : 'We could not load the bars.'}</h1>
      <p>{status === 'loading' ? 'Gathering the latest places to explore.' : 'Please try again in a moment.'}</p>
      {status === 'error' && <button type="button" className="bars-primary-button" onClick={retry}>Try again</button>}
    </div>
  )
  if (bars.length === 0) return (
    <div className="bars-index-page bars-page-status" role="status">
      <p className="bars-kicker">Discover / Singapore</p>
      <h1>New places are on the way.</h1>
      <p>There are no bars to explore just yet. Check back soon.</p>
    </div>
  )

  return (
    <div className="bars-index-page">
      <h1 className="visually-hidden">Bars</h1>

      <section className="bars-collection bars-hero-section" aria-label="Bars to discover">
        <BarCarousel bars={spotlightBars} onSelectBar={onSelectBar} />
      </section>

      <section className="bars-map-section" aria-labelledby="all-bars-map-title">
        <div className="bars-discover-heading">
          <div>
            <p className="bars-kicker">Find your place</p>
            <h2 id="all-bars-map-title">Where to tonight?</h2>
          </div>
          <p>Explore the map, choose a neighbourhood, or find the bars closest to you.</p>
        </div>
        <BarMapPreview bars={bars} onSelectBar={onSelectBar} />
      </section>
    </div>
  )
}
