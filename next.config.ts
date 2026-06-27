// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Correct Top-Level Key for newer Next.js builds
  allowedDevOrigins: ['10.160.228.100', 'localhost:3000'],

  // 2. Keeps your Unsplash agricultural images completely whitelisted and safe
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;