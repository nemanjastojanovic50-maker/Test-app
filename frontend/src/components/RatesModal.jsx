import { useState } from 'react'

export default function RatesModal({ worksiteTitle, workDate, onSaveAndAssign, onClose }) {
  const [requiredWorkers, setRequiredWorkers] = useState('0')
  const [clientRate, setClientRate] = useState('0')
  const [workerPay, setWorkerPay] = useState('0')
  const [saving, setSaving] = useState(false)

  const handleSaveAndAssign = async () => {
    setSaving(true)
    try {
      await onSaveAndAssign({
        requiredWorkers: Number(requiredWorkers) || 0,
        clientRate: Number(clientRate) || 0,
        workerPay: Number(workerPay) || 0,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
      onClick={onClose}
    >
      <div
        className="app-modal-content"
        style={{
          background: 'var(--app-panel-bg)',
          color: 'var(--app-text)',
          padding: 24,
          borderRadius: 14,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px' }}>Set rates for this date</h3>
        {worksiteTitle && <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--app-text-muted)' }}>{worksiteTitle}</p>}
        <p style={{ margin: '0 0 16px', fontSize: 13 }}>Date: {workDate}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Required workers</label>
            <input
              type="number"
              min={0}
              value={requiredWorkers}
              onChange={(e) => setRequiredWorkers(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--app-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Client rate (RSD/worker/day)</label>
            <input
              type="number"
              min={0}
              value={clientRate}
              onChange={(e) => setClientRate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--app-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Worker pay (RSD/worker/day)</label>
            <input
              type="number"
              min={0}
              value={workerPay}
              onChange={(e) => setWorkerPay(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--app-border)', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--app-border)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndAssign}
            disabled={saving}
            style={{
              padding: '8px 16px',
              background: '#1976D2',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save & Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}
