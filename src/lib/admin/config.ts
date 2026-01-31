
import { prisma } from '@/lib/db/prisma';

/**
 * Checks if the system is currently in maintenance mode.
 */
export async function isMaintenanceMode() {
    try {
        const config = await prisma.systemSettings.findUnique({
            where: { id: 'GLOBAL_CONFIG' }
        });
        return config?.maintenanceMode ?? false;
    } catch (error) {
        return false;
    }
}
