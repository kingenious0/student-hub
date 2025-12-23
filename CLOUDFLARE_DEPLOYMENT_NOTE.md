# Cloudflare Pages Build Configuration

## Routes Using Node.js Runtime

The following routes require Node.js runtime and cannot run on Cloudflare Edge:

1. `/api/cloudinary-upload` - Uses Cloudinary SDK and Buffer (Node.js only)
2. `/api/upload` - Uses Node.js crypto module for SHA-1 signatures

These routes are intentionally configured with `export const runtime = 'nodejs';` because they require:
- File upload handling with Buffers
- Cloudinary SDK (not edge-compatible)
- Node.js crypto module

## Solution

Deploy to Vercel instead of Cloudflare Pages, or use alternative edge-compatible upload solutions.

## Alternative: Edge-Compatible Upload

To make uploads work on Cloudflare Pages, you would need to:
1. Use Cloudflare R2 instead of Cloudinary
2. Use Web Crypto API instead of Node.js crypto
3. Rewrite upload handlers to be edge-compatible

For now, these routes will work fine on Vercel deployment.
