# OMNI Student Hub: Local Setup & Configuration

This guide helps you set up external API keys and cloud services (Clerk, Paystack, Cloudinary, and Postgres) for both local development and staging environments.

---

## 1. Environment Variables (`.env`)

Create a `.env` (or `.env.local` for overrides) in the root of the `student-hub/` directory and configure the following variables:

```env
# Database Connections
DATABASE_URL="postgresql://username:password@host:port/dbname?sslmode=require"
DIRECT_URL="postgresql://username:password@host:port/dbname?sslmode=require"

# Clerk Authentication (Get these from your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Paystack Integration (Get these from your Paystack settings)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_SECRET_KEY="sk_test_..."

# QR-Escrow Cryptography Key (Must be highly secure in production)
QR_SECRET="your-32-byte-aes-encryption-key-for-qr"

# Cloudinary Integration (Get these from your Cloudinary dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Cloudinary Upload Presets
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PRODUCTS="student-hub-products"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_STORIES="student-hub-stories"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_AVATARS="student-hub-avatars"
```

---

## 2. Cloudinary Media Presets Setup

The marketplace relies on Cloudinary for product image and vertical story uploads. 

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Navigate to the **Cloudinary Console** to grab your Cloud Name, API Key, and API Secret. Add them to your `.env`.
3. Go to **Settings** (gear icon) → **Upload** → **Upload presets** and click **Add upload preset**.
4. Create three separate presets with the following names:
   * `student-hub-products` (for marketplace listing covers and galleries)
   * `student-hub-stories` (for 9:16 vertical stories)
   * `student-hub-avatars` (for user profiles)
5. **CRITICAL STEP**: For each preset, set the **Signing Mode** to **Unsigned**. This enables client-side direct uploads, bypassing the need to buffer binary streams through Next.js serverless runtimes.

---

## 3. Paystack Webhook & Escrow Setup

To process GHS/MoMo checkouts and transition order statuses dynamically:

1. Log into your [Paystack Dashboard](https://dashboard.paystack.com/).
2. Switch to **Test Mode** (or Live Mode if deployed).
3. Navigate to **Settings** → **API Keys & Webhooks**.
4. Set the **Webhook URL** to:
   `https://<your-domain>/api/webhooks/paystack`
   *(For local testing, use a tunnel tool like `npm run tunnel` to generate a public https forwarding address, then point your Paystack webhook there).*
5. The webhook listens for `charge.success` events. It will verify the cryptographic signature sent in the `x-paystack-signature` header against your local `PAYSTACK_SECRET_KEY` before releasing database order blocks.
