import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    track: { type: String, trim: true, maxlength: 80 },
    team: { type: String, trim: true, maxlength: 80 }
  },
  { timestamps: true }
)

export default mongoose.models.Registration || mongoose.model('Registration', schema)
