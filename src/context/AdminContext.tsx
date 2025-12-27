'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
    isGhostAdmin: boolean;
    superAccess: boolean;
    activeFeatures: string[];
    contentOverrides: Record<string, any>;
    isFeatureEnabled: (feature: string) => boolean;
    ghostEditMode: boolean;
    toggleGhostEdit: () => void;
    setGhostAdmin: (value: boolean) => void;
    refreshConfig: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isGhostAdmin, setIsGhostAdmin] = useState(false);
    const [superAccess, setSuperAccess] = useState(false);
    const [ghostEditMode, setGhostEditMode] = useState(false);
    const [activeFeatures, setActiveFeatures] = useState<string[]>(['MARKET', 'PULSE', 'RUNNER', 'ESCROW', 'VENDOR']);
    const [contentOverrides, setContentOverrides] = useState<Record<string, any>>({});

    useEffect(() => {
        // Check for ghost admin mode from localStorage OR Clerk
        const checkAdminStatus = async () => {
            // Method 1: LocalStorage (Command Center unlock)
            const localGhost = localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true';
            console.log('[ADMIN-CONTEXT] LocalStorage check:', localGhost);

            // Method 2: Clerk Role (System login)
            let clerkGod = false;
            try {
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const data = await res.json();
                    console.log('[ADMIN-CONTEXT] /api/users/me response:', data);

                    // API returns { role: 'GOD_MODE' } directly, not { user: { role } }
                    if (data.role === 'GOD_MODE') {
                        clerkGod = true;
                        console.log('[ADMIN-CONTEXT] 🔥 GOD_MODE detected from Clerk!');
                        localStorage.setItem('OMNI_GOD_MODE_UNLOCKED', 'true'); // Sync to localStorage
                    } else {
                        console.log('[ADMIN-CONTEXT] User role:', data.role || 'GUEST');
                    }
                }
            } catch (e) {
                console.error('[ADMIN-CONTEXT] Failed to check Clerk role:', e);
            }

            const hasGodMode = localGhost || clerkGod;
            setIsGhostAdmin(hasGodMode);
            setSuperAccess(hasGodMode);

            if (hasGodMode) {
                console.log('[ADMIN-CONTEXT] ✅ Super Access ENABLED - Ghost Edit available');
            } else {
                console.log('[ADMIN-CONTEXT] ❌ Super Access DISABLED - No Ghost Edit');
            }
        };

        checkAdminStatus();

        // Initial Config Fetch & Polling
        refreshConfig();
        const interval = setInterval(refreshConfig, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    const refreshConfig = async () => {
        try {
            const res = await fetch('/api/system/config');
            const data = await res.json();
            if (data.success) {
                if (Array.isArray(data.activeFeatures)) setActiveFeatures(data.activeFeatures);
                if (data.contentOverride) setContentOverrides(data.contentOverride);
            }
        } catch (e) {
            console.error("Config sync failed", e);
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
        <AdminContext.Provider value={{ isGhostAdmin, superAccess, activeFeatures, contentOverrides, isFeatureEnabled, ghostEditMode, toggleGhostEdit, setGhostAdmin, refreshConfig }}>
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
