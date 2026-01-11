'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { StoreIcon, ChevronRightIcon, AlertTriangleIcon } from 'lucide-react';
import { toast } from 'sonner';

const LocationPicker = dynamic(() => import('@/components/location/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-surface border-2 border-surface-border rounded-xl animate-pulse flex items-center justify-center">Loading Map...</div>,
});

export default function BecomeVendorPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        shopName: '',
        shopDesc: '',
        location: null as any
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!formData.shopName || !formData.shopDesc || !formData.location) {
            toast.error("Please complete all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/vendor/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Application Failed');

            toast.success("Application Submitted!");
            router.push('/dashboard/student'); // Or a Success Page
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 pt-24 pb-32 max-w-2xl mx-auto">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-[#39FF14] flex items-center justify-center">
                        <StoreIcon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                            Open Your Shop
                        </h1>
                        <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
                            Join the OMNI Vendor Network
                        </p>
                    </div>
                </div>
            </header>

            <motion.div
                layout
                className="space-y-6"
            >
                {/* Step 1: Identity */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="p-6 bg-surface border border-surface-border rounded-3xl">
                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-foreground/70">
                                Business Identity
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Campus Burgers, Tech Haven..."
                                value={formData.shopName}
                                onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                                className="w-full bg-background border border-surface-border rounded-xl p-4 text-lg font-bold outline-none focus:border-primary transition-colors mb-4"
                            />

                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-foreground/70">
                                Your Pitch (The "Why")
                            </label>
                            <textarea
                                placeholder="Tell us about your products and why students will love them..."
                                value={formData.shopDesc}
                                onChange={e => setFormData({ ...formData, shopDesc: e.target.value })}
                                className="w-full bg-background border border-surface-border rounded-xl p-4 min-h-[120px] outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex gap-4 items-start">
                            <AlertTriangleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-black text-yellow-500 uppercase tracking-wide mb-1">
                                    Important Notice
                                </h3>
                                <p className="text-xs text-foreground/70 leading-relaxed">
                                    If accepted, your account will be upgraded to <strong>Vendor Status</strong>.
                                    If you are currently a Runner, your Runner access will be deactivated, but your wallet balance will be safely transferred.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (formData.shopName && formData.shopDesc) setStep(2);
                                else toast.error("Please fill in details");
                            }}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            Next Step <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="p-6 bg-surface border border-surface-border rounded-3xl">
                            <label className="block text-xs font-black uppercase tracking-widest mb-3 text-foreground/70">
                                Shop Location
                            </label>
                            <p className="text-xs text-foreground/50 mb-4">
                                Pin your exact location on campus. This helps students find you via the map.
                            </p>

                            <div className="h-[400px] rounded-xl overflow-hidden border border-surface-border relative z-0">
                                <LocationPicker
                                    onLocationSelect={(loc) => setFormData({ ...formData, location: loc })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-4 bg-surface text-foreground rounded-2xl font-black uppercase tracking-widest"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.location}
                                className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
