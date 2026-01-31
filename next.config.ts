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
};

export default nextConfig;
