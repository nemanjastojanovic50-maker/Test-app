import { useState, useEffect } from 'react'

function buildShiftDetailsMessage(worksite, selectedDate, shift) {
  const lines = [
    'CrewFlow shift details',
    '',
    `Worksite: ${worksite?.title ?? '—'}`,
    `Address: ${worksite?.address_text?.trim() || '—'}`,
    `Date: ${selectedDate ?? '—'}`,
    `Worker pay: ${Number(shift?.worker_pay) || 0} RSD/worker/day`,
  ]
  const lat = worksite?.lat != null && worksite?.lng != null ? Number(worksite.lat) : null
  const lng = worksite?.lng != null ? Number(worksite.lng) : null
  if (lat != null && lng != null) {
    lines.push('', `Map: https://www.google.com/maps?q=${lat},${lng}`)
  }
  return lines.join('\n')
}

export default function WorksiteDetailPanel({
  worksite,
  assignedWorkers,
  shift,
  selectedDate,
  onDateChange,
  onSaveShift,
  onClose,
  onRemoveWorker,
}) {
  const [requiredWorkers, setRequiredWorkers] = useState('0')
  const [clientRate, setClientRate] = useState('0')
  const [workerPay, setWorkerPay] = useState('0')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (shift) {
      setRequiredWorkers(String(shift.required_workers ?? 0))
      setClientRate(String(shift.client_rate ?? 0))
      setWorkerPay(String(shift.worker_pay ?? 0))
    } else {
      setRequiredWorkers('0')
      setClientRate('0')
      setWorkerPay('0')
    }
  }, [shift])

  const handleSave = async () => {
    if (!worksite) return
    setSaving(true)
    await onSaveShift({
      worksiteId: worksite.id,
      workDate: selectedDate,
      requiredWorkers: Number(requiredWorkers) || 0,
      clientRate: Number(clientRate) || 0,
      workerPay: Number(workerPay) || 0,
    })
    setSaving(false)
  }

  if (!worksite) return null

  const assignedCount = assignedWorkers.length
  const rev = (shift?.client_rate ?? 0) * assignedCount
  const cost = (shift?.worker_pay ?? 0) * assignedCount
  const profit = rev - cost
  const required = shift?.required_workers ?? 0
  const coverage = required > 0 ? `${assignedCount}/${required}` : (assignedCount > 0 ? `${assignedCount}/—` : '—')

  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: '1px solid #EEEEEE',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 24, borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{worksite.title}</h2>
          <div style={{ fontSize: 13, color: '#757575', marginTop: 8 }}>{worksite.address_text || '—'}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            opacity: 0.7,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
        {/* Shift settings */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Shift settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#757575', marginBottom: 4 }}>Work date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#757575', marginBottom: 4 }}>Required workers</label>
              <input
                type="number"
                min={0}
                value={requiredWorkers}
                onChange={(e) => setRequiredWorkers(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#757575', marginBottom: 4 }}>Client rate (RSD/worker/day)</label>
              <input
                type="number"
                min={0}
                value={clientRate}
                onChange={(e) => setClientRate(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#757575', marginBottom: 4 }}>Worker pay (RSD/worker/day)</label>
              <input
                type="number"
                min={0}
                value={workerPay}
                onChange={(e) => setWorkerPay(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 16px',
                background: '#1976D2',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Finance summary */}
        <div style={{ marginBottom: 24, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Finance summary</div>
          <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#757575' }}>Assigned</span>
              <span>{assignedCount} worker{assignedCount !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#757575' }}>Coverage</span>
              <span>{coverage} assigned</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#757575' }}>Revenue</span>
              <span>{rev.toLocaleString()} RSD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#757575' }}>Cost</span>
              <span>{cost.toLocaleString()} RSD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, paddingTop: 6, borderTop: '1px solid #e5e7eb' }}>
              <span>Profit</span>
              <span style={{ color: profit >= 0 ? '#166534' : '#b91c1c' }}>{profit.toLocaleString()} RSD</span>
            </div>
          </div>
        </div>

        {/* Assigned workers */}
        <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Assigned workers</div>
        {assignedWorkers.length === 0 ? (
          <div style={{ fontSize: 13, color: '#757575' }}>None. Drag a worker from the left onto this worksite on the map.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {assignedWorkers.map((a) => {
              const workerEmail = a.worker?.email?.trim()
              const messageBody = buildShiftDetailsMessage(worksite, selectedDate, shift)
              const gmailHref = workerEmail
                ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(workerEmail)}&su=${encodeURIComponent('CrewFlow shift details')}&body=${encodeURIComponent(messageBody)}`
                : null
              return (
                <li
                  key={a.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 0',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <span style={{ fontSize: 14, flex: '1 1 auto' }}>
                    {a.worker?.first_name} {a.worker?.last_name}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {gmailHref ? (
                      <a
                        href={gmailHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 12px',
                          fontSize: 12,
                          background: '#1976D2',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          textDecoration: 'none',
                        }}
                      >
                        Send email (Gmail)
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onRemoveWorker(a.worker?.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        background: 'transparent',
                        color: '#F44336',
                        border: '1px solid #FFCDD2',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
