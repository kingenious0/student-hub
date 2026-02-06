'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { toast } from 'sonner';
import GoBack from '@/components/navigation/GoBack';
import { motion, AnimatePresence } from 'framer-motion';

export default function BecomeVendorPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const modal = useModal();
    const clerk = useClerk();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shopName: '',
        shopDescription: '',
        location: '',
        phoneNumber: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/vendor/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                modal.alert('✅ Application Submitted! Your vendor account is now active. Welcome to the OMNI marketplace.', 'Onboarding Success', 'success');
                router.push('/dashboard/vendor');
            } else {
                const error = await res.json();
                modal.alert(error.error || 'Failed to submit application', 'Application Error', 'error');
            }
        } catch (error) {
            console.error('Application failed:', error);
            modal.alert('System connection lost during submission.', 'Network Error', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white pt-24 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <GoBack fallback="/" className="text-white/80 hover:text-white" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left: Text */}
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
                                Start Selling on Omni
                            </h1>
                            <p className="text-2xl font-bold mb-8 text-white/90">
                                Reach 10,000+ Students on Your Campus Daily
                            </p>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center gap-3 text-lg font-bold">
                                    <span className="text-3xl">✓</span>
                                    <span>Zero listing fees</span>
                                </li>
                                <li className="flex items-center gap-3 text-lg font-bold">
                                    <span className="text-3xl">✓</span>
                                    <span>Secure escrow payments</span>
                                </li>
                                <li className="flex items-center gap-3 text-lg font-bold">
                                    <span className="text-3xl">✓</span>
                                    <span>Fast campus delivery network</span>
                                </li>
                                <li className="flex items-center gap-3 text-lg font-bold">
                                    <span className="text-3xl">✓</span>
                                    <span>24/7 vendor support</span>
                                </li>
                            </ul>
                            <button
                                onClick={async () => {
                                    if (!user) {
                                        const confirmed = await modal.confirm(
                                            "You must be signed in to apply as a vendor. Join the marketplace to start selling.",
                                            "Authentication Required",
                                            false
                                        );
                                        if (confirmed) {
                                            clerk.redirectToSignIn({ redirectUrl: '/become-vendor' });
                                        }
                                        return;
                                    }
                                    setShowForm(true);
                                }}
                                className="px-10 py-5 bg-white text-orange-600 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-2xl"
                            >
                                Start Selling Now →
                            </button>
                        </div>

                        {/* Right: Image */}
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/20">
                                <div className="text-9xl text-center mb-4">🏪</div>
                                <p className="text-center text-sm font-bold text-white/80">
                                    Join 500+ Active Vendors
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-surface border-y border-surface-border py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-black text-primary mb-2">500+</div>
                            <div className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Active Vendors</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-primary mb-2">10K+</div>
                            <div className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Daily Students</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-primary mb-2">₵50K+</div>
                            <div className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Daily Sales</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-center mb-16">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <StepItem num="1️⃣" title="Create Your Shop" description="Fill out a simple application form" delay={0.1} />
                        <StepItem num="2️⃣" title="Get Approved" description="We review within 24 hours" delay={0.2} />
                        <StepItem num="3️⃣" title="Add Products" description="Upload your items with photos" delay={0.3} />
                        <StepItem num="4️⃣" title="Start Earning" description="Get paid securely via escrow" delay={0.4} />
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="bg-surface py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-black uppercase tracking-tighter text-center mb-16"
                    >
                        Why Sell on <span className="text-primary italic">Omni?</span>
                    </motion.h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <BenefitCard 
                            icon="💰" 
                            title="Zero Fees" 
                            description="No listing fees, no commission. Keep 100% of your earnings after escrow release." 
                        />
                        <BenefitCard 
                            icon="🔒" 
                            title="Secure Payments" 
                            description="All payments held in escrow until delivery is confirmed. Your money is safe." 
                        />
                        <BenefitCard 
                            icon="🚀" 
                            title="Fast Delivery" 
                            description="Our campus runner network delivers within 15-30 minutes. Happy customers!" 
                        />
                        <BenefitCard 
                            icon="📊" 
                            title="Vendor Dashboard" 
                            description="Professional tools to manage products, orders, and track your earnings." 
                        />
                    </div>
                </div>
            </div>

            {/* Application Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-background border-2 border-surface-border rounded-3xl max-w-2xl w-full my-8">
                        {/* Header */}
                        <div className="p-8 border-b border-surface-border">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Vendor Application</h2>
                            <p className="text-foreground/60 mt-2">Fill out the form below to get started</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Shop Name */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                    Shop Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.shopName}
                                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                    placeholder="e.g., Mummy's Kitchen"
                                    className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>

                            {/* Shop Description */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                    What do you sell? *
                                </label>
                                <textarea
                                    value={formData.shopDescription}
                                    onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                                    placeholder="e.g., Fresh home-cooked meals, snacks, and drinks"
                                    className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary h-24 resize-none"
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                    Campus Location *
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Near Main Gate, Hostel 7"
                                    className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="e.g., 0244123456"
                                    className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-4 bg-surface-hover text-foreground rounded-xl font-bold text-sm hover:bg-surface-border transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <div className="py-20 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
                        Ready to Start Selling?
                    </h2>
                    <p className="text-xl text-foreground/60 mb-10">
                        Join hundreds of vendors already making money on campus
                    </p>
                    <button
                        onClick={async () => {
                            if (!user) {
                                const confirmed = await modal.confirm(
                                    "You must be signed in to apply as a vendor. Join the marketplace to start selling.",
                                    "Authentication Required",
                                    false
                                );
                                if (confirmed) {
                                    clerk.redirectToSignIn({ redirectUrl: '/become-vendor' });
                                }
                                return;
                            }
                            setShowForm(true);
                        }}
                        className="px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-2xl"
                    >
                        Apply Now - It's Free!
                    </button>
                    <p className="text-sm text-foreground/40 mt-6">
                        Already a vendor? <Link href="/dashboard/vendor" className="text-primary hover:underline font-bold">Go to Dashboard →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Sub-components for Dynamic Experience
function BenefitCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, borderColor: 'var(--primary)' }}
      className="bg-background border-2 border-surface-border rounded-3xl p-8 transition-colors group"
    >
      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="text-2xl font-black mb-3 italic">{title}</h3>
      <p className="text-foreground/50 font-medium leading-relaxed">{description}</p>
    </motion.div>
  )
}

function StepItem({ num, title, description, delay = 0 }: { num: string; title: string; description: string; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="text-center group"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl group-hover:rotate-12 transition-transform duration-500">
          {num}
      </div>
      <h3 className="font-black text-xl mb-2 tracking-tight uppercase">{title}</h3>
      <p className="text-sm text-foreground/50 font-bold uppercase tracking-widest">{description}</p>
    </motion.div>
  )
}
