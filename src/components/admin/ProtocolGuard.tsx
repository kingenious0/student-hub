'use client';

import { useAdmin } from '@/context/AdminContext';
import { ReactNode, useEffect, useState } from 'react';
import FeatureDisabled from './FeatureDisabled';

interface ProtocolGuardProps {
    protocol: 'MARKET' | 'PULSE' | 'ESCROW' | 'VENDOR' | 'MARKET_ACTIONS';
    children: ReactNode;
    fallback?: ReactNode;
}

export default function ProtocolGuard({ protocol, children, fallback }: ProtocolGuardProps) {
    const { isGhostAdmin } = useAdmin();
    const [isEnabled, setIsEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Admin always has access
        if (isGhostAdmin) {
            setIsEnabled(true);
            setLoading(false);
            return;
        }

        // Check if protocol is enabled
        fetch('/api/system/config')
            .then(res => res.json())
            .then(data => {
                // GLOBAL KILL SWITCH CHECK
                if (data.maintenanceMode) {
                    setIsEnabled(false);
                } else {
                    const enabled = data.activeFeatures?.includes(protocol) ?? true;
                    setIsEnabled(enabled);
                }
                setLoading(false);
            })
            .catch(() => {
                // On error, default to enabled (Fail Safe)
                setIsEnabled(true);
                setLoading(false);
            });
    }, [protocol, isGhostAdmin]);

    // Show loading state briefly
    if (loading) {
        return null;
    }

    // If disabled and not admin, show fallback
    if (!isEnabled && !isGhostAdmin) {
        return fallback || <FeatureDisabled feature={getFeatureName(protocol)} />;
    }

    return <>{children}</>;
}

function getFeatureName(protocol: string): string {
    const names: Record<string, string> = {
        'MARKET': 'Marketplace',
        'PULSE': 'Campus Pulse',

        'ESCROW': 'Escrow',
        'VENDOR': 'Vendor Terminal',
        'MARKET_ACTIONS': 'Trading System'
    };
    return names[protocol] || protocol;
}
