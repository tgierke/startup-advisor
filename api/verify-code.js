import { createHmac } from 'crypto'

function generateOTP(email, secret, window) {
  const hmac = createHmac('sha256', secret)
  hmac.update(`${email.toLowerCase().trim()}:${window}`)
  const hex = hmac.digest('hex')
  return (parseInt(hex.slice(0, 8), 16) % 1000000).toString().padStart(6, '0')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, code } = req.body
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' })
  }

  const secret = process.env.OTP_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const currentWindow = Math.floor(Date.now() / 1000 / 900)

  const validCodes = [
    generateOTP(normalizedEmail, secret, currentWindow),
    generateOTP(normalizedEmail, secret, currentWindow - 1),
  ]

  if (validCodes.includes(code.trim())) {
    return res.status(200).json({ ok: true })
  }

  return res.status(401).json({ error: 'Invalid or expired code.' })
}
