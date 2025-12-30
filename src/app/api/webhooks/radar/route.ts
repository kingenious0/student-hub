import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Radar events usually come in an 'events' array or single event depending on config.
        // Assuming standard webhook payload: { event: { ... }, type: "..." } or { events: [...] }

        // Radar standard webhook format (simplified check):
        const events = body.events || [body.event];

        for (const event of events) {
            if (!event) continue;

            const type = event.type;
            console.log(`Radar Webhook Event: ${type}`, event);

            // 1. Runner is approaching Vendor (Trip Update)
            if (type === 'trip.approaching_destination') {
                const orderId = event.trip?.externalId;
                const eta = event.trip?.eta?.duration; // mins usually
                if (orderId) {
                    console.log(`[OMNI SIGNAL] Runner approaching Vendor for Order #${orderId}. ETA: ${eta} min`);
                    // Trigger Vendor Flash/Notification Logic here
                }
            }

            // 2. Runner Arrived at Vendor or Student Location
            if (type === 'user.entered_geofence') {
                const userId = event.user?.userId; // Clerk ID of Runner
                const geofenceTag = event.geofence?.tag;
                const geofenceDescription = event.geofence?.description;

                if (geofenceTag === 'vendor') {
                    console.log(`[OMNI SIGNAL] Runner ${userId} entered VENDOR ZONE: ${geofenceDescription}`);
                    // Notify Vendor: "Runner is here!"
                }

                if (geofenceTag === 'halls' || geofenceTag === 'student_home') {
                    console.log(`[OMNI SIGNAL] Runner ${userId} entered STUDENT ZONE: ${geofenceDescription}`);
                    // Notify Student: "Come out! Runner is here."
                }
            }

            // 3. Dwell Detection (Picking up or Waiting)
            if (type === 'user.started_dwell') {
                // If dwelling at vendor -> Status = "Picking Up"?
                // If dwelling at hall -> Status = "Delivering"?
                console.log(`[OMNI SIGNAL] User ${event.user?.userId} is dwelling at ${event.geofence?.description}`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error('Radar Webhook Error', err);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
