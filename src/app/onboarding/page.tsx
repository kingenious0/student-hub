'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useModal } from '@/context/ModalContext';
import { LaHustleLogo } from '@/components/ui/LaHustleLogo';
import { toast } from 'sonner';

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const modal = useModal();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            // Pre-fill name from Clerk
            const clerkName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            if (clerkName) {
                setName(clerkName);
            }

            // GOD_MODE bypass
            if (user.publicMetadata?.role === 'GOD_MODE') {
                window.location.href = '/';
                return;
            }

            checkExistingStatus();
        }
    }, [isLoaded, user]);

    const checkExistingStatus = async () => {
        try {
            const res = await fetch('/api/users/me');
            const data = await res.json();

            if (data.role === 'GOD_MODE') {
                window.location.href = '/';
                return;
            }

            if (data.onboarded) {
                // Already onboarded - Proceed to Security Check
                window.location.href = '/security-setup';
            }
        } catch (error) {
            console.error('Status check failed');
        }
    };

    const handleComplete = async () => {
        if (!name) return;

        setLoading(true);
        try {
            const res = await fetch('/api/auth/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phoneNumber }),
            });

            if (res.ok) {
                window.location.href = '/security-setup';
            } else {
                modal.alert('The onboarding protocol failed to initialize. Please verify your data and try again.', 'Handshake Failure', 'error');
            }
        } catch (error) {
            console.error('Onboarding failed:', error);
            modal.alert('A network disturbance prevented the onboarding handshake.', 'Link Error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--primary)/0.03,transparent_50%)] pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 text-center"
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <LaHustleLogo size="xl" showTagline={true} />
                    </div>

                    {/* Header */}
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-3">Welcome to LaHustle</h1>
                        <p className="text-foreground/60 font-bold text-sm">
                            Let's get you started in seconds
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6 bg-surface border-2 border-surface-border rounded-3xl p-8">
                        {/* Name */}
                        <div className="text-left">
                            <label className="text-xs font-black uppercase tracking-widest text-foreground/60 mb-2 block">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-background border-2 border-surface-border rounded-xl p-4 font-bold focus:border-primary outline-none transition-colors"
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="text-left">
                            <label className="text-xs font-black uppercase tracking-widest text-foreground/60 mb-2 block">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full bg-background border-2 border-surface-border rounded-xl p-4 font-bold focus:border-primary outline-none transition-colors"
                                placeholder="e.g. 055 123 4567"
                                required
                            />
                            <p className="text-[10px] text-amber-500 font-bold mt-1.5">
                                ⚠️ Use the same number you used for guest checkout to recover your orders
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleComplete}
                            disabled={!name || !phoneNumber || loading}
                            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${name && phoneNumber && !loading
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105 active:scale-95 shadow-lg'
                                : 'bg-surface-border text-foreground/20 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Setting up...' : 'Start Shopping →'}
                        </button>

                        {/* Info Text */}
                        <p className="text-xs text-foreground/40 text-center mt-4">
                            You can become a vendor later by clicking "Sell on LaHustle"
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
