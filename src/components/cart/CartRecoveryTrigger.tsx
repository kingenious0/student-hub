'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useCartStore } from '@/lib/store/cart';

const RECOVERY_INTERVALS = [
    { step: 1, delay: 30 * 60 * 1000 },    // 30 minutes
    { step: 2, delay: 6 * 60 * 60 * 1000 }, // 6 hours
    { step: 3, delay: 24 * 60 * 60 * 1000 }, // 24 hours
];

export default function CartRecoveryTrigger() {
    const { user, isSignedIn } = useUser();
    const items = useCartStore((s) => s.items);
    const lastActivityAt = useCartStore((s) => s.lastActivityAt);
    const recoveryStep = useCartStore((s) => s.recoveryStep);
    const lastRecoverySentAt = useCartStore((s) => s.lastRecoverySentAt);
    const markRecoverySent = useCartStore((s) => s.markRecoverySent);
    const checkedRef = useRef(false);

    useEffect(() => {
        if (!isSignedIn || !user || items.length === 0 || !lastActivityAt) return;
        if (checkedRef.current) return;

        checkedRef.current = true;

        const now = Date.now();
        const elapsed = now - lastActivityAt;

        for (const interval of RECOVERY_INTERVALS) {
            const { step, delay } = interval;

            if (recoveryStep >= step) continue;
            if (elapsed < delay) continue;

            if (lastRecoverySentAt && (now - lastRecoverySentAt) < 60 * 60 * 1000) continue;

            fetch('/api/cart/recovery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: step - 1 }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        markRecoverySent(step);
                    }
                })
                .catch(() => {});
            break;
        }
    }, [isSignedIn, user, items, lastActivityAt, recoveryStep, lastRecoverySentAt, markRecoverySent]);

    return null;
}
