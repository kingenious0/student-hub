<p align="center">
  <img src="https://raw.githubusercontent.com/kingenious0/student-hub/development/public/lahustle-icon.svg" alt="LaHustle Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">LaHustle (Student Marketplace & Hub)</h1>

<p align="center">
  <strong>A premium, secure campus marketplace and vendor engagement platform designed for university student micro-economies.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16%20App%20Router-black?logo=next.js&style=for-the-badge" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma-5.10-blue?logo=prisma&style=for-the-badge" alt="Prisma" />
  <img src="https://img.shields.io/badge/Paystack-Integrated-teal?logo=paystack&style=for-the-badge" alt="Paystack" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&style=for-the-badge" alt="Clerk" />
</p>

---

## 👨‍💻 Lead Developer & Author
* **Lead Developer & System Architect:** **Elliot Paakow Entsiwah (Kingenious)**
* **Role:** Student Founder & Lead Software Engineer
* **University Affiliate:** USTED

---

## 📖 Project Overview

**LaHustle** is an all-in-one student micro-marketplace platform. It connects student buyers with trusted campus vendors in a unified ecosystem. The platform enforces security through a custom-built escrow payment settlement loop, dynamic verification, and logical hotspot geolocation tracking.

The repository contains:
* **`student-hub/`**: The Next.js App Router merchant dashboard, administrative command centers, and API backend.
* **`student-mobile/`**: The companion React Native (Expo SDK 54) mobile app targeting on-the-go student users.

---

## 🛠️ Core Tech Stack

* **Frontend & Server Components**: Next.js 16 (App Router + Turbopack) | React 19 | Tailwind CSS v4
* **Database & Persistence Layer**: PostgreSQL | Prisma ORM 5.10.2 (Cloud-optimized configuration)
* **Authentication & Identity**: Clerk (Custom session synchronization and JWT verification)
* **Media Assets**: Cloudinary CDN (Signed uploads for product images, vendor stories, and verification)
* **Payments Infrastructure**: Paystack Inline SDK v2 (Live/Sandbox gateway with automated webhook signature validation)

---

## 🚀 Key Architectural Highlights

### 1. QR-Escrow Settlement Loop 🛡️
To eliminate peer-to-peer transaction risk on campus:
* Payments made via Paystack are held securely in a database-backed `HELD` state.
* The buyer receives an AES-256 encrypted transaction payload encapsulated in a QR code.
* To complete the order and release the funds to the seller, the vendor scans the QR code at the physical handover. The system decrypts the payload and triggers a single, atomic database transaction to release funds.

### 2. Dual-Factor Security Protocols (Face Biometrics + TOTP) 🔑
Built-in verification safeguards high-risk merchant events (payout releases, settings overrides):
* **Biometric Verification**: Client-side face descriptor vector extraction (128-dimensional floating point vectors via `face-api.js` + `TensorFlow.js`) verified server-side using Euclidean distance thresholds.
* **TOTP 2FA**: Speakeasy-powered Time-based One-Time Password multi-factor authentication with secure backup keys.

### 3. Logical Geolocation ("Flash-Match" Algorithm) 📍
* Localizes sellers and buyers using logical landmarks (campus hotspots) as routing indices.
* Utilizes a weighted query: $60\%$ proximity rating + $40\%$ seller transaction activity rate to prioritize active merchants, avoiding battery drain from continuous browser GPS polling.

### 4. Campus Pulse Video Feed 📱
* A vertical 24-hour video discovery feed designed to drive vendor sales.
* Uses a single intersection observer pipeline to auto-play only the vertical video taking up the active viewport.

### 5. Ghost Edit Dynamic Copy Hot-Patching ⚙️
* Admin translation layer allowing real-time static text overrides throughout the frontend.
* Adjustments write directly to the `SystemSettings` table's JSON payload and propagate dynamically to all connected client views.

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
