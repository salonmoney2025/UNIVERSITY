/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Performance optimizations
  swcMinify: true,
  reactStrictMode: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize images
  images: {
    unoptimized: true, // For faster dev builds
  },

  // Reduce bundle size
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for faster builds
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
