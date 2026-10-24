import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import portalRoutes from './routes/portal.js'
import userRoutes from './routes/users.js'
import leaveRoutes from './routes/leaves.js'
import publicRoutes from './routes/public.js'
import chatRoutes from './routes/chat.js'

const app = express()
app.set('trust proxy', 1) // Vercel proxy ke peeche rate-limit sahi IP dekhe

const allowed = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)
app.use(helmet())
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true)
      cb(new Error('Not allowed by CORS'))
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(express.json({ limit: '50kb' }))

app.get('/', (req, res) => res.json({ name: 'Human Health Management API', ok: true }))
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }))

// Har request se pehle DB connection (cached)
app.use(async (req, res, next) => {
  try { await connectDB(); next() } catch (e) { console.error('DB error', e.message); res.status(503).json({ message: 'Database unavailable' }) }
})

app.use('/api/auth', authRoutes)
app.use('/api/portal', portalRoutes)
app.use('/api/users', userRoutes)
app.use('/api/leaves', leaveRoutes)
app.use('/api', publicRoutes)
app.use('/api/chat', chatRoutes)

app.use((req, res) => res.status(404).json({ message: 'Not found' }))
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ message: err.message })
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate value' })
  res.status(500).json({ message: 'Something went wrong' })
})

export default app
