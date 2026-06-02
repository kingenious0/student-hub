// src/lib/geo/distance.ts

/**
 * Campus hotspots for location-based matching
 * These represent common landmarks on Ghanaian university campuses
 */
// University Registry System
export const UNIVERSITY_REGISTRY = {
    USTED: {
        id: 'USTED',
        name: 'USTED (Main)',
        hotspots: {
            OPOKU_WARE_II: 'Opoku Ware Hall II',
            CANTEEN: 'Campus Canteen',
            ADMIN: 'Administration Block',
            ATWIMA: 'Atwima Hall',
            AUTONOMY: 'Autonomy Hall',
            MLT: 'Main Lecture Theatre',
            SCIENCE: 'Science Block',
            NEW_LIB: 'New Library',
            COUNCIL: 'Student Council Office',
            MARKET: 'Campus Market',
        }
    },
    KNUST: {
        id: 'KNUST',
        name: 'Kwame Nkrumah Uni. of Science & Tech.',
        hotspots: {
            BALME: 'Balme Library',
            NIGHT_MARKET: 'Night Market',
            PENT: 'Pent Hostel',
            BUSH_CANTEEN: 'Bush Canteen',
            GREAT_HALL: 'Great Hall',
            CASFORD: 'Casford Hall',
        }
    },
    UG: {
        id: 'UG',
        name: 'University of Ghana',
        hotspots: {
            BALME: 'Balme Library (UG)',
            NIGHT_MARKET: 'Night Market (UG)',
            COMMONWEALTH: 'Commonwealth Hall',
            VOLTA: 'Volta Hall',
            MAIN_GATE: 'Main Gate',
        }
    },
    VVU: {
        id: 'VVU',
        name: 'Valley View University',
        hotspots: {
            EG_WHITE: 'E.G. White Hall',
            RENATE: 'Renate Kraus Hall',
            BEDIAKO: 'Bediako Hall',
            NAGEL: 'Nagel Hall',
            HOSPITAL: 'VVU Hospital',
            CAFETERIA: 'Main Cafeteria',
            BAKERY: 'VVU Bakery',
        }
    },
    UCC: {
        id: 'UCC',
        name: 'University of Cape Coast',
        hotspots: {
            CASFORD: 'Casford Hall',
            VALCO: 'Valco Hall',
            OGUAA: 'Oguaa Hall',
            ADEHYE: 'Adehye Hall',
            ATL: 'Atlantic Hall',
            PSI: 'PSI Hostel',
            SRC: 'SRC Hall',
            SCIENCE: 'Science Market',
        }
    },
    UPSA: {
        id: 'UPSA',
        name: 'University of Professional Studies, Accra',
        hotspots: {
            HOSTEL_A: 'Hostel A',
            HOSTEL_B: 'Hostel B',
            HOSTEL_C: 'Hostel C',
            LBC: 'Lecture Block Complex',
            STUDENT_CENTRE: 'Student Centre',
            MAIN_AUDITORIUM: 'Main Auditorium',
        }
    },
    UEW: {
        id: 'UEW',
        name: 'University of Education, Winneba',
        hotspots: {
            SIMPA: 'Simpa Hall',
            GHITEL: 'Ghartey Hall',
            AGGREY: 'Aggrey Hall',
            UNIVERISTY_HALL: 'University Hall',
            NORTH_CAMPUS: 'North Campus Main',
            SOUTH_CAMPUS: 'South Campus Main',
        }
    },
    ASHESI: {
        id: 'ASHESI',
        name: 'Ashesi University',
        hotspots: {
            STUDENT_DORMS: 'Student Dormitories',
            DORM_NORTH: 'Dorm North',
            DORM_SOUTH: 'Dorm South',
            CAFETERIA: 'The Cafeteria',
            ENGINEERING: 'Engineering Lab',
            FAB_LAB: 'Fab Lab',
            LIBRARY: 'Radric Library',
        }
    },
    UDS: {
        id: 'UDS',
        name: 'University for Development Studies',
        hotspots: {
            TAMALE_CAMPUS: 'Tamale Campus Main',
            WA_CAMPUS: 'Wa Campus Main',
            NYANKPALA: 'Nyankpala Campus',
            NAVRONGO: 'Navrongo Campus',
            MEDICAL_SCHOOL: 'Medical School Hostel',
        }
    }
} as const;

export const GENERIC_HOTSPOTS = {
    MAIN_GATE: 'Main Gate / Entrance',
    ADMIN_BLOCK: 'Administration Block',
    LIBRARY: 'University Library',
    CAFETERIA: 'Main Cafeteria',
    SRC_HOSTEL: 'SRC / Student Union Hostel',
    SPORTS_COMPLEX: 'Sports Complex',
    OTHER: 'Other (Custom)'
} as const;

// Helper to get hotspots for a given university ID
export function getHotspotsForUniversity(uniId: string | null) {
    if (uniId && uniId in UNIVERSITY_REGISTRY) {
        return (UNIVERSITY_REGISTRY as any)[uniId].hotspots;
    }
    return GENERIC_HOTSPOTS;
}

// Backward compatibility for existing code using CAMPUS_HOTSPOTS
// (Maps to USTED by default for now, or FLATTENED list)
export const CAMPUS_HOTSPOTS = {
    ...UNIVERSITY_REGISTRY.USTED.hotspots,
    ...UNIVERSITY_REGISTRY.KNUST.hotspots,
    ...GENERIC_HOTSPOTS
};

export type Hotspot = string;

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
