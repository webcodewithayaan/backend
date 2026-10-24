import mongoose from 'mongoose'

// Vercel serverless me har invocation naya ho sakta hai, isliye connection cache karte hain.
let cached = globalThis.__mongoose
if (!cached) cached = globalThis.__mongoose = { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')
  if (!cached.promise) {
    mongoose.set('strictQuery', true)
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
      .then((m) => m)
  }
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }
  return cached.conn
}
