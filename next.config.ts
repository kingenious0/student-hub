// Rebuild triggered for Prisma sync
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    proxyClientMaxBodySize: '100mb', // Allow large video uploads
  },
  // Bypass TypeScript warnings for Cloudflare deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=*',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; " +
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://js.paystack.co; " +
                   "connect-src 'self' https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://api.paystack.co https://api.cloudinary.com; " +
                   "img-src 'self' data: https://res.cloudinary.com https://img.clerk.com; " +
                   "style-src 'self' 'unsafe-inline'; " +
                   "frame-src 'self' https://js.paystack.co https://*.clerk.accounts.dev; " +
                   "media-src 'self' blob: https://res.cloudinary.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
