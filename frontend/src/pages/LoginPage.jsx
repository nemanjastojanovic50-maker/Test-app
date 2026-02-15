import { useState } from 'react'
import { authService } from '../services/auth.service'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const handleSend = async () => {
    const trimmed = (email || '').trim()
    if (!trimmed) {
      setMsg('Please enter your email address.')
      return
    }
    setMsg('Sending link...')
    const { error } = await authService.signInWithOtp(trimmed)
    setMsg(error ? `Error: ${error.message}` : 'Check your email for the login link.')
  }

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1>Login</h1>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />
      <button onClick={handleSend} style={{ padding: 10 }}>
        Send magic link
      </button>
      <p>{msg}</p>
      {msg && msg.includes('Check your email') && (
        <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
          If the email looks empty, Gmail may be showing a translation bar. Click &quot;Don&apos;t translate: English&quot; to see the login link.
        </p>
      )}
    </div>
  )
}
