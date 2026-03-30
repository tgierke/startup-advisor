import { createHmac } from 'crypto'

function generateOTP(email, secret) {
  const window = Math.floor(Date.now() / 1000 / 900) // 15-minute window
  const hmac = createHmac('sha256', secret)
  hmac.update(`${email.toLowerCase().trim()}:${window}`)
  const hex = hmac.digest('hex')
  return (parseInt(hex.slice(0, 8), 16) % 1000000).toString().padStart(6, '0')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  const normalizedEmail = email.toLowerCase().trim()

  const approved = (process.env.APPROVED_EMAILS || '')
    .split(',')
    .map(e => e.toLowerCase().trim())
    .filter(Boolean)

  if (!approved.includes(normalizedEmail)) {
    return res.status(403).json({ error: 'This email is not on the access list.' })
  }

  const secret = process.env.OTP_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const code = generateOTP(normalizedEmail, secret)

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'My Advisory Panel <noreply@myadvisorypanel.com>',
        to: normalizedEmail,
        subject: 'Your My Advisory Panel access code',
        text: `Your access code is: ${code}\n\nThis code expires in 15 minutes. If you didn't request this, you can ignore this email.`,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      console.error('Resend error:', err)
      return res.status(500).json({ error: 'Failed to send email' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Email send error:', err)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
