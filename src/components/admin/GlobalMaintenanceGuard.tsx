
'use client';

import { useAdmin } from '@/context/AdminContext';
import { ReactNode } from 'react';
import MaintenanceLockdown from './MaintenanceLockdown';

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
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
                {/* Animated Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-[#39FF14]/20 border-t-[#39FF14] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                        </div>
                    </div>
                    <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Establishing Secure Uplink...</p>
                </div>
            </div>
        );
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
