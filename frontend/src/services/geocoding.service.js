/**
 * Free geocoding: Photon (Komoot) primary, Nominatim (OSM) fallback.
 * No API keys required.
 * Biased toward Belgrade, Serbia (lat 44.82, lon 20.46).
 */

const PHOTON_URL = 'https://photon.komoot.io/api/'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Belgrade center – used to bias results toward Serbia/Belgrade
const BELGRADE_LAT = 44.8176
const BELGRADE_LON = 20.4633
const SERBIA_COUNTRY_CODE = 'rs'

function buildPhotonLabel(properties) {
  if (!properties) return ''
  const parts = [
    properties.name,
    properties.street,
    properties.housenumber,
    properties.postcode,
    properties.city,
    properties.state,
    properties.country,
  ].filter(Boolean)
  return parts.join(', ') || 'Unknown'
}

function parsePhotonFeature(feature) {
  const coords = feature.geometry?.coordinates
  if (!coords || coords.length < 2) return null
  const lng = coords[0]
  const lat = coords[1]
  const label = buildPhotonLabel(feature.properties)
  return { label, lat, lng }
}

function parseNominatimItem(item) {
  const lat = parseFloat(item.lat)
  const lng = parseFloat(item.lon)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  const label = item.display_name || `${lat}, ${lng}`
  return { label, lat, lng }
}

/**
 * Search addresses. Returns normalized { label, lat, lng }[].
 * @param {string} query
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<{ label: string, lat: number, lng: number }[]>}
 */
export async function searchAddresses(query, { signal } = {}) {
  const q = (query || '').trim()
  if (q.length < 2) return []

  const limit = 5

  // 1) Try Photon (biased toward Belgrade so results favor Serbia)
  try {
    const url = `${PHOTON_URL}?q=${encodeURIComponent(q)}&limit=${limit}&lat=${BELGRADE_LAT}&lon=${BELGRADE_LON}`
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(`Photon ${res.status}`)
    const data = await res.json()
    const features = data.features || []
    const results = features
      .map(parsePhotonFeature)
      .filter(Boolean)
      .slice(0, limit)
    if (results.length > 0) return results
  } catch (err) {
    if (err.name === 'AbortError') throw err
    // Fall through to Nominatim
  }

  // 2) Fallback: Nominatim (restrict to Serbia for Belgrade-focused use)
  try {
    const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(q)}&limit=${limit}&countrycodes=${SERBIA_COUNTRY_CODE}`
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = await res.json()
    const list = Array.isArray(data) ? data : []
    return list.map(parseNominatimItem).filter(Boolean).slice(0, limit)
  } catch (err) {
    if (err.name === 'AbortError') throw err
    return []
  }
}
