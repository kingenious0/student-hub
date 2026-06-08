# OMNI Student Hub

OMNI Student Hub is a comprehensive campus marketplace and vendor engagement platform. It connects student buyers and campus vendors in a unified digital economy, secured by a custom escrow payment verification system.

The repository is organized as a decoupled monorepo containing:
* **`student-hub/`**: Next.js App Router API server, merchant portals, and administrative tooling.
* **`student-mobile/`**: React Native (Expo SDK 54) mobile app targeting students.

---

## 🛠️ Core Tech Stack

* **Web Application**: Next.js 16 (App Router + Turbopack) | React 19 | Tailwind CSS v4
* **Mobile Application**: React Native (Expo SDK 54) | TypeScript | NativeWind v4
* **Database & Persistence**: Postgres | Prisma ORM 5.10.2 (CockroachDB compatibility in cloud environments)
* **Authentication**: Clerk (standard session state and JWT verification)
* **Media Handling**: Cloudinary CDN (direct signed uploads for vendor listings and stories)
* **Payments**: Paystack API (sandbox/live processing with signature webhook validation)

---

## 🚀 Key Architectural Highlights

1. **Dual-Factor Identity Verification (Biometric + TOTP)**
   * Built-in multi-layered authorization gating high-risk transactions (escrow release, payout queries).
   * WebAuthn/Passkey integration via SimpleWebAuthn.
   * Client-side face descriptor vector extraction (128-dimensional floating point vectors via `face-api.js` + `TensorFlow.js`) verified server-side using Euclidean distance calculations.
   * Speakeasy-powered Time-based One-Time Password (TOTP) 2FA with secure backup codes.

2. **QR-Escrow Settlement Loop**
   * Eliminates student-to-student peer transactional risk.
   * Payments made via Paystack checkout are placed in a database-secured `HELD` state.
   * The buyer receives an AES-256 encrypted QR code payload containing transaction tokens.
   * Scan verification decrypts the payload, completing the order and releasing funds to the vendor in a single database transaction.

3. **Logical Geolocation ("Flash-Match" Algorithm)**
   * Avoids heavy background battery drain and browser GPS tracking prompts.
   * Localizes sellers and buyers using logical landmarks (hotspots) as routing indices.
   * Uses a combined, weighted scoring query: $60\%$ proximity rating + $40\%$ seller transaction activity rate to prioritize active merchants.

4. **Campus Pulse Video Feed**
   * A vertical 24-hour video discovery feed designed to drive vendor sales.
   * Optimizes browser rendering using a single intersection observer pipeline to auto-play only the vertical video taking up the active viewport.

5. **Ghost Edit Dynamic Copy Hot-Patching**
   * Dynamic administrative translation layer allowing real-time static text overrides throughout the frontend.
   * Copy adjustments write directly to the `SystemSettings` table's JSON payload and propagate dynamically to all connected client views.

---

## 📂 Project Structure

```
student-hub/
├── prisma/                  # Relational DB Schema, migrations, and seeding scripts
├── public/                  # Static media, custom models (face-api weights)
└── src/
    ├── app/                 # Next.js page routes, static views, and API endpoints
    │   ├── api/             # REST routing layer (security, payments, stories)
    │   └── dashboard/       # Vendor, Admin, and Impersonation control centers
    ├── components/          # Reusable UI systems (theme, notifications, maps, story players)
    ├── context/             # React providers (Global Security, Themes, Queries)
    └── lib/                 # Core utilities (payments, database, crypto, distance math)
```

---

## ⚙️ Local Development Setup

### Prerequisites
* Node.js (LTS version)
* PostgreSQL database instance

### 1. Repository Setup
Clone the repository and install dependencies in the `student-hub` root folder:
```bash
git clone https://github.com/kingenious0/student-hub.git
cd student-hub
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Ensure database connections (`DATABASE_URL`), Clerk secrets (`CLERK_SECRET_KEY`), Cloudinary profiles, and Paystack sandbox credentials are properly configured.

### 3. Database Schema Sync
Generate the Prisma client and push the schema to your target Postgres server:
```bash
npx prisma generate
npx prisma db push
```

### 4. Running the App
Run the Next.js development server with Turbopack enabled:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the web application.

---

## 📈 Platform Roadmap
* **Phase 1**: [x] Core Marketplace, checkout cart, and vendor dashboard.
* **Phase 2**: [x] Paystack webhook integration and escrow status transitions.
* **Phase 3**: [x] Custom TOTP 2FA, biometric face verification integration, and admin Ghost Edit.
* **Phase 4**: [x] Runner logistics claim system and active video story player.
* **Phase 5**: [ ] React Native Mobile client parity (matching Web workflows on Android/iOS).
* **Phase 6**: [ ] End-to-end symmetric encryption of database TOTP secrets and migration to live Paystack keys.
