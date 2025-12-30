const RADAR_API_URL = 'https://api.radar.io/v1';
const SECRET_KEY = process.env.RADAR_SECRET_KEY;

if (!SECRET_KEY) {
    console.warn('Radar Secret Key is missing! Server-side location features will not work.');
}

interface CreateGeofenceParams {
    tag: string;
    externalId: string;
    description: string;
    coordinates: [number, number]; // [longitude, latitude]
    radius?: number; // meters, default 100
}

/**
 * Creates a geofence in Radar.io.
 * Useful for registering Vendors (shops) or Student Homes dynamically.
 */
export const createGeofence = async ({
    tag,
    externalId,
    description,
    coordinates,
    radius = 100
}: CreateGeofenceParams) => {
    if (!SECRET_KEY) throw new Error('Radar Secret Key missing');

    const response = await fetch(`${RADAR_API_URL}/geofences`, {
        method: 'POST',
        headers: {
            'Authorization': `${SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tag,
            externalId,
            description,
            type: 'circle',
            coordinates,
            radius
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to create Radar geofence: ${response.statusText} - ${errorBody}`);
    }

    return await response.json();
};

/**
 * Manually update a user's metadata or confirm a user in Radar.
 */
export const identifyUser = async (userId: string, metadata: Record<string, any>) => {
    if (!SECRET_KEY) throw new Error('Radar Secret Key missing');

    const response = await fetch(`${RADAR_API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `${SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            metadata
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to identify Radar user: ${response.statusText}`);
    }

    return await response.json();
}

interface CreateTripParams {
    externalId: string; // e.g., order ID
    destinationGeofenceTag?: string; // e.g., 'vendor' or 'customer'
    destinationGeofenceExternalId?: string; // ID of the destination geofence
    userId: string; // The runner's ID
    mode?: 'car' | 'foot' | 'bike' | 'truck' | 'motorbike';
    metadata?: Record<string, any>;
}

/**
 * Start a Trip in Radar to track ETA and arrival.
 */
export const createTrip = async ({
    externalId,
    destinationGeofenceTag,
    destinationGeofenceExternalId,
    userId,
    mode = 'motorbike',
    metadata
}: CreateTripParams) => {
    if (!SECRET_KEY) throw new Error('Radar Secret Key missing');

    const response = await fetch(`${RADAR_API_URL}/trips`, {
        method: 'POST',
        headers: {
            'Authorization': `${SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            externalId,
            destinationGeofenceTag,
            destinationGeofenceExternalId,
            userId, // The runner
            mode,
            metadata,
            status: 'started' // Start immediately
        })
    });

    if (!response.ok) {
        // Don't throw, just warn, so we don't break the order flow
        console.warn(`Failed to create Radar trip`, await response.text());
        return null;
    }

    return await response.json();
};
