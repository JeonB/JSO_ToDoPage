import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  serverRuntimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_URI_LOCAL: process.env.MONGODB_URI_LOCAL,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_URI_LOCAL: process.env.MONGODB_URI_LOCAL,
  },
  devIndicators: {
    appIsrStatus: false,
  },
}

export default nextConfig
