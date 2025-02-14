import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

let cachedConnection: mongoose.Connection | null = null

export async function connectDB() {
  if (cachedConnection) {
    console.log('Using cached DB connection')
    return cachedConnection
  }

  console.log('Creating new DB connection')
  cachedConnection = (await mongoose.connect(MONGODB_URI)).connection
  return cachedConnection
}
