import { PERSONAS } from './PersonaCard'

export default function SessionHistory({ entries = [] }) {
  if (entries.length === 0) return null

  return (
    <div className="session-history">
      <h2>Session history</h2>
      {entries.map((entry, i) => (
        <div className="history-entry" key={i}>
          <div className="history-question">Q: {entry.question}</div>
          <div className="history-responses">
            {PERSONAS.map(persona => {
              const resp = entry.responses.find(r => r.personaId === persona.id)
              return (
                <div
                  className="history-response"
                  key={persona.id}
                  style={{ borderTop: `2px solid ${persona.color}` }}
                >
                  <div className="history-response-name" style={{ color: persona.color }}>
                    {persona.name}
                  </div>
                  <div>{resp?.text || '—'}</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
