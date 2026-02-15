import { useEffect, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { authService } from './services/auth.service'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

const DEV_SKIP_AUTH = import.meta.env.VITE_DEV_SKIP_AUTH === 'true'
const MOCK_SESSION = {
  user: { email: 'dev@local.test' },
}

export default function App() {
  useTheme()
  const [session, setSession] = useState(DEV_SKIP_AUTH ? MOCK_SESSION : null)

  useEffect(() => {
    if (DEV_SKIP_AUTH) return
    authService.getSession().then(setSession)
    const subscription = authService.onAuthStateChange(setSession)
    return () => subscription.subscription.unsubscribe()
  }, [])

  if (!session) {
    return <LoginPage />
  }

  const onSignOut = () => setSession(null)
  return (
    <div className="app-root">
      <DashboardPage session={session} onSignOut={onSignOut} />
    </div>
  )
}
