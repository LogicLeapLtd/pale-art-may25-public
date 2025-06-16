/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from Vercel blob storage and other sources
    domains: [
      'localhost',
      'upload.wikimedia.org'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    // Configure image sizes for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Only unoptimize in development for local images
    unoptimized: true,
    // Enable better loading
    loader: 'default',
  },
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enhanced file watching for macOS
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
      
      // Ensure proper hot reload
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }
    return config
  },
  // Force page refresh on component changes
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig