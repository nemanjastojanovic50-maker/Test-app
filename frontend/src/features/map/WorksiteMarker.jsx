import { useRef, useEffect, useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const HOVER_CLASS = 'worksite-marker--drag-over'

function createMarkerIcon(worksite, assignedCount, isSelected) {
  const shortTitle = (worksite.title || '').slice(0, 14) + ((worksite.title || '').length > 14 ? '…' : '')
  const bg = '#4CAF50'
  const border = isSelected ? '#212121' : '#fff'
  return L.divIcon({
    className: 'worksite-marker',
    html: `
      <div
        class="worksite-marker__badge"
        data-worksite-id="${worksite.id}"
        style="
          min-width: 56px;
          padding: 6px 10px;
          border-radius: 999px;
          background: ${bg};
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border: 2px solid ${border};
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        "
      >
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${shortTitle}</div>
        <div style="font-size: 11px; opacity: 0.95;">${assignedCount} worker${assignedCount !== 1 ? 's' : ''}</div>
      </div>
    `,
    iconSize: [80, 44],
    iconAnchor: [40, 22],
  })
}

export default function WorksiteMarker({ worksite, assignedCount, isSelected, onSelect, onDropWorker }) {
  const markerRef = useRef(null)

  useEffect(() => {
    const id = worksite.id
    const onDrop = onDropWorker
    let cleanup = () => {}
    const tryAttach = () => {
      const marker = markerRef.current
      const el = marker?._icon
      if (!el) return false
      const badge = el.querySelector?.('.worksite-marker__badge') || el

      const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        badge.classList?.add(HOVER_CLASS)
        badge.style.transform = 'scale(1.15)'
      }

      const handleDragLeave = () => {
        badge.classList?.remove(HOVER_CLASS)
        badge.style.transform = ''
      }

      const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        badge.classList?.remove(HOVER_CLASS)
        badge.style.transform = ''
        const workerId = e.dataTransfer.getData('text/worker-id')
        if (workerId) onDrop?.(workerId, id)
      }

      badge.addEventListener('dragover', handleDragOver)
      badge.addEventListener('dragleave', handleDragLeave)
      badge.addEventListener('drop', handleDrop)
      cleanup = () => {
        badge.removeEventListener('dragover', handleDragOver)
        badge.removeEventListener('dragleave', handleDragLeave)
        badge.removeEventListener('drop', handleDrop)
      }
    }
    const t = setTimeout(tryAttach, 150)
    return () => {
      clearTimeout(t)
      cleanup()
    }
  }, [worksite.id, assignedCount, isSelected, onDropWorker])

  const assignedCountNum = Number(assignedCount) || 0
  const icon = useMemo(
    () => createMarkerIcon(worksite, assignedCountNum, isSelected),
    [worksite, assignedCountNum, isSelected]
  )

  return (
    <Marker
      ref={markerRef}
      position={[Number(worksite.lat), Number(worksite.lng)]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect?.(worksite),
      }}
    >
      <Popup className="worksite-popup-card">
        <div
          style={{
            minWidth: 200,
            padding: 4,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 15, color: '#212121', marginBottom: 8 }}>
            {worksite.title}
          </div>
          <div style={{ fontSize: 13, color: '#757575', marginBottom: 12 }}>
            {worksite.address_text || '—'}
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#4CAF50',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {assignedCountNum} worker{assignedCountNum !== 1 ? 's' : ''}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
