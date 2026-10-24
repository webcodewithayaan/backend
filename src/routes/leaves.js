import { Router } from 'express'
import { z } from 'zod'
import LeaveRequest from '../models/LeaveRequest.js'
import User from '../models/User.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

const createSchema = z.object({
  type: z.enum(['Annual', 'Sick', 'Casual', 'Unpaid']).default('Annual'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().trim().max(500).optional()
}).refine((d) => d.endDate >= d.startDate, { message: 'endDate must be on or after startDate', path: ['endDate'] })

router.post('/', validate(createSchema), async (req, res) => {
  const { startDate, endDate } = req.body
  const days = Math.round((endDate - startDate) / 86400000) + 1
  if (req.body.type === 'Annual' && days > req.user.leaveBalance)
    return res.status(400).json({ message: `Only ${req.user.leaveBalance} leave days left` })
  const leave = await LeaveRequest.create({ ...req.body, days, user: req.user._id })
  res.status(201).json({ leave })
})

router.get('/mine', async (req, res) => {
  const leaves = await LeaveRequest.find({ user: req.user._id }).sort({ createdAt: -1 }).lean()
  res.json({ leaves })
})

router.get('/', requireRole('HR Manager', 'Admin'), async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {}
  const leaves = await LeaveRequest.find(filter).sort({ createdAt: -1 }).populate('user', 'name email department').lean()
  res.json({ leaves })
})

router.patch('/:id', requireRole('HR Manager', 'Admin'), validate(z.object({ status: z.enum(['approved', 'rejected']) })), async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id)
  if (!leave) return res.status(404).json({ message: 'Leave request not found' })
  if (leave.status !== 'pending') return res.status(409).json({ message: 'Already reviewed' })
  leave.status = req.body.status
  leave.reviewedBy = req.user._id
  leave.reviewedAt = new Date()
  await leave.save()
  if (leave.status === 'approved' && leave.type === 'Annual')
    await User.updateOne({ _id: leave.user }, { $inc: { leaveBalance: -leave.days } })
  res.json({ leave })
})

export default router
