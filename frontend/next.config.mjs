/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Performance optimizations
  reactStrictMode: true,

  // ESLint configuration - only show errors, not warnings during build
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib'],
  },

  // TypeScript configuration - continue on errors for faster builds
  typescript: {
    ignoreBuildErrors: false,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize images - PRODUCTION READY FOR 7M USERS
  images: {
    unoptimized: process.env.NODE_ENV === 'development', // Optimize in production
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
  },

  // Reduce bundle size - SCALABILITY OPTIMIZATIONS
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hook-form', '@tanstack/react-query'],
  },

  // Turbopack for faster dev builds (new location)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in prod
  poweredByHeader: false, // Remove X-Powered-By header

  // Compression
  compress: true,

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },

};

export default nextConfig;
