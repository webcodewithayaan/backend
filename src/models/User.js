import mongoose from 'mongoose'

export const ROLES = ['Employee', 'HR Manager', 'Admin']

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'Employee' },
    // Signup par user jo role maangta hai (Admin approve karega). Access sirf `role` se milta hai.
    requestedRole: { type: String, enum: ROLES, default: 'Employee' },
    department: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    leaveBalance: { type: Number, default: 12 }
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', userSchema)
