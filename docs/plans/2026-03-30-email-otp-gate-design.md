# Email OTP Gate — Design Document
Date: 2026-03-30

## Overview
Replace the shared password gate with an email-based OTP (one-time password) system. Only pre-approved email addresses can request a code. Codes are stateless (no database required) — generated and verified using HMAC with a secret key and a 15-minute time window.

## User Flow
1. Visitor lands on site → sees email input gate
2. Types email → clicks "Send code"
3. Server checks email against `APPROVED_EMAILS` env var
4. If approved: generates 6-digit OTP, sends via Resend, shows code input screen
5. If not approved: shows "This email isn't on the access list"
6. Visitor enters code → server verifies → access granted, stored in localStorage
7. Returning visitor with valid localStorage entry skips the gate

## Files Changed
- **Create:** `api/send-code.js` — validates email, generates OTP, sends via Resend
- **Create:** `api/verify-code.js` — verifies submitted OTP
- **Replace:** `src/components/PasswordGate.jsx` — new two-step UI (email → code)
- **Remove:** `VITE_SITE_PASSWORD` from Vercel env vars (after go-live)

## Stateless OTP Design
- Code = last 6 digits of `HMAC-SHA256(OTP_SECRET, email + time_window)`
- `time_window` = `Math.floor(Date.now() / 1000 / 900)` (15-minute buckets)
- Verify by recomputing the same code server-side — no storage needed
- Accepts current window AND previous window to handle clock skew / email delay

## Environment Variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `APPROVED_EMAILS` | Vercel (server) | Comma-separated approved email list |
| `OTP_SECRET` | Vercel (server) | HMAC secret for code generation |
| `RESEND_API_KEY` | Vercel (server) | Resend email service API key |

## Email Content
- **Subject:** Your My Advisory Panel access code
- **Body:** "Your access code is: XXXXXX — This code expires in 15 minutes."

## Removing Old System
- Delete `VITE_SITE_PASSWORD` from Vercel env vars after new system is live
- The `PasswordGate.jsx` rewrite removes all old password logic
