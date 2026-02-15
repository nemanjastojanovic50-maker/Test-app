import { useEffect, useMemo, useState } from 'react'
import WorkerForm from '../features/workers/WorkerForm'
import WorkerList from '../features/workers/WorkerList'
import WorksiteForm from '../features/worksites/WorksiteForm'
import WorksiteMap from '../features/map/WorksiteMap'
import WorksiteDetailPanel from '../features/worksites/WorksiteDetailPanel'
import Modal from '../components/Modal'
import SettingsPanel from '../components/SettingsPanel'
import RatesModal from '../components/RatesModal'
import { worksitesService } from '../services/worksites.service'
import { workersService } from '../services/workers.service'
import { assignmentsService } from '../services/assignments.service'
import { shiftsService } from '../services/shifts.service'
import { authService } from '../services/auth.service'

export default function DashboardPage({ session, onSignOut }) {
  const [msg, setMsg] = useState('')

  const [showWorkerModal, setShowWorkerModal] = useState(false)
  const [showWorksiteModal, setShowWorksiteModal] = useState(false)

  const [title, setTitle] = useState('')
  const [addressText, setAddressText] = useState('')
  const [picked, setPicked] = useState(null)
  const [savingWorksite, setSavingWorksite] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [savingWorker, setSavingWorker] = useState(false)

  const [worksites, setWorksites] = useState([])
  const [workers, setWorkers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loadingLists, setLoadingLists] = useState(false)

  const [selectedWorksiteId, setSelectedWorksiteId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedShift, setSelectedShift] = useState(null)
  const [showRatesModal, setShowRatesModal] = useState(false)
  const [pendingAssign, setPendingAssign] = useState(null)

  const assignedCountByWorksiteId = useMemo(() => {
    const m = {}
    for (const a of assignments) {
      const wid = a.worksite_id
      if (wid != null) {
        m[String(wid)] = (m[String(wid)] || 0) + 1
      }
    }
    return m
  }, [assignments])

  const unassignedWorkers = useMemo(() => {
    const assignedIds = new Set(
      assignments.filter((a) => a.worksite_id != null).map((a) => String(a.worker?.id)).filter(Boolean)
    )
    return workers.filter((w) => !assignedIds.has(String(w.id)))
  }, [workers, assignments])

  const filteredUnassignedWorkers = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase()
    if (!q) return unassignedWorkers
    return unassignedWorkers.filter((w) => {
      const name = `${(w.first_name || '')} ${(w.last_name || '')}`.toLowerCase()
      const phoneStr = (w.phone || '').toLowerCase()
      const noteStr = (w.note || '').toLowerCase()
      return name.includes(q) || phoneStr.includes(q) || noteStr.includes(q)
    })
  }, [unassignedWorkers, searchQuery])

  const selectedWorksite = useMemo(
    () => (selectedWorksiteId ? worksites.find((w) => String(w.id) === String(selectedWorksiteId)) ?? null : null),
    [selectedWorksiteId, worksites]
  )

  const assignedWorkersForSelected = useMemo(
    () => (selectedWorksiteId ? assignments.filter((a) => String(a.worksite_id) === String(selectedWorksiteId)) : []),
    [selectedWorksiteId, assignments]
  )

  const handleAssignWorker = async (workerId, worksiteId) => {
    const existing = assignments.find((a) => String(a.worker?.id) === String(workerId) && String(a.worksite_id) === String(worksiteId))
    if (existing) return
    setMsg('Assigning...')
    const { error } = await assignmentsService.assign(workerId, worksiteId)
    if (error) return setMsg(`Error: ${error.message}`)
    setMsg('Assigned.')
    loadData()
  }

  const loadSelectedShift = async () => {
    if (!selectedWorksiteId || !selectedDate) {
      setSelectedShift(null)
      return
    }
    const { data, error } = await shiftsService.getByWorksiteAndDate(selectedWorksiteId, selectedDate)
    if (error) {
      setMsg(`Shift error: ${error.message}`)
      setSelectedShift(null)
      return
    }
    setSelectedShift(data ?? null)
  }

  useEffect(() => {
    loadSelectedShift()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorksiteId, selectedDate])

  const handleDropWorker = async (workerId, worksiteId) => {
    const existing = assignments.find((a) => String(a.worker?.id) === String(workerId) && String(a.worksite_id) === String(worksiteId))
    if (existing) return
    const { data: shiftRow, error } = await shiftsService.getByWorksiteAndDate(worksiteId, selectedDate)
    if (error) {
      setMsg(`Error: ${error.message}`)
      return
    }
    const needsRates = !shiftRow || (Number(shiftRow.client_rate) === 0 && Number(shiftRow.worker_pay) === 0)
    if (needsRates) {
      setPendingAssign({ workerId, worksiteId })
      setShowRatesModal(true)
      return
    }
    await handleAssignWorker(workerId, worksiteId)
  }

  const handleSaveShiftFromPanel = async (payload) => {
    const ownerId = session?.user?.id
    if (!ownerId) return setMsg('Not logged in.')
    const { error } = await shiftsService.upsertShift({
      worksiteId: payload.worksiteId,
      workDate: payload.workDate,
      requiredWorkers: payload.requiredWorkers,
      clientRate: payload.clientRate,
      workerPay: payload.workerPay,
      ownerId,
    })
    if (error) return setMsg(`Error: ${error.message}`)
    setMsg('Shift saved.')
    loadSelectedShift()
  }

  const handleSaveAndAssignFromRatesModal = async ({ requiredWorkers, clientRate, workerPay }) => {
    if (!pendingAssign) return
    const ownerId = session?.user?.id
    if (!ownerId) return setMsg('Not logged in.')
    setMsg('Saving rates & assigning...')
    const { error } = await shiftsService.upsertShift({
      worksiteId: pendingAssign.worksiteId,
      workDate: selectedDate,
      requiredWorkers,
      clientRate,
      workerPay,
      ownerId,
    })
    if (error) {
      setMsg(`Error: ${error.message}`)
      return
    }
    await handleAssignWorker(pendingAssign.workerId, pendingAssign.worksiteId)
    setPendingAssign(null)
    setShowRatesModal(false)
    loadSelectedShift()
  }

  const handleUnassignWorker = async (workerId) => {
    setMsg('Removing...')
    const { error } = await assignmentsService.unassign(workerId)
    if (error) return setMsg(`Error: ${error.message}`)
    setMsg('Removed.')
    loadData()
  }

  const loadData = async () => {
    setLoadingLists(true)
    setMsg('')
    const [
      { data: ws, error: wsErr },
      { data: w, error: wErr },
      { data: a, error: aErr },
    ] = await Promise.all([
      worksitesService.getAll(),
      workersService.getAll(),
      assignmentsService.getAll(),
    ])
    setLoadingLists(false)
    if (wsErr) return setMsg(`Worksites error: ${wsErr.message}`)
    if (wErr) return setMsg(`Workers error: ${wErr.message}`)
    if (aErr) return setMsg(`Assignments error: ${aErr.message}`)
    setWorksites(ws ?? [])
    setWorkers(w ?? [])
    setAssignments(a ?? [])
  }

  useEffect(() => {
    if (session) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const signOut = async () => {
    await authService.signOut()
    onSignOut?.()
  }

  const resetWorkerForm = () => {
    setFirstName('')
    setLastName('')
    setPhone('')
    setNote('')
  }

  const resetWorksiteForm = () => {
    setTitle('')
    setAddressText('')
    setPicked(null)
  }

  const createWorksite = async () => {
    if (!title.trim()) return setMsg('Title is required.')
    if (!picked) return setMsg('Pick a location on the map.')
    setSavingWorksite(true)
    setMsg('Saving worksite...')
    const { error } = await worksitesService.create({
      title,
      addressText,
      lat: picked.lat,
      lng: picked.lng,
    })
    setSavingWorksite(false)
    if (error) return setMsg(`Error: ${error.message}`)
    resetWorksiteForm()
    setMsg('Worksite saved.')
    setShowWorksiteModal(false)
    loadData()
  }

  const createWorker = async () => {
    if (!firstName.trim()) return setMsg('First name is required.')
    if (!lastName.trim()) return setMsg('Last name is required.')
    setSavingWorker(true)
    setMsg('Saving worker...')
    const { data: insertedWorkers, error: wErr } = await workersService.create({
      firstName,
      lastName,
      phone,
      note,
    })
    if (wErr) {
      setSavingWorker(false)
      return setMsg(`Error: ${wErr.message}`)
    }
    const workerId = insertedWorkers?.[0]?.id
    if (!workerId) {
      setSavingWorker(false)
      return setMsg('Error: Worker created but ID missing.')
    }
    const { error: aErr } = await assignmentsService.create({
      workerId,
      worksiteId: null,
    })
    setSavingWorker(false)
    if (aErr) return setMsg(`Worker saved, but assignment failed: ${aErr.message}`)
    resetWorkerForm()
    setMsg('Worker saved.')
    setShowWorkerModal(false)
    loadData()
  }

  const handleCloseWorkerModal = () => {
    setShowWorkerModal(false)
    resetWorkerForm()
  }

  const handleCloseWorksiteModal = () => {
    setShowWorksiteModal(false)
    resetWorksiteForm()
  }

  const userEmail = session?.user?.email || ''
  const userInitials = userEmail ? userEmail.split('@')[0].slice(0, 2).toUpperCase() : '?'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', margin: 0, padding: 0 }}>
      {/* Header */}
      <div
        className="app-header"
        style={{
          padding: '20px 32px',
          borderBottom: '1px solid #EEEEEE',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          background: 'white',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* Upper right: avatar, email, Sign out */}
        <div style={{ position: 'absolute', top: 20, right: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8D5C4', color: '#5D4E37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
            {userInitials}
          </div>
          <span style={{ fontSize: 12, color: '#757575' }}>{userEmail}</span>
          <button
            onClick={signOut}
            className="btn-secondary"
            style={{ padding: '8px 16px', background: 'white', color: '#212121', border: '1px solid #EEEEEE', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
          >
            Sign out
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden' }}>
            <span style={{ width: 10, height: 24, background: '#FFA726', display: 'block' }} />
            <span style={{ width: 10, height: 24, background: '#00BCD4', display: 'block' }} />
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: '#212121' }}>CrewFlow</h1>
        </div>

        <div style={{ flex: 1, maxWidth: 420, display: 'flex', alignItems: 'center', gap: 10, background: '#F5F5F5', borderRadius: 10, padding: '10px 16px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            type="text"
            placeholder="Search workers or worksites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: '#212121', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <button
            onClick={() => setShowWorksiteModal(true)}
            className="btn-primary btn-primary--green"
            style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add worksite
          </button>
          <button type="button" aria-label="Notifications" style={{ width: 40, height: 40, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#757575' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Left sidebar: Workers */}
        <div className="app-sidebar" style={{ width: 360, borderRight: '1px solid #EEEEEE', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: 24, borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#212121' }}>Workers</h2>
            <button
              onClick={() => setShowWorkerModal(true)}
              className="btn-primary"
              style={{ padding: '10px 20px', background: '#1976D2', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add worker
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 24, minHeight: 0, scrollBehavior: 'smooth' }}>
            <WorkerList workers={filteredUnassignedWorkers} />
          </div>
          <div className="app-sidebar-footer" style={{ padding: 24, borderTop: '1px solid #EEEEEE', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                <span style={{ fontSize: 14, color: '#212121' }}>Workers</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#FFA726' }}>{workers.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span style={{ fontSize: 14, color: '#212121' }}>Worksites</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#4CAF50' }}>{worksites.length}</span>
            </div>
            <button type="button" aria-label="Settings" onClick={() => setShowSettings(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#757575', fontSize: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              Settings
            </button>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0, minHeight: 0, borderRadius: '0 8px 8px 0' }}>
          <WorksiteMap
            picked={picked}
            onPick={setPicked}
            worksites={worksites}
            assignedCountByWorksiteId={assignedCountByWorksiteId}
            selectedWorksiteId={selectedWorksiteId}
            onSelectWorksite={(w) => setSelectedWorksiteId(w.id)}
            onDropWorker={handleDropWorker}
          />
        </div>

        {selectedWorksite && (
          <WorksiteDetailPanel
            worksite={selectedWorksite}
            assignedWorkers={assignedWorkersForSelected}
            shift={selectedShift}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSaveShift={handleSaveShiftFromPanel}
            onClose={() => setSelectedWorksiteId(null)}
            onRemoveWorker={handleUnassignWorker}
          />
        )}
      </div>

      {msg && (
        <div
          className="app-status"
          style={{
            padding: '12px 32px',
            background: msg.includes('error') || msg.includes('Error') ? '#fef2f2' : '#f0fdf4',
            borderTop: '1px solid #e5e7eb',
            fontSize: 13,
            color: msg.includes('error') || msg.includes('Error') ? '#b91c1c' : '#166534',
          }}
        >
          {msg}
        </div>
      )}

      {showRatesModal && pendingAssign && (
        <RatesModal
          worksiteTitle={worksites.find((w) => String(w.id) === String(pendingAssign.worksiteId))?.title}
          workDate={selectedDate}
          onSaveAndAssign={handleSaveAndAssignFromRatesModal}
          onClose={() => { setShowRatesModal(false); setPendingAssign(null) }}
        />
      )}

      {showSettings && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowSettings(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowSettings(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.3)' }}
          />
          <SettingsPanel onClose={() => setShowSettings(false)} />
        </>
      )}

      <Modal isOpen={showWorkerModal} onClose={handleCloseWorkerModal} title="Add worker">
        <WorkerForm
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          phone={phone}
          setPhone={setPhone}
          note={note}
          setNote={setNote}
          saving={savingWorker}
          onCreate={createWorker}
        />
        <button
          onClick={handleCloseWorkerModal}
          className="btn-secondary"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 24px',
            marginTop: 24,
            background: 'transparent',
            color: '#4b5563',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </Modal>

      <Modal
        isOpen={showWorksiteModal}
        onClose={handleCloseWorksiteModal}
        title="Add worksite"
        allowMapClicks={true}
      >
        <WorksiteForm
          title={title}
          setTitle={setTitle}
          addressText={addressText}
          setAddressText={setAddressText}
          picked={picked}
          saving={savingWorksite}
          onCreate={createWorksite}
        />
        <div style={{ marginTop: 24, padding: 16, background: '#f0f9ff', borderRadius: 8, fontSize: 13, color: '#0c4a6e' }}>
          <strong>Tip:</strong> Click on the map to the right to set the worksite location. The pin will appear where you click.
        </div>
        <button
          onClick={handleCloseWorksiteModal}
          className="btn-secondary"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 24px',
            marginTop: 24,
            background: 'transparent',
            color: '#4b5563',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </Modal>
    </div>
  )
}
