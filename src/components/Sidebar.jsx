import { useEffect } from 'react'

const PROFILE_KEY = 'sap_personal_profile'
const RESEARCH_KEY = 'sap_research_context'

const PROFILE_FIELDS = [
  { key: 'runway', label: 'Financial runway' },
  { key: 'walkingAway', label: "What I'd be walking away from" },
  { key: 'family', label: 'Family situation' },
  { key: 'careerStage', label: 'Career stage' },
]

export default function Sidebar({ isOpen, researchContext, setResearchContext, profile, setProfile }) {
  useEffect(() => {
    localStorage.setItem(RESEARCH_KEY, researchContext)
  }, [researchContext])

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }, [profile])

  function handleProfileChange(key, value) {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-section">
        <h2>Research context</h2>
        <textarea
          placeholder="Paste market research, founder memos, or any relevant context here..."
          value={researchContext}
          onChange={e => setResearchContext(e.target.value)}
        />
      </div>

      <div className="sidebar-section">
        <h2>Personal profile</h2>
        {PROFILE_FIELDS.map(field => (
          <div className="profile-field" key={field.key}>
            <label htmlFor={field.key}>{field.label}</label>
            <input
              id={field.key}
              type="text"
              value={profile[field.key] || ''}
              onChange={e => handleProfileChange(field.key, e.target.value)}
              placeholder="..."
            />
          </div>
        ))}
        <div className="profile-field">
          <label htmlFor="additionalContext">Additional context</label>
          <textarea
            id="additionalContext"
            rows={5}
            value={profile.additionalContext || ''}
            onChange={e => handleProfileChange('additionalContext', e.target.value)}
            placeholder="Biggest fears, unique skill sets, personal constraints, or anything else that helps the advisors understand your perspective…"
          />
        </div>
      </div>
    </aside>
  )
}
