import { Router } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(rateLimit({ windowMs: 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false }))
const SYSTEM = 'You are the friendly assistant of Human Health Management, a workplace people-management portal for employees, HR managers, and admins. Answer clearly and briefly (maximum 4 sentences). Do not give medical diagnoses.'
const demoReply = 'The AI assistant is not configured yet. Please try again later.'

router.post('/', validate(z.object({ message: z.string().trim().min(1).max(1000) })), async (req, res) => {
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(503).json({ message: 'AI assistant is not configured. Add GEMINI_API_KEY in the backend environment settings.' })
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: req.body.message }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.6 }
      })
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      console.error('Gemini provider error:', r.status, data.error?.message || '')
      return res.status(502).json({ message: 'AI provider request failed. Check GEMINI_API_KEY and GEMINI_MODEL.' })
    }
    const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim()
    if (!reply) return res.status(502).json({ message: 'The AI assistant returned an empty response.' })
    res.json({ reply })
  } catch (e) {
    console.error('chat error', e.message)
    res.status(502).json({ message: 'Assistant is unavailable right now' })
  }
})
export default router
