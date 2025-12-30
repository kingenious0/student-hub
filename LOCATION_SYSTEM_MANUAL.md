# Zero-Manual Location Ecosystem: System Manual

This document outlines the powerful location infrastructure now active in the Student Hub, powered by Radar.io and Mapbox.

## 🚀 System Overview

The system automates the logistics loop between Vendors, Runners, and Students without manual data entry.

| Component | Technology | Function |
| :--- | :--- | :--- |
| **Vendor Onboarding** | **Mapbox Geocoding** | Vendors search & pin their exact shop location on campus. |
| **Geofence Engine** | **Radar API** | Automatically creates a "Vendor" geofence instantly upon signup. |
| **Runner Tracking** | **Radar SDK** | Live background tracking with "Responsive" mode for high-accuracy updates. |
| **Trip Logic** | **Radar Trips** | Starts a trip when a runner accepts an order, calculating live ETAs. |
| **Real-Time Signals** | **Radar Webhooks** | Listens for "Approaching" and "Arrival" events to trigger alerts. |

---

## 🛠️ Configuration Required

### 1. Connect Radar Webhook
To enable the backend to receive signals (like "Runner Arrived"), you must configure the webhook in your Radar Dashboard.

1. Go to the **Radar Dashboard** > **Integrations** > **Webhooks**.
2. Click **Add Webhook**.
3. **URL**: `https://<your-deployment-url>/api/webhooks/radar`
   - *Note: For local testing, run `npm run tunnel:alt` and use the generated URL (e.g., `https://nasty-forks-try.loca.lt`).*
4. **Events**: Select the following:
   - `user.entered_geofence`
   - `user.exited_geofence`
   - `trip.approaching_destination`
   - `trip.started`
   - `trip.ended`
   - `user.started_dwell`

### 2. Verify API Keys
Ensure your `.env.local` (and production environment variables) contains:
- `NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY`
- `RADAR_SECRET_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## 🔍 How to Test

### A. Vendor Auto-Geofencing
1. Go to the **Onboarding Page** (`/onboarding`).
2. Select **Vendor**.
3. Use the **Location Picker** to search for a campus building (e.g., "Casford Hall") and pin it.
4. Complete signup.
5. **Check Radar Dashboard**: You should see a new Geofence created with the tag `vendor` and the description matching your shop name.

### B. Runner Tracking & Trips
1. Log in as a **Runner**.
2. Go to the **Runner Terminal** (`/runner`).
3. Toggle "Go Online".
   - *Effect*: Browser requests Location Permissions. Radar starts tracking.
4. **Accept a Mission**.
   - *Effect*: The system calls `createTrip` in Radar.
   - **Check Radar Dashboard**: Look at the "Trips" tab to see a live active trip from the Runner to the Vendor.

### C. Webhook Signals
1. Simulate movement (or actually move) into the Geofence.
2. Watch the server logs for `[OMNI SIGNAL]` messages indicating the server received the arrival event.

---

## 🔮 Future Expansions (Next Steps)

- **Student Home Detection**: Currently, we can manually create student home geofences. The next phase is to enable "Insights" to auto-detect where a student sleeps and tag it as `student_home`.
- **Mapbox Optimization API**: For multi-stop deliveries, plug in the Optimization API to sort the runner's route automatically.
