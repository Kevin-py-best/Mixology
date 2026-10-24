import { useEffect, useRef, useState } from 'react'

const SINGAPORE_CENTER = [1.3521, 103.8198]
const SINGAPORE_BOUNDS = [[1.14, 103.53], [1.50, 104.51]]
const MAP_STYLES = [
  { id: 'GreyLite', label: 'Clean' },
  { id: 'Default', label: 'Street' },
  { id: 'Night', label: 'Night' },
]
const ONEMAP_ATTRIBUTION = '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer"><img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" alt="OneMap" style="height:20px;width:20px;vertical-align:middle" /></a>&nbsp;© contributors | <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
let leafletPromise

function loadOneMapLibrary() {
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('[data-onemap-css]')) {
      const stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.href = 'https://www.onemap.gov.sg/web-assets/libs/leaflet/leaflet.css'
      stylesheet.dataset.onemapCss = ''
      document.head.appendChild(stylesheet)
    }
    const script = document.createElement('script')
    script.src = 'https://www.onemap.gov.sg/web-assets/libs/leaflet/onemap-leaflet.js'
    script.async = true
    script.onload = () => window.L ? resolve(window.L) : reject(new Error('OneMap did not load'))
    script.onerror = () => reject(new Error('OneMap did not load'))
    document.head.appendChild(script)
  }).catch(error => {
    leafletPromise = null
    throw error
  })
  return leafletPromise
}

export default function OneMap({ bars, selectedBarId, userLocation, onSelectMarker, allowStyleSwitch = true }) {
  const containerRef = useRef(null)
  const layerRef = useRef(null)
  const markersRef = useRef(new Map())
  const userMarkerRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [mapInstance, setMapInstance] = useState(null)
  const [mapStyle, setMapStyle] = useState('GreyLite')

  useEffect(() => {
    let cancelled = false
    let map
    loadOneMapLibrary().then(L => {
      if (cancelled) return
      map = L.map(containerRef.current, {
        center: SINGAPORE_CENTER, zoom: 12, minZoom: 11, maxZoom: 19,
        maxBounds: SINGAPORE_BOUNDS, scrollWheelZoom: false,
      })
      layerRef.current = L.layerGroup().addTo(map)
      setMapInstance(map)
      map.on('click', () => onSelectMarker(null))
    }).catch(() => {
      if (!cancelled) setStatus('unavailable')
    })
    return () => {
      cancelled = true
      map?.remove()
      layerRef.current = null
      markersRef.current.clear()
    }
  }, [onSelectMarker])

  useEffect(() => {
    if (!mapInstance || !window.L) return
    const L = window.L
    let tileLoaded = false
    let tileErrors = 0
    setStatus('loading')
    const tiles = L.tileLayer(`https://www.onemap.gov.sg/maps/tiles/${mapStyle}/{z}/{x}/{y}.png`, {
      minZoom: 11, maxZoom: 19, attribution: ONEMAP_ATTRIBUTION,
    })
    tiles.on('tileload', () => { tileLoaded = true; setStatus('ready') })
    tiles.on('tileerror', () => {
      tileErrors += 1
      if (!tileLoaded && tileErrors >= 3) setStatus('unavailable')
    })
    tiles.addTo(mapInstance)
    const timeout = window.setTimeout(() => { if (!tileLoaded) setStatus('unavailable') }, 12000)
    return () => {
      window.clearTimeout(timeout)
      tiles.remove()
    }
  }, [mapInstance, mapStyle])

  useEffect(() => {
    const L = window.L
    const map = mapInstance
    const layer = layerRef.current
    if (!map || !layer || !L) return
    layer.clearLayers()
    markersRef.current.clear()

    bars.forEach(bar => {
      const icon = L.divIcon({
        className: 'bars-onemap-marker',
        html: '<span aria-hidden="true"></span>',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      })
      const marker = L.marker([bar.latitude, bar.longitude], {
        icon, keyboard: true, title: `Open ${bar.name} preview`,
      }).addTo(layer)
      marker.bindTooltip(bar.name, { direction: 'top', offset: [0, -8] })
      marker.on('click', event => { L.DomEvent.stopPropagation(event.originalEvent); onSelectMarker(bar.id) })
      const element = marker.getElement()
      element?.setAttribute('role', 'button')
      element?.setAttribute('aria-label', `Open ${bar.name} preview`)
      element?.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelectMarker(bar.id)
        }
      })
      markersRef.current.set(bar.id, marker)
    })

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current)
    const locationOnMap = userLocation &&
      userLocation.latitude >= SINGAPORE_BOUNDS[0][0] &&
      userLocation.latitude <= SINGAPORE_BOUNDS[1][0] &&
      userLocation.longitude >= SINGAPORE_BOUNDS[0][1] &&
      userLocation.longitude <= SINGAPORE_BOUNDS[1][1]
    userMarkerRef.current = locationOnMap ? L.circleMarker([userLocation.latitude, userLocation.longitude], {
      radius: 9, color: '#FFFFFF', weight: 3, fillColor: '#5A9BB3', fillOpacity: 1,
    }).addTo(map).bindTooltip('Your location') : null

    if (bars.length) {
      const bounds = L.latLngBounds(bars.map(bar => [bar.latitude, bar.longitude]))
      if (locationOnMap) bounds.extend([userLocation.latitude, userLocation.longitude])
      map.fitBounds(bounds.pad(0.28), { maxZoom: 14, animate: false })
    } else {
      map.setView(SINGAPORE_CENTER, 12, { animate: false })
    }
    window.setTimeout(() => map.invalidateSize(), 0)
  }, [bars, mapInstance, onSelectMarker, userLocation])

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.getElement()?.classList.toggle('is-selected', id === selectedBarId)
    })
    const selected = markersRef.current.get(selectedBarId)
    if (selected) mapInstance?.panTo(selected.getLatLng(), { animate: true })
  }, [mapInstance, selectedBarId])

  return (
    <div className="bars-onemap-wrap">
      <div ref={containerRef} className="bars-onemap" aria-label="Map of bars in Singapore" />
      {allowStyleSwitch && (
        <div className="bars-map-styles" role="group" aria-label="Map appearance">
          {MAP_STYLES.map(style => (
            <button type="button" key={style.id} aria-pressed={mapStyle === style.id}
              onClick={() => setMapStyle(style.id)}>{style.label}</button>
          ))}
        </div>
      )}
      {status === 'unavailable' && <div className="bars-map-fallback" role="status">The map is unavailable right now. You can still explore every bar below.</div>}
    </div>
  )
}
