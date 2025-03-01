/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose'

const MONGODB_URI =
  process.env.NODE_ENV !== 'production'
    ? process.env.MONGODB_URI_LOCAL
    : process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined')
}

const options = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
}

// next.js는 서버가 요청마다 새롭게 실행함. 따라서 node.js환경에서 글로벌 스코프 사용
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, options)
  }

  try {
    cached.conn = await cached.promise
    console.log('MongoDB Connected (Cached)')
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:')
    console.error(err instanceof Error ? err.message : err)
    console.error(err instanceof Error ? err.stack : err)
    cached.promise = null // 실패 시 재시도를 위해 초기화
    throw err // 오류를 호출한 곳으로 전달
  }

  return cached.conn
}
export default connectDB
