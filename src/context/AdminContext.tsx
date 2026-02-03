'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface AdminContextType {
    isGhostAdmin: boolean;
    superAccess: boolean;
    activeFeatures: string[];
    contentOverrides: Record<string, any>;
    isFeatureEnabled: (feature: string) => boolean;
    maintenanceMode: boolean;
    ghostEditMode: boolean;
    toggleGhostEdit: () => void;
    setGhostAdmin: (value: boolean) => void;
    refreshConfig: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser(); // Hook into Clerk User changes
    const [isGhostAdmin, setIsGhostAdmin] = useState(false);
    const [superAccess, setSuperAccess] = useState(false);
    const [ghostEditMode, setGhostEditMode] = useState(false);
    const [activeFeatures, setActiveFeatures] = useState<string[]>(['MARKET', 'PULSE', 'RUNNER', 'ESCROW', 'VENDOR']);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [contentOverrides, setContentOverrides] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!isLoaded) return; // Wait for Clerk to load

        // Check for ghost admin mode from localStorage OR Clerk
        const checkAdminStatus = async () => {
            // Check Server Session (Clerk)
            let clerkGod = false;
            let isUserLoggedIn = false;

            try {
                // Add cache: 'no-store' to prevent stale role data
                const res = await fetch('/api/users/me', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();

                    // If we have a user from the API, we trust it
                    if (data.role && data.role !== 'GUEST') {
                        isUserLoggedIn = true;
                        console.log('[ADMIN-CONTEXT] User role:', data.role);
                    } else {
                        console.log('[ADMIN-CONTEXT] User role: GUEST');
                    }

                    // API returns { role: 'GOD_MODE' } directly
                    if (data.role === 'GOD_MODE' || data.role === 'ADMIN') {
                        clerkGod = true;
                        console.log(`[ADMIN-CONTEXT] 🔥 ${data.role} privileges detected!`);
                        localStorage.setItem('OMNI_GOD_MODE_UNLOCKED', 'true'); // Sync to localStorage
                    }
                }
            } catch (e) {
                console.error('[ADMIN-CONTEXT] Failed to check Clerk role:', e);
            }

            // CRITICAL SECURITY FIX:
            // If a User IS logged in, their Role is the Absolute Truth.
            // We DO NOT allow LocalStorage to override a logged-in Student.

            if (isUserLoggedIn) {
                if (clerkGod) {
                    setIsGhostAdmin(true);
                    setSuperAccess(true);
                } else {
                    // Active User is NOT God. Revoke everything.
                    setIsGhostAdmin(false);
                    setSuperAccess(false);
                    localStorage.removeItem('OMNI_GOD_MODE_UNLOCKED'); // Kill the stale key
                    console.log('[ADMIN-CONTEXT] 🛡️ Security: Stale Admin Key purged for non-admin user.');
                }
            } else {
                // Formatting: No User Logged In (Guest). 
                // We allow LocalStorage unlock here (e.g. Secret Command Center Password unlock)
                const localGhost = localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true';
                if (localGhost) console.log('[ADMIN-CONTEXT] 👻 Ghost Session Active (Local Key)');

                setIsGhostAdmin(localGhost);
                setSuperAccess(localGhost);
            }
        };

        checkAdminStatus();

        // Initial Config Fetch & Polling
        refreshConfig();
        const interval = setInterval(refreshConfig, 2000); // 2s poll for fast sync
        return () => clearInterval(interval);
    }, [isLoaded, user]); // Re-run when User changes

    const refreshConfig = async () => {
        try {
            const res = await fetch('/api/system/config');
            const data = await res.json();
            if (data.success) {
                if (Array.isArray(data.activeFeatures)) setActiveFeatures(data.activeFeatures);
                if (data.contentOverride) setContentOverrides(data.contentOverride);
                setMaintenanceMode(!!data.maintenanceMode);
            }
        } catch (e) {
            console.warn("Config sync failed (likely network/server issue):", e);
        }
    };

    const setGhostAdmin = (value: boolean) => {
        setIsGhostAdmin(value);
        setSuperAccess(value);
        if (value) {
            localStorage.setItem('OMNI_GOD_MODE_UNLOCKED', 'true');
        } else {
            localStorage.removeItem('OMNI_GOD_MODE_UNLOCKED');
        }
    };

    const isFeatureEnabled = (feature: string) => {
        if (superAccess) return true; // God Mode bypass
        if (activeFeatures.includes(feature)) return true;
        return false;
    };

    const toggleGhostEdit = () => setGhostEditMode(prev => !prev);

    return (
        <AdminContext.Provider value={{ isGhostAdmin, superAccess, activeFeatures, maintenanceMode, contentOverrides, isFeatureEnabled, ghostEditMode, toggleGhostEdit, setGhostAdmin, refreshConfig }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
