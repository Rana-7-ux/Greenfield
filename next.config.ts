/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Authorize local network testing cross-origin refreshes safely inside experimental options
  experimental: {
    serverActions: {
      allowedOrigins: ['10.121.145.100', '10.160.228.100', 'localhost:3000'],
    },
  },

  // 2. Whitelist external storage image delivery channels
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Safe backup pattern for your Supabase CDN buckets
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;