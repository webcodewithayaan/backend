import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import User, { ROLES } from '../models/User.js'
import { signToken, requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false })

const publicUser = (u) => ({
  id: u._id, name: u.name, email: u.email, role: u.role, requestedRole: u.requestedRole,
  department: u.department, leaveBalance: u.leaveBalance
})

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
  role: z.enum(ROLES).optional()
})

// Security: signup se hamesha Employee hi banta hai. Maanga hua role sirf requestedRole me save hota hai,
// Admin baad me approve karta hai.
router.post('/signup', limiter, validate(signupSchema), async (req, res) => {
  const { name, email, password, role } = req.body
  if (await User.findOne({ email })) return res.status(409).json({ message: 'This email is already registered' })
  const user = await User.create({
    name, email, password: await bcrypt.hash(password, 12), role: 'Employee', requestedRole: role || 'Employee'
  })
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  role: z.enum(ROLES).optional()
})

router.post('/login', limiter, validate(loginSchema), async (req, res) => {
  const { email, password, role } = req.body
  const user = await User.findOne({ email }).select('+password')
  const ok = user && (await bcrypt.compare(password, user.password))
  if (!ok) return res.status(401).json({ message: 'Invalid email or password' })
  if (user.status !== 'active') return res.status(403).json({ message: 'Your account is suspended' })
  // Portal selector sirf check hai: user ka asli role DB wala hi chalega.
  if (role && role !== user.role) return res.status(403).json({ message: `Your account does not have ${role} access` })
  res.json({ token: signToken(user), user: publicUser(user) })
})

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }))

export default router
