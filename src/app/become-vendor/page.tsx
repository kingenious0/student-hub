'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function BecomeVendorPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
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
                alert('✅ Application Submitted!\n\nYour vendor application has been received. We\'ll review it and get back to you within 24 hours.');
                router.push('/marketplace');
            } else {
                const error = await res.json();
                alert(`❌ ${error.error || 'Failed to submit application'}`);
            }
        } catch (error) {
            console.error('Application failed:', error);
            alert('❌ Something went wrong. Please try again.');
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

    if (!user) {
        router.push('/sign-in');
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
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
                                onClick={() => setShowForm(true)}
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
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                                1️⃣
                            </div>
                            <h3 className="font-black text-lg mb-2">Create Your Shop</h3>
                            <p className="text-sm text-foreground/60">Fill out a simple application form</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                                2️⃣
                            </div>
                            <h3 className="font-black text-lg mb-2">Get Approved</h3>
                            <p className="text-sm text-foreground/60">We review within 24 hours</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                                3️⃣
                            </div>
                            <h3 className="font-black text-lg mb-2">Add Products</h3>
                            <p className="text-sm text-foreground/60">Upload your items with photos</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                                4️⃣
                            </div>
                            <h3 className="font-black text-lg mb-2">Start Earning</h3>
                            <p className="text-sm text-foreground/60">Get paid securely via escrow</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="bg-surface py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-center mb-16">
                        Why Sell on Omni?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-background border-2 border-surface-border rounded-3xl p-8">
                            <div className="text-5xl mb-4">💰</div>
                            <h3 className="text-2xl font-black mb-3">Zero Fees</h3>
                            <p className="text-foreground/60">
                                No listing fees, no commission. Keep 100% of your earnings after escrow release.
                            </p>
                        </div>
                        <div className="bg-background border-2 border-surface-border rounded-3xl p-8">
                            <div className="text-5xl mb-4">🔒</div>
                            <h3 className="text-2xl font-black mb-3">Secure Payments</h3>
                            <p className="text-foreground/60">
                                All payments held in escrow until delivery is confirmed. Your money is safe.
                            </p>
                        </div>
                        <div className="bg-background border-2 border-surface-border rounded-3xl p-8">
                            <div className="text-5xl mb-4">🚀</div>
                            <h3 className="text-2xl font-black mb-3">Fast Delivery</h3>
                            <p className="text-foreground/60">
                                Our campus runner network delivers within 15-30 minutes. Happy customers!
                            </p>
                        </div>
                        <div className="bg-background border-2 border-surface-border rounded-3xl p-8">
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-2xl font-black mb-3">Vendor Dashboard</h3>
                            <p className="text-foreground/60">
                                Professional tools to manage products, orders, and track your earnings.
                            </p>
                        </div>
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
                        onClick={() => setShowForm(true)}
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
