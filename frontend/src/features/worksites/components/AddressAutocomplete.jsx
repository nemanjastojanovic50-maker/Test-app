import { useState, useEffect, useRef } from 'react'
import { searchAddresses } from '../../../services/geocoding.service'

const DEBOUNCE_MS = 350

export default function AddressAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value ?? '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (value !== undefined && value !== query) setQuery(value)
  }, [value])

  useEffect(() => {
    const q = (query || '').trim()
    if (q.length < 2) {
      setSuggestions([])
      setLoading(false)
      setOpen(false)
      return
    }

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    setLoading(true)
    setError(null)

    const timer = setTimeout(async () => {
      try {
        const results = await searchAddresses(q, { signal })
        if (signal.aborted) return
        setSuggestions(results)
        setOpen(true)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
        setSuggestions([])
        setOpen(true)
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item) => {
    setQuery(item.label)
    setOpen(false)
    onChange?.(item.label)
    onSelect?.({ label: item.label, lat: item.lat, lng: item.lng })
  }

  const handleInputChange = (e) => {
    const v = e.target.value
    setQuery(v)
    onChange?.(v)
    if (!v) onSelect?.(null)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Search for an address..."
        style={{
          width: '100%',
          padding: 10,
          margin: '6px 0 12px',
          border: '1px solid #e6e6e6',
          borderRadius: 6,
          fontSize: 14,
          boxSizing: 'border-box',
        }}
      />

      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e6e6e6',
            borderRadius: 6,
            marginTop: 4,
            padding: 12,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: 13, color: '#666' }}>Searching...</span>
        </div>
      )}

      {open && !loading && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e6e6e6',
            borderRadius: 6,
            marginTop: 4,
            maxHeight: 300,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {error && (
            <div style={{ padding: 12, fontSize: 13, color: '#c33' }}>{error}</div>
          )}
          {suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(s)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(s)}
                style={{
                  padding: 12,
                  cursor: 'pointer',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
              >
                <div style={{ fontWeight: 500, fontSize: 14 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {s.lat?.toFixed(5)}, {s.lng?.toFixed(5)}
                </div>
              </div>
            ))
          ) : !error && query.trim().length >= 2 && (
            <div style={{ padding: 12, fontSize: 13, color: '#666' }}>No results</div>
          )}
        </div>
      )}
    </div>
  )
}
