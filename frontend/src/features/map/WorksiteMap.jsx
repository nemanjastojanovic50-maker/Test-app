import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import L from 'leaflet'

import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import marker1x from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
})

function ClickToSetMarker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function FixLeafletResize() {
  const map = useMap()

  useEffect(() => {
    const resizeMap = () => {
      map.invalidateSize()
    }
    
    const t1 = setTimeout(resizeMap, 100)
    const t2 = setTimeout(resizeMap, 300)
    const t3 = setTimeout(resizeMap, 500)
    
    const onResize = () => {
      resizeMap()
    }
    
    window.addEventListener('resize', onResize)
    
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('resize', onResize)
    }
  }, [map])

  return null
}

import WorksiteMarker from './WorksiteMarker'

export default function WorksiteMap({
  picked,
  onPick,
  worksites = [],
  assignedCountByWorksiteId = {},
  selectedWorksiteId = null,
  onSelectWorksite,
  onDropWorker,
}) {
  const center = useMemo(() => {
    if (picked) return [picked.lat, picked.lng]
    if (worksites.length > 0 && worksites[0]?.lat != null && worksites[0]?.lng != null) {
      return [Number(worksites[0].lat), Number(worksites[0].lng)]
    }
    return [44.8176, 20.4633]
  }, [picked, worksites])

  useEffect(() => {
    const timer = setTimeout(() => {
      const mapElement = document.querySelector('.worksite-map-container .leaflet-container')
      if (mapElement) {
        window.dispatchEvent(new Event('resize'))
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0 }}>
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%', margin: 0, padding: 0 }}
        className="worksite-map-container"
      >
        <FixLeafletResize />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToSetMarker onPick={onPick} />

        {/* Pin for picked location (before creating worksite) */}
        {picked && <Marker position={[picked.lat, picked.lng]} />}

        {/* Custom worksite markers (drop targets) */}
        {worksites
          .filter((w) => w.lat != null && w.lng != null)
          .map((w) => (
            <WorksiteMarker
              key={w.id}
              worksite={w}
              assignedCount={assignedCountByWorksiteId[String(w.id)] ?? 0}
              isSelected={String(selectedWorksiteId) === String(w.id)}
              onSelect={onSelectWorksite}
              onDropWorker={onDropWorker}
            />
          ))}
      </MapContainer>
    </div>
  )
}
