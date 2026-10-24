// Pehla Admin banata hai: npm run seed
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../src/models/User.js'

const { MONGODB_URI, SEED_ADMIN_NAME = 'Super Admin', SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env
if (!MONGODB_URI || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
  console.error('Set MONGODB_URI, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env'); process.exit(1)
}
await mongoose.connect(MONGODB_URI)
const email = SEED_ADMIN_EMAIL.toLowerCase()
const password = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12)
let admin = await User.findOne({ email })
if (!admin) admin = new User({ email })
Object.assign(admin, { name: SEED_ADMIN_NAME, password, role: 'Admin', requestedRole: 'Admin', status: 'active' })
await admin.save()
console.log(`Admin ready: ${email}`)
await mongoose.disconnect()
