// src/lib/geo/distance.ts

/**
 * Campus hotspots for location-based matching
 * These represent common landmarks on Ghanaian university campuses
 */
export const CAMPUS_HOTSPOTS = {
    // KNUST Hotspots
    KNUST_BALME_LIBRARY: 'Balme Library',
    KNUST_NIGHT_MARKET: 'Night Market',
    KNUST_PENT_HOSTEL: 'Pent Hostel',
    KNUST_BUSH_CANTEEN: 'Bush Canteen',
    KNUST_GREAT_HALL: 'Great Hall',
    KNUST_CASFORD: 'Casford',

    // UG Hotspots
    UG_BALME_LIBRARY: 'Balme Library (UG)',
    UG_NIGHT_MARKET: 'Night Market (UG)',
    UG_COMMONWEALTH_HALL: 'Commonwealth Hall',
    UG_VOLTA_HALL: 'Volta Hall',
    UG_MAIN_GATE: 'Main Gate',

    // Generic
    LECTURE_HALL: 'Lecture Hall',
    CAFETERIA: 'Cafeteria',
    SPORTS_COMPLEX: 'Sports Complex',
} as const;

export type Hotspot = typeof CAMPUS_HOTSPOTS[keyof typeof CAMPUS_HOTSPOTS];

/**
 * Calculate proximity score between two hotspots
 * Returns a score from 0-100 where 100 is exact match
 * 
 * This is a simplified hotspot-based system that doesn't require
 * precise GPS coordinates, saving battery and respecting privacy
 */
export function calculateHotspotProximity(
    userHotspot: string | null,
    productHotspot: string | null
): number {
    // If either hotspot is missing, return low score
    if (!userHotspot || !productHotspot) {
        return 20;
    }

    // Exact match - same location
    if (userHotspot === productHotspot) {
        return 100;
    }

    // Check if they're in the same general area (e.g., both "Night Market")
    const userBase = userHotspot.replace(/\s*\(.*?\)\s*/g, '').trim();
    const productBase = productHotspot.replace(/\s*\(.*?\)\s*/g, '').trim();

    if (userBase === productBase) {
        return 80;
    }

    // Different locations - return base score
    return 30;
}

/**
 * Sort products by proximity to user's current hotspot
 * Also considers vendor's last active time (Flash-Match algorithm)
 */
export function sortByFlashMatch<T extends {
    hotspot: string | null;
    vendor: {
        lastActive: Date;
    };
    [key: string]: unknown;
}>(
    products: T[],
    userHotspot: string | null,
    maxInactiveMinutes: number = 10
): T[] {
    const now = Date.now();

    return products
        .map(product => {
            const proximityScore = calculateHotspotProximity(userHotspot, product.hotspot);

            // Calculate vendor activity score (0-100)
            const minutesInactive = (now - product.vendor.lastActive.getTime()) / (1000 * 60);
            const activityScore = Math.max(0, 100 - (minutesInactive / maxInactiveMinutes) * 100);

            // Combined score: 60% proximity, 40% activity
            const totalScore = (proximityScore * 0.6) + (activityScore * 0.4);

            return {
                product,
                totalScore,
                proximityScore,
                activityScore,
            };
        })
        .sort((a, b) => b.totalScore - a.totalScore)
        .map(item => item.product);
}

/**
 * Check if a vendor is currently "active" (online recently)
 */
export function isVendorActive(lastActive: Date, maxMinutes: number = 10): boolean {
    const minutesInactive = (Date.now() - lastActive.getTime()) / (1000 * 60);
    return minutesInactive <= maxMinutes;
}

/**
 * Get a user-friendly distance description
 */
export function getDistanceDescription(
    userHotspot: string | null,
    productHotspot: string | null
): string {
    const score = calculateHotspotProximity(userHotspot, productHotspot);

    if (score >= 100) return 'Same location';
    if (score >= 80) return 'Very close';
    if (score >= 50) return 'Nearby';
    return 'Different area';
}
