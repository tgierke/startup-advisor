import { useState } from 'react'
import Sidebar from './components/Sidebar'

const PROFILE_KEY = 'sap_personal_profile'
const RESEARCH_KEY = 'sap_research_context'

function loadJSON(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [researchContext, setResearchContext] = useState(
    () => localStorage.getItem(RESEARCH_KEY) || ''
  )
  const [profile, setProfile] = useState(
    () => loadJSON(PROFILE_KEY, {})
  )

  return (
    <div className="app">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
        {sidebarOpen ? '✕ Close' : '☰ Profile'}
      </button>
      <Sidebar
        isOpen={sidebarOpen}
        researchContext={researchContext}
        setResearchContext={setResearchContext}
        profile={profile}
        setProfile={setProfile}
      />
      <main className="main">
        <div className="main-header">
          <h1>Startup Advisory Panel</h1>
        </div>
        <p style={{ color: 'var(--color-text-muted)' }}>Main area — coming soon</p>
      </main>
    </div>
  )
}
