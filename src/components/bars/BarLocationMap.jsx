export default function BarLocationMap({ bar }) {
  return (
    <div className="bar-location-map" aria-label={`Map preview for ${bar.name}`}>
      <div className="bar-map-grid" aria-hidden="true" />
      <span className="bar-map-district bar-map-district-one">{bar.neighborhood}</span>
      <span className="bar-map-district bar-map-district-two">Singapore River</span>
      <span className="bar-map-road bar-map-road-one" aria-hidden="true" />
      <span className="bar-map-road bar-map-road-two" aria-hidden="true" />
      <button type="button" className="bar-detail-marker" aria-label={`${bar.name}, ${bar.address}`}>
        <span aria-hidden="true" />
      </button>
      <div className="bar-map-label">
        <strong>{bar.name}</strong>
        <span>{bar.address}</span>
      </div>
      <span className="bar-map-prototype-note">Prototype location preview</span>
    </div>
  )
}
