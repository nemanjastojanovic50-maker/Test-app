export default function KanbanBoard({ worksites, assignments, onMove }) {
  const columns = [
    { id: null, title: 'Unassigned' },
    ...worksites.map((w) => ({ id: w.id, title: w.title })),
  ]

  const byWorksite = new Map(columns.map((c) => [c.id, []]))

  for (const a of assignments) {
    if (!byWorksite.has(a.worksite_id)) byWorksite.set(a.worksite_id, [])
    byWorksite.get(a.worksite_id).push(a)
  }

  const onDrop = (e, worksiteId) => {
    e.preventDefault()
    const assignmentId = e.dataTransfer.getData('text/assignment-id')
    if (!assignmentId) return
    onMove(assignmentId, worksiteId)
  }

  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
      {columns.map((col) => (
        <div
          key={String(col.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, col.id)}
          style={{
            minWidth: 260,
            background: '#f6f6f6',
            borderRadius: 12,
            padding: 12,
            border: '1px solid #e6e6e6',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            {col.title}
          </div>

          {(byWorksite.get(col.id) ?? []).map((a) => (
            <div
              key={a.id}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData('text/assignment-id', a.id)
              }
              style={{
                background: 'white',
                border: '1px solid #e6e6e6',
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                cursor: 'grab',
              }}
            >
              {a.worker?.first_name} {a.worker?.last_name}
            </div>
          ))}

          {(byWorksite.get(col.id) ?? []).length === 0 && (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Drop workers here
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
