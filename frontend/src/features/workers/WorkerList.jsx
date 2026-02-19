const AVATAR_COLORS = ['#B3E5FC', '#FFCC80', '#C8E6C9']

function getInitials(firstName, lastName) {
  const f = (firstName || '').trim().slice(0, 1).toUpperCase()
  const l = (lastName || '').trim().slice(0, 1).toUpperCase()
  return (f + l) || '?'
}

function getStatusColor(note) {
  if (!note || !note.trim()) return '#4CAF50' // green - available
  return '#FFB300' // orange - has note (e.g. availability)
}

export default function WorkerList({ workers, onEditWorker }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {workers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#757575', fontSize: 14 }}>
          No workers yet. Click "+ Add worker" to create one.
        </div>
      ) : (
        workers.map((w, i) => {
          const initials = getInitials(w.first_name, w.last_name)
          const avatarBg = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const statusColor = getStatusColor(w.note)
          const statusText = (w.note && w.note.trim()) ? w.note : 'Available'
          return (
            <div
              key={w.id}
              className="worker-card"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/worker-id', String(w.id))
                e.dataTransfer.effectAllowed = 'move'
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #EEEEEE',
                borderRadius: 12,
                padding: 16,
                cursor: 'grab',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                transition: 'box-shadow 0.2s ease, background 0.2s ease, transform 0.15s ease',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: avatarBg,
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#212121' }}>
                  {w.first_name} {w.last_name}
                </div>
                <div style={{ fontSize: 13, color: '#757575', marginTop: 4 }}>
                  {w.phone || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: statusColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#757575' }}>{statusText}</span>
                </div>
              </div>
              {onEditWorker && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onEditWorker(w)
                  }}
                  style={{
                    flexShrink: 0,
                    padding: '8px 12px',
                    fontSize: 12,
                    background: '#f5f5f5',
                    color: '#424242',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
