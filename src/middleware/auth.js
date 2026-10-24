import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// Token verify karta hai aur user DB se fresh load karta hai (role hamesha DB se, token se nahi).
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Login required' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user || user.status !== 'active') return res.status(401).json({ message: 'Account unavailable' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' })
  }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have access to this resource' })
