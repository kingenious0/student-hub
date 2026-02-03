
'use client';

import { useAdmin } from '@/context/AdminContext';
import { ReactNode } from 'react';
import MaintenanceLockdown from './MaintenanceLockdown';

/**
 * GlobalMaintenanceGuard
 * 
 * Enforces a total OMNI Sector Lockdown.
 * When active, only users with Admin/Ghost clearance can bypass the barrier.
 */
export default function GlobalMaintenanceGuard({ children }: { children: ReactNode }) {
    const { isGhostAdmin, maintenanceMode } = useAdmin();

    // If maintenance is active and user is NOT an admin, trigger lockdown
    if (maintenanceMode && !isGhostAdmin) {
        return (
            <MaintenanceLockdown 
                title="SECTOR LOCKDOWN" 
                message="The OMNI ecosystem is currently offline for critical core upgrades and infrastructure recalibration. Systems will be back online shortly."
            />
        );
    }

    return <>{children}</>;
}
