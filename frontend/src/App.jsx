import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import WorksiteMap from './WorksiteMap'

export default function App() {
  const [session, setSession] = useState(null)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('worksites') // 'worksites' | 'workers'

  // worksites form
  const [title, setTitle] = useState('')
  const [addressText, setAddressText] = useState('')
  const [picked, setPicked] = useState(null)
  const [savingWorksite, setSavingWorksite] = useState(false)

  // workers form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [savingWorker, setSavingWorker] = useState(false)

  // lists
  const [worksites, setWorksites] = useState([])
  const [workers, setWorkers] = useState([])
  const [loadingLists, setLoadingLists] = useState(false)
  const [assignments, setAssignments] = useState([])


  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const loadData = async () => {
    setLoadingLists(true)
    setMsg('')

    const [{ data: ws, error: wsErr }, { data: w, error: wErr }, { data: a, error: aErr }] = await Promise.all([
  supabase.from('worksites').select('*').order('created_at', { ascending: false }),
  supabase.from('workers').select('*').order('created_at', { ascending: false }),
  supabase
    .from('assignments')
    .select('id, worksite_id, worker:workers(id, first_name, last_name)')
    .order('assigned_at', { ascending: false }),
])


    setLoadingLists(false)

    if (wsErr) return setMsg(`Worksites error: ${wsErr.message}`)
    if (wErr) return setMsg(`Workers error: ${wErr.message}`)
    if (aErr) return setMsg(`Assignments error: ${aErr.message}`)
    
    setWorksites(ws ?? [])
    setWorkers(w ?? [])
  }

  useEffect(() => {
    if (session) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const sendMagicLink = async (email) => {
    setMsg('Sending link...')
    const { error } = await supabase.auth.signInWithOtp({ email })
    setMsg(error ? `Error: ${error.message}` : 'Check your email for the login link.')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const createWorksite = async () => {
    if (!title.trim()) return setMsg('Title is required.')
    if (!picked) return setMsg('Pick a location on the map.')

    setSavingWorksite(true)
    setMsg('Saving worksite...')

    const { error } = await supabase.from('worksites').insert({
      title: title.trim(),
      address_text: addressText.trim() || null,
      lat: picked.lat,
      lng: picked.lng,
    })

    setSavingWorksite(false)

    if (error) return setMsg(`Error: ${error.message}`)

    setTitle('')
    setAddressText('')
    setPicked(null)
    setMsg('Worksite saved.')
    loadData()
  }

  const createWorker = async () => {
    if (!firstName.trim()) return setMsg('First name is required.')
    if (!lastName.trim()) return setMsg('Last name is required.')

    setSavingWorker(true)
    setMsg('Saving worker...')

    // 1) Insert worker
    const { data: insertedWorkers, error: wErr } = await supabase
      .from('workers')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        note: note.trim() || null,
      })
      .select('id')
      .limit(1)

    if (wErr) {
      setSavingWorker(false)
      return setMsg(`Error: ${wErr.message}`)
    }


    const workerId = insertedWorkers?.[0]?.id
    if (!workerId) {
      setSavingWorker(false)
      return setMsg('Error: Worker created but ID missing.')
    }

    // 2) Create assignment row (Unassigned: worksite_id = null)
    const { error: aErr } = await supabase.from('assignments').insert({
      worker_id: workerId,
      worksite_id: null,
    })

    setSavingWorker(false)

    if (aErr) return setMsg(`Worker saved, but assignment failed: ${aErr.message}`)

    setFirstName('')
    setLastName('')
    setPhone('')
    setNote('')
    setMsg('Worker saved.')
    loadData()
  }
  
  const moveWorker = async (assignmentId, nextWorksiteId) => {
  setMsg('Updating assignment...')

  const { error } = await supabase
    .from('assignments')
    .update({ worksite_id: nextWorksiteId }) // null = Unassigned
    .eq('id', assignmentId)

  if (error) return setMsg(`Error: ${error.message}`)

  setMsg('Updated.')
  loadData()
}

  const appTitle = useMemo(() => {
    return tab === 'worksites' ? 'Worksites' : 'Workers'
  }, [tab])

  if (!session) {
    return (
      <div style={{ padding: 24, maxWidth: 520 }}>
        <h1>Login</h1>
        <AuthBox onSend={sendMagicLink} msg={msg} />
      </div>
    )
  }

  return (
    <div style={{ padding: 24, width: '100vw', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{appTitle}</h1>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{session.user.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('worksites')} disabled={tab === 'worksites'}>
            Worksites
          </button>
          <button onClick={() => setTab('workers')} disabled={tab === 'workers'}>
            Workers
          </button>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
  {tab === 'worksites' ? (
    <WorksitesTab
      title={title}
      setTitle={setTitle}
      addressText={addressText}
      setAddressText={setAddressText}
      picked={picked}
      setPicked={setPicked}
      saving={savingWorksite}
      createWorksite={createWorksite}
      worksites={worksites}
      assignments={assignments}
      moveWorker={moveWorker}
    />

        ) : (
          <WorkersTab
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            phone={phone}
            setPhone={setPhone}
            note={note}
            setNote={setNote}
            saving={savingWorker}
            createWorker={createWorker}
            workers={workers}
          />
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={loadData} disabled={loadingLists}>
            {loadingLists ? 'Refreshing...' : 'Refresh'}
          </button>
          <span style={{ marginLeft: 12 }}>{msg}</span>
        </div>
      </div>
    </div>
  )
}

function WorksitesTab({
  title,
  setTitle,
  addressText,
  setAddressText,
  picked,
  setPicked,
  saving,
  createWorksite,
  worksites,
  assignments,
  moveWorker,
}) {
  return (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '420px 1fr', alignItems: 'start' }}>
      <div>
        <h2 style={{ marginTop: 0 }}>Add worksite</h2>

        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '6px 0 12px' }}
          placeholder="e.g. Cleaning site - Zvezdara"
        />

        <label>Address (optional)</label>
        <input
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '6px 0 12px' }}
          placeholder="Street + number, city"
        />

        <button onClick={createWorksite} disabled={saving} style={{ padding: 10, width: '100%' }}>
          {saving ? 'Saving...' : 'Create worksite'}
        </button>

        {picked && (
          <p style={{ fontSize: 12, opacity: 0.8, marginTop: 12 }}>
            Picked: {picked.lat.toFixed(6)}, {picked.lng.toFixed(6)}
          </p>
        )}

       <h2>Recent worksites</h2>
<ul>
  {worksites.map((w) => (
    <li key={w.id}>
      <strong>{w.title}</strong>
      <div style={{ fontSize: 12, opacity: 0.75 }}>
        {w.address_text || '—'} | {Number(w.lat).toFixed(5)}, {Number(w.lng).toFixed(5)}
      </div>
    </li>
  ))}
</ul>

<h2 style={{ marginTop: 24 }}>Assignments</h2>

<KanbanBoard
  worksites={worksites}
  assignments={assignments}
  onMove={moveWorker}
/>
</div>

      <div style={{ minWidth: 0 }}>
        <h2 style={{ marginTop: 0 }}>Map</h2>
        <WorksiteMap
         picked={picked} onPick={setPicked} worksites={worksites} onSelectWorksite={(w) => ({lat: Number(w.lat), lng: Number(w.lng)})} />
      </div>
    </div>
  )
}

function WorkersTab({ firstName, setFirstName, lastName, setLastName, phone, setPhone, note, setNote, saving, createWorker, workers }) {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '420px 1fr' }}>
      <div>
        <h2 style={{ marginTop: 0 }}>Add worker</h2>

        <label>First name</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '6px 0 12px' }}
          placeholder="e.g. Marko"
        />

        <label>Last name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '6px 0 12px' }}
          placeholder="e.g. Markovic"
        />

        <label>Phone (optional)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '6px 0 12px' }}
          placeholder="+381..."
        />

        <label>Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '6px 0 12px', minHeight: 90 }}
          placeholder="Any details..."
        />

        <button onClick={createWorker} disabled={saving} style={{ padding: 10, width: '100%' }}>
          {saving ? 'Saving...' : 'Create worker'}
        </button>
      </div>

      <div>
        <h2 style={{ marginTop: 0 }}>Workers</h2>
        <ul>
          {workers.map((w) => (
            <li key={w.id}>
              <strong>
                {w.first_name} {w.last_name}
              </strong>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {w.phone || '—'} {w.note ? `| ${w.note}` : ''}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function AuthBox({ onSend, msg }) {
  const [email, setEmail] = useState('')

  return (
    <>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />
      <button onClick={() => onSend(email)} style={{ padding: 10 }}>
        Send magic link
      </button>
      <p>{msg}</p>
    </>
  )
}

function KanbanBoard({ worksites, assignments, onMove }) {
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