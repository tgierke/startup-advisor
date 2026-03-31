import { useState, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import SuggestionChips from './components/SuggestionChips'
import PersonaCard, { PERSONAS } from './components/PersonaCard'
import SessionHistory from './components/SessionHistory'
import ExportReport from './components/ExportReport'

const PROFILE_KEY = 'sap_personal_profile'
const RESEARCH_KEY = 'sap_research_context'
const SESSION_KEY = 'sap_current_session'

function loadJSON(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function profileToText(profile) {
  const labels = {
    runway: 'Financial runway',
    walkingAway: 'Walking away from',
    family: 'Family situation',
    careerStage: 'Career stage',
    additionalContext: 'Additional context',
  }
  return Object.entries(labels)
    .map(([k, label]) => profile[k] ? `${label}: ${profile[k]}` : null)
    .filter(Boolean)
    .join('\n') || 'No profile provided.'
}

async function callAdvisor(systemPrompt, userMessage) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userMessage }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.text
}

const IDLE_STATUSES = Object.fromEntries(PERSONAS.map(p => [p.id, 'idle']))
const IDLE_RESPONSES = Object.fromEntries(PERSONAS.map(p => [p.id, null]))

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [researchContext, setResearchContext] = useState(
    () => localStorage.getItem(RESEARCH_KEY) || ''
  )
  const [profile, setProfile] = useState(
    () => loadJSON(PROFILE_KEY, {})
  )
  const [sessionEntries, setSessionEntries] = useState(
    () => loadJSON(SESSION_KEY, [])
  )
  const [question, setQuestion] = useState('')
  const [statuses, setStatuses] = useState(IDLE_STATUSES)
  const [responses, setResponses] = useState(IDLE_RESPONSES)
  const [isAsking, setIsAsking] = useState(false)
  const isAskingRef = useRef(false)

  function saveSession(entries) {
    setSessionEntries(entries)
    localStorage.setItem(SESSION_KEY, JSON.stringify(entries))
  }

  function startNewSession() {
    if (!window.confirm('Start a new session? The current session will be cleared.')) return
    saveSession([])
    setStatuses(IDLE_STATUSES)
    setResponses(IDLE_RESPONSES)
    setQuestion('')
  }

  async function askPersona(persona, userMessage) {
    setStatuses(prev => ({ ...prev, [persona.id]: 'loading' }))
    try {
      const text = await callAdvisor(persona.systemPrompt, userMessage)
      setResponses(prev => ({ ...prev, [persona.id]: text }))
      setStatuses(prev => ({ ...prev, [persona.id]: 'done' }))
      return { personaId: persona.id, text }
    } catch {
      setStatuses(prev => ({ ...prev, [persona.id]: 'error' }))
      return { personaId: persona.id, text: null }
    }
  }

  const askPanel = useCallback(async (overrideQuestion) => {
    const trimmed = (overrideQuestion || question).trim()
    if (!trimmed || isAskingRef.current) return
    isAskingRef.current = true
    setIsAsking(true)

    try {
      setStatuses(Object.fromEntries(PERSONAS.map(p => [p.id, 'loading'])))
      setResponses(IDLE_RESPONSES)

      const userMessage = `Context:\n${researchContext || 'None provided.'}\n\nPersonal profile:\n${profileToText(profile)}\n\n---\n\nQuestion: ${trimmed}`

      const results = await Promise.all(
        PERSONAS.map(persona => askPersona(persona, userMessage))
      )

      const entry = { question: trimmed, responses: results.filter(r => r.text) }
      saveSession([...sessionEntries, entry])
    } finally {
      isAskingRef.current = false
      setIsAsking(false)
    }
  }, [question, researchContext, profile, sessionEntries])

  async function retryPersona(persona) {
    const lastEntry = sessionEntries[sessionEntries.length - 1]
    if (!lastEntry) return
    const userMessage = `Context:\n${researchContext || 'None provided.'}\n\nPersonal profile:\n${profileToText(profile)}\n\n---\n\nQuestion: ${lastEntry.question}`
    const result = await askPersona(persona, userMessage)
    if (result.text) {
      const updatedEntries = sessionEntries.map((e, i) =>
        i === sessionEntries.length - 1
          ? { ...e, responses: [...e.responses.filter(r => r.personaId !== persona.id), result] }
          : e
      )
      saveSession(updatedEntries)
    }
  }

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
          <div className="header-actions">
            <ExportReport sessionEntries={sessionEntries} />
            <button className="btn btn-ghost" onClick={startNewSession}>
              New session
            </button>
          </div>
        </div>

        <div className="question-area">
          <textarea
            className="question-input"
            placeholder="Ask the panel a question about this startup opportunity..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) askPanel()
            }}
          />
          <SuggestionChips onSelect={chip => setQuestion(chip)} />
          <button
            className="btn btn-primary"
            onClick={() => askPanel()}
            disabled={isAsking || !question.trim()}
          >
            {isAsking ? 'Asking the panel…' : 'Ask the panel'}
          </button>
        </div>

        <div className="persona-grid">
          {PERSONAS.map(persona => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              status={statuses[persona.id]}
              response={responses[persona.id]}
              onRetry={() => retryPersona(persona)}
            />
          ))}
        </div>

        <SessionHistory entries={sessionEntries} />
      </main>
    </div>
  )
}
