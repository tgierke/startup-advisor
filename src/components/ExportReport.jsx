import { PERSONAS } from './PersonaCard'

function buildReportPrompt(sessionEntries) {
  const qa = sessionEntries.map((entry, i) => {
    const responses = PERSONAS.map(p => {
      const r = entry.responses.find(r => r.personaId === p.id)
      return `**${p.name}:** ${r?.text || 'No response.'}`
    }).join('\n\n')
    return `### Question ${i + 1}: ${entry.question}\n\n${responses}`
  }).join('\n\n---\n\n')

  return `You are writing a professional decision brief based on a startup advisory panel session. The user was evaluating whether to join a pre-seed startup.

Below is the full Q&A from the session. Write a structured decision brief with these exact sections:

1. **Executive Summary** (2–3 sentences summarizing the overall picture)
2. **Key Insights** (grouped by theme: Market, Execution, GTM, Personal Risk — bullet points)
3. **Top Risks** (3–5 most important risks flagged across all advisors)
4. **Open Questions** (3–5 questions the user should answer before deciding)

Write in a professional but direct tone. This will be printed as a PDF.

---

SESSION TRANSCRIPT:

${qa}`
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function markdownToHtml(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/gs, match => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
}

function buildReportHtml(summaryText, sessionEntries) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const formatted = markdownToHtml(summaryText)

  const transcript = sessionEntries.map((entry, i) => {
    const responses = PERSONAS.map(p => {
      const r = entry.responses.find(r => r.personaId === p.id)
      const safeText = escapeHtml(r?.text || '—')
      return `
        <div style="margin-bottom:16px">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${escapeHtml(p.name)}</div>
          <div style="font-size:13px;line-height:1.6;color:#444">${safeText}</div>
        </div>`
    }).join('')

    return `
      <div style="margin-bottom:32px">
        <div style="font-weight:700;font-size:15px;margin-bottom:12px;padding:10px 14px;background:#f5f5f5;border-radius:6px">
          Q${i + 1}: ${escapeHtml(entry.question)}
        </div>
        ${responses}
      </div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Startup Advisory Panel — Decision Brief</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 60px 40px; color: #111; line-height: 1.6; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    h2 { font-size: 18px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
    h3 { font-size: 15px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; }
    p { margin-bottom: 12px; color: #333; }
    ul { padding-left: 20px; margin-bottom: 12px; }
    li { margin-bottom: 6px; color: #333; }
    .meta { color: #888; font-size: 13px; margin-bottom: 40px; }
    .transcript-title { font-size: 16px; font-weight: 700; margin-top: 48px; margin-bottom: 24px; padding-top: 24px; border-top: 2px solid #eee; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Startup Advisory Panel</h1>
  <div class="meta">Decision Brief &middot; ${date}</div>
  <p>${formatted}</p>
  <div class="transcript-title">Full Session Transcript</div>
  ${transcript}
</body>
</html>`
}

export default function ExportReport({ sessionEntries }) {
  async function handleExport() {
    if (sessionEntries.length === 0) {
      alert('No session to export yet. Ask the panel at least one question first.')
      return
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You write clear, professional decision briefs for executives.',
          userMessage: buildReportPrompt(sessionEntries),
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const html = buildReportHtml(data.text, sessionEntries)

      // Blob URL — safe in-memory URL that avoids XSS risks
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const tab = window.open(url, '_blank')

      // Revoke the object URL after the tab loads to free memory
      if (tab) {
        tab.addEventListener('load', () => URL.revokeObjectURL(url), { once: true })
      } else {
        // Fallback: revoke after a delay if the tab reference wasn't returned
        setTimeout(() => URL.revokeObjectURL(url), 10000)
      }
    } catch (err) {
      alert(`Error generating report: ${err.message}`)
    }
  }

  return (
    <button className="btn btn-ghost" onClick={handleExport}>
      Export report
    </button>
  )
}
