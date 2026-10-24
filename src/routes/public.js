import { Router } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import Registration from '../models/Registration.js'
import Contact from '../models/Contact.js'
import { validate } from '../middleware/validate.js'

const router = Router()
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false })

const regSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  track: z.string().trim().max(80).optional(),
  team: z.string().trim().max(80).optional()
})
router.post('/registrations', limiter, validate(regSchema), async (req, res) => {
  await Registration.findOneAndUpdate({ email: req.body.email }, req.body, { upsert: true, new: true, setDefaultsOnInsert: true })
  res.status(201).json({ ok: true })
})

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  message: z.string().trim().min(5).max(2000)
})
router.post('/contact', limiter, validate(contactSchema), async (req, res) => {
  await Contact.create(req.body)
  res.status(201).json({ ok: true })
})

export default router
