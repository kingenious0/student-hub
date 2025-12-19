# Environment Variables Template
# Copy this to .env.local and fill in your actual values

# Clerk Authentication (you already have these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (you already have this)
DATABASE_URL=postgresql://...

# Paystack Payment (you already have these)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# QR Code Encryption (you already have this)
QR_SECRET=your-secret-key-change-in-production

# ===== CLOUDINARY CONFIGURATION =====
# Get these from https://cloudinary.com/console
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Upload Presets (create these in Cloudinary dashboard)
# Settings → Upload → Upload presets → Add upload preset
# IMPORTANT: Set "Signing Mode" to "Unsigned" for each preset
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PRODUCTS=student-hub-products
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_STORIES=student-hub-stories
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_AVATARS=student-hub-avatars
