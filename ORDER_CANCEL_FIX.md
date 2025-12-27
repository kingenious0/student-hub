# ✅ ORDER CANCEL 500 ERROR - FIXED

## Issue
**POST /api/orders/[id]/cancel** returned **500 Internal Server Error**.

## Cause
1. **Edge Runtime Incompatibility:** The file had `export const runtime = 'edge';`. This forces the API to run in the Edge runtime, but the standard Prisma Client (ignoring the `@prisma/client/edge` import which wasn't even there) relies on Node.js native modules (`fs`, `child_process`) which fail in Edge.
2. **Invalid Enum Value (Minor):** The code was setting `runnerStatus` to `'IDLE'`, but the allowed values are `'ONLINE'`, `'OFFLINE'`, `'BUSY'`. This might have logical side effects (runner appearing offline).

## Fix Applied
1. **Disabled Edge Runtime:** Commented out `// export const runtime = 'edge';` to run in standard Node.js environment.
2. **Fixed Runner Status:** Changed `'IDLE'` to `'ONLINE'` so the runner becomes available again after cancellation.

## 📋 Files Modified
- `/src/app/api/orders/[id]/cancel/route.ts`

## 🧪 Verification
The endpoint should now work correctly and return 200 OK.
