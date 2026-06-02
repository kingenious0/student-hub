# OMNI Student Hub: System Architecture & Technical Overview

This document provides a high-density, engineering-first breakdown of the OMNI Student Hub platform (comprising the Next.js web application and the Expo mobile application). It is designed to get a senior developer up to speed on the system topology, core security models, data flows, and technical trade-offs without the verbose, clinical filler of automated documentation.

---

## 1. System Topology & Directory Structure

The repository is structured as a decoupled monorepo consisting of two primary projects:
* **`student-hub/`**: The core web application, Next.js App Router API server, merchant portals, and administrative tooling.
* **`student-mobile/`**: The mobile interface targeting student buyers (React Native / Expo SDK 54).

```
student-marketplace/
├── student-hub/                 # Next.js Web App (API & Dashboards)
│   ├── src/
│   │   ├── app/                 # Next.js App Router (pages & endpoints)
│   │   ├── components/          # Reusable UI & Contexts
│   │   ├── lib/                 # Core utilities (geo, security, DB)
│   │   └── hooks/               # Custom React hooks (theme, auth state)
│   ├── prisma/                  # Relational Schema & Seeding scripts
│   └── docs/                    # Contextual technical sub-documents
└── student-mobile/              # React Native Mobile App (Expo)
    ├── app/                     # Expo Router navigation hierarchy
    ├── components/              # Native interface elements
    └── lib/                     # Geofencing client and API utilities
```

### Core Tech Stack
* **Web Frontend / Backend**: Next.js (App Router + Turbopack) running React 19 and Tailwind CSS v4.
* **Mobile App**: React Native via Expo SDK 54, utilizing NativeWind v4 for consistent utility-first styling tokens.
* **Database & Persistence**: PostgreSQL (configured via Prisma ORM 5.10.2). CockroachDB compatibility is maintained in cloud environments.
* **Authentication**: Clerk (standard session management and JWT/OAuth validation).
* **Media Handling**: Cloudinary CDN (direct stream signing for vendor assets and vertical video stories).
* **Payments**: Paystack API (sandbox/live payment processing with signature webhook validation).

---

## 2. Core Technical Workflows

The platform leverages several unique application patterns to address security, delivery logistics, and campus-scale scaling.

### A. The Dual-Verification Security Model
While Clerk handles core session management and identity provider integration, high-risk operational entry points (e.g., Mobile Money/MoMo cashout approval, order escrow release, or administrative state modification) are protected by a secondary, server-side verified security layer.

```
                  [User Request to Mutate Sensitive Resource]
                                      │
                                      ▼
                        [Clerk Session Verification]
                                      │
                                      ▼
                        [Custom Security Gate]
                        ├── Biometric Verification (Face-API.js)
                        └── 2FA verification (Speakeasy TOTP)
                                      │
                                      ▼
                         [Database Write Approved]
```

1. **Biometric Face Recognition**:
   * **Framework**: Client-side face descriptor extraction using `face-api.js` over a `TensorFlow.js` or `@mediapipe/tasks-vision` WebAssembly runtime.
   * **Mechanics**: Extracts a 128-dimensional floating-point face descriptor vector from a live user camera stream. Three reference captures are taken during onboarding to establish baseline traits.
   * **Matching Engine**: On sensitive actions, a new descriptor is sent via POST to `/api/security/verify-face`. The server computes the Euclidean distance between the incoming vector ($q$) and the stored baseline database descriptor ($p$):
     $$d(q, p) = \sqrt{\sum_{i=1}^{128} (q_i - p_i)^2}$$
     A distance threshold setting of $\le 0.6$ establishes a definitive identity validation match.
2. **Two-Factor Authentication (2FA)**:
   * **Engine**: Speakeasy (`speakeasy` library) manages TOTP configurations.
   * **Mechanics**: Server-side TOTP secret generation, mapped to users as encrypted strings. Setting up generates a standard QR code (via `qrcode`) compatible with standard mobile Authenticator apps, returning high-entropy, encrypted one-time backup codes.
   * **Sync Buffer**: Verification routines allow a clock drift window of ±1 step (60-second buffer) to prevent user-agent synchronization failures.

### B. Geolocation & The "Flash-Match" Algorithm
To side-step high battery consumption, browser permission fatigue, and the privacy implications of continuous GPS coordinate tracking, the platform utilizes a named logical hotspot index rather than raw GPS telemetry streams.

1. **Proximity Modeling**:
   * Locations are represented by logical campus landmarks and student hotspots (e.g., "Night Market", "Balme Library").
   * Sellers tag products with their target hotspot. Buyers filter their home feed by choosing a logical starting hotspot.
2. **Flash-Match Scoring**:
   * Nearby vendors are computed through a combined score weighted toward proximity and current active operations.
   * **Weighted Formula**:
     $$\text{Score} = (\text{Proximity Distance Rating} \times 0.6) + (\text{Vendor Activity Score} \times 0.4)$$
   * Active vendors with recent orders or rolling 7-day transactional throughput updates bubble up faster to promote responsive campus delivery.

### C. QR-Escrow Payment & Settlement Loop
To eliminate fraud in student-to-student transactions, the system implements a programmatic escrow pattern using Paystack to secure funds until delivery is verified.

```
[Buyer Checkout] ──► [Paystack Payment] ──► [Webhook Received] ──► [Db: Order marked PAID]
                                                                        │
                                                                        ▼
                                                               [Escrow status HELD]
                                                                        │
                                                                        ▼
[Vendor hands to Runner] ◄── [Runner Claims Order] ◄─── [QR Code Generated & Encrypted]
          │
          ▼
[Runner scans Buyer QR] ──► [Decrypt Key] ──► [/api/delivery/verify-qr] ──► [Db: Escrow RELEASED]
                                                                                │
                                                                                ▼
                                                                     [Payout balances updated]
```

1. **Payment Initiation**:
   * Multiple vendors in a checkout cart are grouped into a single transactional group (`OrderGroup`) handled by Paystack, then mapped into individual seller shipments (`Order` models) in the database.
2. **Escrow Locking**:
   * Upon successful Paystack webhook validation (`/api/webhooks/paystack`), the order status transitions to `PAID` and `escrowStatus` moves to `HELD`.
   * The platform generates a secure 6-digit release key and a corresponding encrypted QR code (AES-256 encrypted string containing transaction metadata).
3. **Delivery Verification**:
   * The vendor scans the buyer’s QR code.
   * Decrypted payload verification triggers `/api/delivery/verify-qr`.

### D. Campus Pulse (Vertical Story Feed)
To boost sales, vendors can upload short-form engagement videos that live for exactly 24 hours.

1. **Client-Side Mechanics**:
   * Next.js renders a mobile-responsive vertical layout mimicking modern video timelines.
   * Auto-playback relies on a single global `IntersectionObserver` instance mounted to the parent viewport wrapper. It triggers `.play()` and `.pause()` directives exclusively for the HTML5 Video Element taking up $\ge 75\%$ of active layout visibility, immediately detaching inactive media elements from the DOM thread to optimize network and memory footprint.
2. **CDN & Video Compression**:
   * Videos are uploaded directly from the browser to Cloudinary via signed payloads, routing to the `student-hub/stories/` folder.
   * Payloads are constrained to a strict `50MB` threshold to protect mobile data bandwidth on campus networks.
3. **Pruning Loop**:
   * Instead of resource-intensive server CRON cleanup scripts, stories expire gracefully via database constraints: queries seeking active stories explicitly assert `expiresAt > now()`.

### E. Ghost Edit (Dynamic Administrative Content Sync)
Admins can dynamically hot-patch static copy throughout the site without executing a full Vercel compilation and deployment loop.

1. **System Config Store**:
   * System settings, global notice banners, and hot-patchable elements reside in a single-row table `SystemSettings` under the primary key `GLOBAL_CONFIG`.
   * Text overrides are stored inside a dedicated `contentOverride` `JSONB` column in the format of flat keys mapping to raw strings.
2. **State Propagation**:
   * When an admin edits copy via the front-end "Ghost Edit" overlay, updates write directly to the database and invalidate the server-side cache tags or React Query context.
   * Connected clients pull down updates via an event-driven listener state or revalidated cache tags, updating layouts dynamically on the next user action or data-poll (within a 2-second buffer window).

---

## 3. Database Schema Overview

The schema is built on top of PostgreSQL via Prisma. To prevent connection pooling exhaustion during Next.js Hot Reloads/Fast Refreshes in local development environments, the global initialization client is implemented as a singleton wrapper instance.

Key models and their relationship strategies include:

### A. Core Order Relationship Design
```prisma
model Order {
  id              String          @id @default(uuid())
  status          OrderStatus     @default(PENDING)
  escrowStatus    EscrowStatus    @default(PENDING)
  orderGroupId    String?
  orderGroup      OrderGroup?     @relation(fields: [orderGroupId], references: [id])
  amount          Float
  items           OrderItem[]
  
  studentId       String
  student         User            @relation("StudentOrders", fields: [studentId], references: [id], onDelete: Cascade)
  
  vendorId        String
  vendor          User            @relation("VendorOrders", fields: [vendorId], references: [id], onDelete: Cascade)
  

  
  fulfillmentType FulfillmentType @default(PICKUP)
  
  createdAt       DateTime        @default(now())
  paidAt          DateTime?
  pickedUpAt      DateTime?
  deliveredAt     DateTime?

  pickupCode      String?         // Vendor verification code
  releaseKey      String?         // Delivery verification code
  mission         Mission?
}
```

### B. Relationship Policies
* **Cascade on Delete**: Removing a core parent domain entity (e.g., a `Product`) deletes secondary data streams like reviews or active flash sale settings cascade-style.


---

## 4. Current Platform Roadmap & Engineering Debt

The codebase is functional for alpha demonstrations but has clear, actionable structural tasks that must be resolved prior to a public campus launch.

### Current Status
* **Core Web App**: Stable. Paystack checkout is operating in sandbox mode. Database is migrated and seeded.
* **Security Layer**: 2FA setup and local Face-API models are fully working. Camera access works as long as HTTPS context is present.
* **Mobile App (Expo)**: Basic layout and router routes are configured; integration with `react-native-radar` is set up. Next steps are matching the complex web workflows on native screens.

### Technical Debt / Pre-Launch Polish Required

#### Symmetric Secrets Encryption:
* **Current Status**: TOTP secrets are base64-encoded for DB storage.
* **Pre-Launch Task**: Upgrade this to an authenticated symmetric encryption wrapper (e.g., `AES-256-GCM` using Node's native `crypto` module) backed by a secure environment variable `SECURITY_ENCRYPTION_KEY`.

#### Strict Webhook Validation:
* **Current Status**: The Paystack webhook route evaluates payloads against incoming references.
* **Pre-Launch Task**: Hard-code the IP whitelisting configuration to match Paystack's official transaction servers, and strictly sign-check the incoming `x-paystack-signature` header using `crypto.createHmac('sha512', secret)`.

#### Relational Location Indexing:
* **Current Status**: Geolocation algorithms rely on direct string matching against user profile fields (`currentHotspot`).
* **Pre-Launch Task**: Map all campus logical landmarks to static database IDs and establish foreign key relations to enforce referential integrity and avoid string mismatch failures across client applications.

#### Two-Step Fulfillment Hand-off:

