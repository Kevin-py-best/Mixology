import OneMap from './OneMap'

const ignoreSelection = () => {}

export default function BarLocationMap({ bar }) {
  return (
    <div className="bar-location-map">
      <OneMap bars={[bar]} selectedBarId={bar.id} userLocation={null} onSelectMarker={ignoreSelection} allowStyleSwitch={false} />
    </div>
  )
}
