import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  serverRuntimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  devIndicators: {
    appIsrStatus: false,
  },
}

export default nextConfig
