export default function WorksiteList({
  worksites,
  selectedWorksiteId = null,
  onSelectWorksiteId,
  onDropWorkerOnWorksite,
}) {
  return (
    <>
      <h2>Recent worksites</h2>
      <ul>
        {worksites.map((w) => (
          <li
            key={w.id}
            onClick={() => onSelectWorksiteId?.(w.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const workerId = e.dataTransfer.getData('text/worker-id')
              if (!workerId) return
              onDropWorkerOnWorksite?.(workerId, w.id)
            }}
            style={{
              padding: 10,
              borderRadius: 10,
              border: '1px solid #e6e6e6',
              marginBottom: 10,
              background: String(selectedWorksiteId) === String(w.id) ? '#eef6ff' : 'white',
              cursor: onSelectWorksiteId ? 'pointer' : 'default',
            }}
          >
            <strong>{w.title}</strong>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {w.address_text || '—'} | {Number(w.lat).toFixed(5)}, {Number(w.lng).toFixed(5)}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
