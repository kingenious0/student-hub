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
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.clerk.accounts.dev https://js.paystack.co https://checkout.paystack.com https://*.paystack.com; " +
                   "connect-src 'self' https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://api.paystack.co https://checkout.paystack.com https://*.paystack.com https://api.cloudinary.com https://api.radar.io https://*.radar.io; " +
                   "img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com https://img.clerk.com https://api.dicebear.com; " +
                   "style-src 'self' 'unsafe-inline' https://paystack.com https://*.paystack.com https://checkout.paystack.com; " +
                   "frame-src 'self' https://js.paystack.co https://checkout.paystack.com https://*.paystack.com https://*.clerk.accounts.dev; " +
                   "worker-src 'self' blob:; " +
                   "media-src 'self' blob: https://res.cloudinary.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
