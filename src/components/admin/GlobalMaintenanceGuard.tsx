
'use client';

import { useAdmin } from '@/context/AdminContext';
import { ReactNode } from 'react';
import MaintenanceLockdown from './MaintenanceLockdown';
import LaHustleLoader from '@/components/ui/LaHustleLoader';

/**
 * GlobalMaintenanceGuard
 * 
 * Enforces a total LaHustle Sector Lockdown.
 * When active, only users with Admin/Ghost clearance can bypass the barrier.
 */
export default function GlobalMaintenanceGuard({ children }: { children: ReactNode }) {
    const { isGhostAdmin, maintenanceMode, isConfigLoaded } = useAdmin();

    // Show a high-fidelity loading screen until we are fully synced
    if (!isConfigLoaded) {
        return <LaHustleLoader />;
    }

    // If maintenance is active and user is NOT an admin, trigger lockdown
    if (maintenanceMode && !isGhostAdmin) {
        return (
            <MaintenanceLockdown 
                title="SECTOR LOCKDOWN" 
                message="The LaHustle ecosystem is currently offline for critical core upgrades and infrastructure recalibration. Systems will be back online shortly."
            />
        );
    }

    return <>{children}</>;
}
