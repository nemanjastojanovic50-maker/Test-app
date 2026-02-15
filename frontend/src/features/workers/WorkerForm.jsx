export default function WorkerForm({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  note,
  setNote,
  saving,
  onCreate,
}) {
  const fieldGap = 16
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    marginTop: 8,
    marginBottom: 0,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
  }
  return (
    <>
      <div style={{ marginBottom: fieldGap }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>First name</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={inputStyle}
          placeholder="e.g. Marko"
        />
      </div>
      <div style={{ marginBottom: fieldGap }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Last name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={inputStyle}
          placeholder="e.g. Markovic"
        />
      </div>
      <div style={{ marginBottom: fieldGap }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Phone (optional)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
          placeholder="+381..."
        />
      </div>
      <div style={{ marginBottom: fieldGap }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
          placeholder="Any details..."
        />
      </div>
      <button
        onClick={onCreate}
        disabled={saving}
        className="btn-primary"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px 24px',
          marginTop: 16,
          background: '#1976D2',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s ease',
        }}
      >
        {saving ? 'Saving...' : 'Create worker'}
      </button>
    </>
  )
}
