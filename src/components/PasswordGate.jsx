import { useState } from 'react'

const STORAGE_KEY = 'sap_auth'

export default function PasswordGate({ children }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'code'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  )

  if (authed) return children

  async function handleSendCode(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setStep('code')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid code.')
        setCode('')
      } else {
        localStorage.setItem(STORAGE_KEY, 'true')
        setAuthed(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg)',
    fontFamily: 'var(--font)',
  }

  const cardStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    border: `1px solid ${hasError ? 'var(--color-risk)' : 'var(--color-border)'}`,
    borderRadius: '6px',
    padding: '10px 12px',
    fontFamily: 'var(--font)',
    fontSize: '14px',
    outline: 'none',
    background: 'var(--color-bg)',
    boxSizing: 'border-box',
  })

  if (step === 'email') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
              My Advisory Panel
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Enter your email to receive an access code.
            </p>
          </div>
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="you@example.com"
              autoFocus
              required
              style={inputStyle(!!error)}
            />
            {error && (
              <p style={{ fontSize: '12px', color: 'var(--color-risk)', margin: 0 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !email.trim()}
              style={{ alignSelf: 'stretch' }}
            >
              {loading ? 'Sending\u2026' : 'Send code'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
            Check your email
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 15 minutes.
          </p>
        </div>
        <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={e => { setCode(e.target.value); setError('') }}
            placeholder="123456"
            autoFocus
            maxLength={6}
            style={inputStyle(!!error)}
          />
          {error && (
            <p style={{ fontSize: '12px', color: 'var(--color-risk)', margin: 0 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || code.length < 6}
            style={{ alignSelf: 'stretch' }}
          >
            {loading ? 'Verifying\u2026' : 'Continue'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setStep('email'); setError(''); setCode('') }}
            style={{ alignSelf: 'stretch' }}
          >
            Use a different email
          </button>
        </form>
      </div>
    </div>
  )
}
