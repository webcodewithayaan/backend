import { Router } from 'express'
import { z } from 'zod'
import User, { ROLES } from '../models/User.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

// HR + Admin: employee directory
router.get('/directory', requireRole('HR Manager', 'Admin'), async (req, res) => {
  const users = await User.find({ role: 'Employee' }).sort({ name: 1 }).select('name email department status leaveBalance').lean()
  res.json({ users })
})

// Admin: sab users
router.get('/', requireRole('Admin'), async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean()
  res.json({ users })
})

const updateSchema = z.object({
  role: z.enum(ROLES).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  department: z.string().trim().max(80).optional()
})

router.patch('/:id', requireRole('Admin'), validate(updateSchema), async (req, res) => {
  if (req.params.id === req.user._id.toString() && (req.body.role || req.body.status === 'suspended'))
    return res.status(400).json({ message: 'You cannot change your own role or suspend yourself' })
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  Object.assign(user, req.body)
  // Admin ne role de diya to requestedRole ki zaroorat khatam
  if (req.body.role) user.requestedRole = req.body.role
  await user.save()
  res.json({ user })
})

router.delete('/:id', requireRole('Admin'), async (req, res) => {
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot delete yourself' })
  const { deletedCount } = await User.deleteOne({ _id: req.params.id })
  if (!deletedCount) return res.status(404).json({ message: 'User not found' })
  res.json({ ok: true })
})

export default router
