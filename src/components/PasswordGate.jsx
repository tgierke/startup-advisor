import { useState } from 'react'

const STORAGE_KEY = 'sap_auth'
const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === SITE_PASSWORD
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  // If no password is configured, render the app normally
  if (!SITE_PASSWORD) return children

  if (unlocked) return children

  function handleSubmit(e) {
    e.preventDefault()
    if (input === SITE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, SITE_PASSWORD)
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font)',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
            My Advisory Panel
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Enter your password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%',
              border: `1px solid ${error ? 'var(--color-risk)' : 'var(--color-border)'}`,
              borderRadius: '6px',
              padding: '10px 12px',
              fontFamily: 'var(--font)',
              fontSize: '14px',
              outline: 'none',
              background: 'var(--color-bg)',
            }}
          />
          {error && (
            <p style={{ fontSize: '12px', color: 'var(--color-risk)', margin: 0 }}>
              Incorrect password.
            </p>
          )}
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'stretch' }}>
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
