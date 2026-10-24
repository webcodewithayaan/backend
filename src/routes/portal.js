import { Router } from 'express'
import User from '../models/User.js'
import LeaveRequest from '../models/LeaveRequest.js'
import { requireAuth } from '../middleware/auth.js'
import mongoose from 'mongoose'

const router = Router()
router.use(requireAuth)

// Portal ke stat cards ka real data, role ke hisaab se.
router.get('/summary', async (req, res) => {
  const { role, _id } = req.user
  if (role === 'Admin') {
    const [employees, hr, pending] = await Promise.all([
      User.countDocuments({ role: 'Employee' }),
      User.countDocuments({ role: 'HR Manager' }),
      User.countDocuments({ requestedRole: { $ne: 'Employee' }, role: 'Employee' })
    ])
    return res.json({
      role,
      stats: [
        { label: 'Total employees', value: employees, icon: 'bi-people' },
        { label: 'HR managers', value: hr, icon: 'bi-person-badge' },
        { label: 'Open requests', value: pending, icon: 'bi-inbox' },
        { label: 'System status', value: mongoose.connection.readyState === 1 ? 'Healthy' : 'Down', icon: 'bi-activity' }
      ]
    })
  }
  if (role === 'HR Manager') {
    const [employees, pendingLeave] = await Promise.all([
      User.countDocuments({ role: 'Employee' }),
      LeaveRequest.countDocuments({ status: 'pending' })
    ])
    return res.json({
      role,
      stats: [
        { label: 'Employees', value: employees, icon: 'bi-people' },
        { label: 'Pending leave', value: pendingLeave, icon: 'bi-calendar-check' },
        { label: 'Open vacancies', value: 0, icon: 'bi-briefcase' },
        { label: 'Onboarding', value: 0, icon: 'bi-person-plus' }
      ]
    })
  }
  const inReview = await LeaveRequest.countDocuments({ user: _id, status: 'pending' })
  res.json({
    role,
    stats: [
      { label: 'Leave balance', value: `${req.user.leaveBalance} days`, icon: 'bi-calendar-check' },
      { label: 'Requests in review', value: inReview, icon: 'bi-hourglass-split' },
      { label: 'Learning items', value: 0, icon: 'bi-book' },
      { label: 'Wellbeing', value: 'Available', icon: 'bi-heart-pulse' }
    ]
  })
})

export default router
