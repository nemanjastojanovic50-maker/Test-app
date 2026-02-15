export default function WorksiteForm({ title, setTitle, addressText, setAddressText, picked, saving, onCreate }) {
  const isEnabled = title.trim() && picked && !saving
  return (
    <>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
        placeholder="e.g. Cleaning site - Zvezdara"
      />

      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Address (optional)</label>
      <input
        value={addressText}
        onChange={(e) => setAddressText(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
        placeholder="Street, city"
      />

      <button
        onClick={onCreate}
        disabled={!isEnabled}
        className={isEnabled ? 'btn-primary btn-primary--green' : ''}
        style={{
          padding: '12px 24px',
          width: '100%',
          marginTop: 16,
          background: isEnabled ? '#4CAF50' : '#d1d5db',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: isEnabled ? 'pointer' : 'not-allowed',
          fontWeight: 500,
          fontSize: 15,
          transition: 'background 0.2s ease',
        }}
      >
        {saving ? 'Saving...' : 'Create worksite'}
      </button>

      {picked && (
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 16 }}>
          Picked: {picked.lat.toFixed(6)}, {picked.lng.toFixed(6)}
        </p>
      )}
    </>
  )
}
