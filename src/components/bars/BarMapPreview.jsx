import { useEffect, useMemo, useRef, useState } from 'react'
import OneMap from './OneMap'

const PAGE_SIZE = 6
const hasLocation = bar => Number.isFinite(bar.latitude) && Number.isFinite(bar.longitude)

function distanceKm(from, bar) {
  const radians = degrees => degrees * Math.PI / 180
  const deltaLat = radians(bar.latitude - from.latitude)
  const deltaLng = radians(bar.longitude - from.longitude)
  const arc = Math.sin(deltaLat / 2) ** 2 + Math.cos(radians(from.latitude)) *
    Math.cos(radians(bar.latitude)) * Math.sin(deltaLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc))
}

function BarCard({ bar, number, distance, onSelect }) {
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <button type="button" className="bars-directory-card" onClick={() => onSelect(bar)}>
      <span className="bars-directory-image">
        {bar.img && !imageFailed
          ? <img src={bar.img} alt={bar.imageAlt} loading="lazy" onError={() => setImageFailed(true)} />
          : <span className="bars-directory-monogram" aria-hidden="true">{bar.name.charAt(0)}</span>}
        <span className="bars-directory-number">{String(number).padStart(2, '0')}</span>
      </span>
      <span className="bars-directory-body">
        <span className="bars-directory-meta">{bar.neighborhood || 'Singapore'}{distance != null ? ` · ${distance.toFixed(1)} km away` : ''}</span>
        <strong>{bar.name}</strong>
        <span className="bars-directory-description">{bar.description || bar.vibe || 'A new place to discover.'}</span>
        <span className="bars-directory-footer"><span>{bar.vibe || 'Explore bar'}</span><span>Discover <span aria-hidden="true">↗</span></span></span>
      </span>
    </button>
  )
}

export default function BarMapPreview({ bars, onSelectBar }) {
  const directoryRef = useRef(null)
  const [area, setArea] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedBarId, setSelectedBarId] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle')
  const [page, setPage] = useState(1)

  const areas = useMemo(() => [...new Set(bars.map(bar => bar.neighborhood).filter(Boolean))].sort(), [bars])
  const visibleBars = useMemo(() => {
    const search = query.trim().toLowerCase()
    const matches = bars.filter(bar =>
      (area === 'all' || bar.neighborhood === area) &&
      (!search || [bar.name, bar.neighborhood, bar.vibe, bar.address]
        .some(value => value?.toLowerCase().includes(search)))
    )
    if (!userLocation) return matches.sort((a, b) => a.name.localeCompare(b.name))
    return matches.sort((a, b) => {
      if (!hasLocation(a)) return 1
      if (!hasLocation(b)) return -1
      return distanceKm(userLocation, a) - distanceKm(userLocation, b)
    })
  }, [area, bars, query, userLocation])

  const mappedBars = useMemo(() => visibleBars.filter(hasLocation), [visibleBars])
  const nearestBar = userLocation ? mappedBars[0] : null
  const totalPages = Math.max(1, Math.ceil(visibleBars.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageBars = visibleBars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selectedBar = visibleBars.find(bar => bar.id === selectedBarId)

  useEffect(() => { setPage(1) }, [area, query, userLocation])
  useEffect(() => {
    if (selectedBarId && !visibleBars.some(bar => bar.id === selectedBarId)) setSelectedBarId(null)
  }, [selectedBarId, visibleBars])

  const findNearMe = () => {
    if (!navigator.geolocation) { setLocationStatus('unsupported'); return }
    setLocationStatus('locating')
    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setLocationStatus('ready')
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }
  const changePage = nextPage => {
    setPage(nextPage)
    directoryRef.current?.scrollIntoView({ block: 'start' })
  }

  return (
    <>
      <div className="bars-discovery-toolbar">
        <label className="bars-search-field">
          <span className="visually-hidden">Search bars</span><span aria-hidden="true">⌕</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search bars or neighbourhoods" />
        </label>
        <label className="bars-area-field">
          <span className="visually-hidden">Filter by neighbourhood</span>
          <select value={area} onChange={event => setArea(event.target.value)}>
            <option value="all">All neighbourhoods</option>
            {areas.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button type="button" className={`bars-nearby-button${userLocation ? ' is-active' : ''}`}
          onClick={userLocation ? () => { setUserLocation(null); setLocationStatus('idle') } : findNearMe}
          disabled={locationStatus === 'locating'}>
          <span aria-hidden="true">◎</span> {locationStatus === 'locating' ? 'Finding you…' : userLocation ? 'Showing nearest · Clear' : 'Find bars near me'}
        </button>
      </div>
      {(locationStatus === 'denied' || locationStatus === 'unsupported') && (
        <p className="bars-location-message" role="status">
          {locationStatus === 'denied' ? 'We could not access your location. You can still choose a neighbourhood above.' : 'Your browser does not support location sharing. Choose a neighbourhood above.'}
        </p>
      )}
      {userLocation && (
        <div className="bars-nearest-result" role="status">
          {nearestBar ? (
            <>
              <span><small>Closest to you</small><strong>{nearestBar.name}</strong><em>{distanceKm(userLocation, nearestBar).toFixed(1)} km away · {nearestBar.neighborhood || 'Singapore'}</em></span>
              <button type="button" onClick={() => onSelectBar(nearestBar)}>View bar <span aria-hidden="true">↗</span></button>
            </>
          ) : <p>These bars do not have map locations yet. You can still browse them below.</p>}
        </div>
      )}
      <div className="bars-map-frame">
        <OneMap bars={mappedBars} selectedBarId={selectedBarId} userLocation={userLocation} onSelectMarker={setSelectedBarId} />
        {mappedBars.length === 0 && <div className="bars-map-notice">No map pins yet for these bars. Browse their profiles below.</div>}
        {selectedBar && (
          <div className="bars-map-selection">
            <button type="button" className="bars-map-selection-close" aria-label="Close bar preview" onClick={() => setSelectedBarId(null)}>×</button>
            <span>{selectedBar.neighborhood || 'Singapore'}</span>
            <strong>{selectedBar.name}</strong>
            <button type="button" onClick={() => onSelectBar(selectedBar)}>Explore this bar <span aria-hidden="true">↗</span></button>
          </div>
        )}
      </div>
      <section ref={directoryRef} className="bars-directory" aria-labelledby="bars-directory-title">
        <div className="bars-directory-heading">
          <div><p className="bars-kicker">The collection</p><h3 id="bars-directory-title">Explore every bar</h3></div>
          <span>{visibleBars.length} {visibleBars.length === 1 ? 'place' : 'places'}</span>
        </div>
        {visibleBars.length ? (
          <>
            <div className="bars-directory-grid">
              {pageBars.map((bar, index) => <BarCard key={bar.id} bar={bar}
                number={(currentPage - 1) * PAGE_SIZE + index + 1}
                distance={userLocation && hasLocation(bar) ? distanceKm(userLocation, bar) : null}
                onSelect={onSelectBar} />)}
            </div>
            {totalPages > 1 && (
              <nav className="bars-pagination" aria-label="Bar pages">
                <button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>← Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>Next →</button>
              </nav>
            )}
          </>
        ) : (
          <div className="bars-no-results">
            <h4>No bars found here yet.</h4><p>Try another neighbourhood or search term.</p>
            <button type="button" onClick={() => { setArea('all'); setQuery('') }}>Show all bars</button>
          </div>
        )}
      </section>
    </>
  )
}
