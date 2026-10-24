import { Router } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(rateLimit({ windowMs: 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false }))

const SYSTEM = 'You are the friendly assistant of Human Health Management, a workplace people-management portal (employees, HR managers, admins). Answer briefly (max 4 sentences). Do not give medical diagnoses.'
const demoReply = 'I am in demo mode right now. Set GROQ_API_KEY on the backend to enable AI answers.'

router.post('/', validate(z.object({ message: z.string().trim().min(1).max(1000) })), async (req, res) => {
  const key = process.env.GROQ_API_KEY
  if (!key) return res.json({ reply: demoReply, demo: true })
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || 'llama-3.3-70b-versatile',
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: req.body.message }
        ]
      })
    })
    if (!r.ok) throw new Error(`AI provider ${r.status}`)
    const data = await r.json()
    res.json({ reply: data.choices?.[0]?.message?.content || demoReply })
  } catch (e) {
    console.error('chat error', e.message)
    res.status(502).json({ message: 'Assistant is unavailable right now' })
  }
})

export default router