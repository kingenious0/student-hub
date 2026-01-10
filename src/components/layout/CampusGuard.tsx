'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UNIVERSITY_REGISTRY } from '@/lib/geo/distance';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

export default function CampusGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const [needsSelection, setNeedsSelection] = useState(false);
    const [selectedUni, setSelectedUni] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Skip checks for onboarding and auth pages to allow sequential flow
    const isOnboarding = pathname?.startsWith('/onboarding') || pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

    useEffect(() => {
        if (isLoaded && user && !isOnboarding) {
            // Check if user has university in metadata OR if we need to fetch from DB
            // Ideally, we sync this to metadata. For now, fetch from API check?
            // Or trust metadata if we put it there.
            // Let's assume we fetch profile to be sure.
            checkProfile();
        }
    }, [isLoaded, user, isOnboarding]);

    const checkProfile = async () => {
        try {
            const res = await fetch('/api/users/me');
            const data = await res.json();
            if (data && !data.university) {
                setNeedsSelection(true);
            }
        } catch (e) {
            console.error('Profile check failed', e);
        }
    };

    const handleSave = async () => {
        if (!selectedUni) return;
        setLoading(true);
        try {
            await fetch('/api/users/update-profile', {
                method: 'POST',
                body: JSON.stringify({ university: selectedUni }),
            });
            setNeedsSelection(false);
            window.location.reload(); // Refresh to apply filters
        } catch (e) {
            alert('Failed to save campus');
        } finally {
            setLoading(false);
        }
    };

    if (needsSelection && !isOnboarding) {
        return (
            <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-surface w-full max-w-md rounded-3xl p-8 border border-surface-border shadow-2xl"
                >
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-center text-foreground">
                        🎓 Select Your Campus
                    </h2>
                    <p className="text-center text-foreground/50 text-xs font-bold uppercase tracking-widest mb-8">
                        To see relevant products & runners near you
                    </p>

                    <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto">
                        {Object.values(UNIVERSITY_REGISTRY).map((uni) => (
                            <button
                                key={uni.id}
                                onClick={() => setSelectedUni(uni.id)}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${selectedUni === uni.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-surface-border hover:border-primary/50'
                                    }`}
                            >
                                <span className="font-bold text-sm">{uni.name}</span>
                                {selectedUni === uni.id && <span>✓</span>}
                            </button>
                        ))}
                        {/* Generic/Other Option */}
                        <button
                            onClick={() => setSelectedUni('OTHER')}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${selectedUni === 'OTHER'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-surface-border hover:border-primary/50'
                                }`}
                        >
                            <span className="font-bold text-sm">Other / Not Listed</span>
                            {selectedUni === 'OTHER' && <span>✓</span>}
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!selectedUni || loading}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? 'Setting Campus...' : 'Confirm Campus 🚀'}
                    </button>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
