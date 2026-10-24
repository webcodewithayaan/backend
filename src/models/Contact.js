import mongoose from 'mongoose'

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 }
  },
  { timestamps: true }
)

export default mongoose.models.Contact || mongoose.model('Contact', schema)
