import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
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
    const t = setTimeout(() => map.invalidateSize(), 100)
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [map])

  return null
}

export default function WorksiteMap({ picked, onPick, worksites = [], onSelectWorksite }) {
  const center = useMemo(() => {
    if (picked) return [picked.lat, picked.lng]
    if (worksites.length > 0 && worksites[0]?.lat && worksites[0]?.lng) {
      return [Number(worksites[0].lat), Number(worksites[0].lng)]
    }
    return [44.8176, 20.4633]
  }, [picked, worksites])

  return (
    <div style={{ height: '70vh', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <FixLeafletResize />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToSetMarker onPick={onPick} />

        {/* Marker za trenutno kliknut (pre kreiranja) */}
        {picked && <Marker position={[picked.lat, picked.lng]} />}

        {/* Markeri za sve postojeće worksites */}
        {worksites
          .filter((w) => w.lat != null && w.lng != null)
          .map((w) => (
            <Marker
              key={w.id}
              position={[Number(w.lat), Number(w.lng)]}
              eventHandlers={{
                click: () => onSelectWorksite?.(w),
              }}
            >
              <Popup>
                <div style={{ fontWeight: 600 }}>{w.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{w.address_text || '—'}</div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
