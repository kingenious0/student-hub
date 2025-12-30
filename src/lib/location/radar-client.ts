import RadarBase from 'radar-sdk-js';
const Radar = RadarBase as any;

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    console.warn('Radar Publishable Key is missing! Location features will not work.');
}

/**
 * Initialize Radar SDK with the project's publishable key.
 * Should be called once at app startup (e.g., in a Context Provider).
 */
export const initializeRadar = () => {
    if (typeof window !== 'undefined' && PUBLISHABLE_KEY) {
        Radar.initialize(PUBLISHABLE_KEY);
    }
};

/**
 * Request location permissions and start tracking.
 * @param mode 'RESPONSIVE' (Runners - high accuracy) or 'EFFICIENT' (Students - battery saving)
 * @param backgroundRequest If true, requests "Always" (Background) permission. If false, requests "When in Use" (Foreground).
 */
export const startTracking = async (mode: 'RESPONSIVE' | 'EFFICIENT' = 'EFFICIENT', backgroundRequest: boolean = false) => {
    if (!PUBLISHABLE_KEY) return;

    try {
        // 1. Request Permissions
        const permissionResult = await Radar.requestPermissions(backgroundRequest);

        if (permissionResult.status === 'DENIED') {
            console.error('Location permissions denied:', permissionResult);
            return;
        }

        // 2. Start Tracking
        const trackingOptions = mode === 'RESPONSIVE'
            ? Radar.presets.responsive
            : Radar.presets.efficient;

        await Radar.startTracking(trackingOptions);
        console.log(`Radar tracking started in ${mode} mode (Background: ${backgroundRequest}).`);

    } catch (error) {
        console.error('Error starting Radar tracking:', error);
    }
};

/**
 * Stop tracking location.
 */
export const stopTracking = async () => {
    if (!PUBLISHABLE_KEY) return;
    try {
        await Radar.stopTracking();
        console.log('Radar tracking stopped.');
    } catch (error) {
        console.error('Error stopping Radar tracking:', error);
    }
};

/**
 * Manually update the user's location (one-off).
 */
export const trackOnce = async () => {
    if (!PUBLISHABLE_KEY) return;
    try {
        const result = await Radar.trackOnce();
        return result;
    } catch (error) {
        console.error('Error tracking once:', error);
        throw error;
    }
};
