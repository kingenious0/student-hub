'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { toast } from 'sonner';
import GoBack from '@/components/navigation/GoBack';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShoppingBag, 
  Landmark, 
  Zap, 
  BarChart3, 
  Store, 
  ArrowRight,
  Sparkles,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';

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
                modal.alert('✅ Application Submitted! Your vendor account is now active. Welcome to the LaHustle marketplace.', 'Onboarding Success', 'success');
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

    const openApplicationForm = async () => {
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
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-24">
            {/* Ambient background glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

            {/* Sticky GoBack header */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
                <GoBack fallback="/" className="hover:text-primary transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2" />
            </div>

            {/* Premium Hero Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-20">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    {/* Left Details */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            <span>LaHustle Vendor Hub</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.95] text-foreground">
                          Launch Your <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-400 italic">Campus Empire</span>
                        </h1>

                        <p className="text-lg md:text-xl text-foreground/60 font-medium leading-relaxed max-w-2xl">
                            Turn your skill, food service, or products into a verified business. Reach thousands of university students directly with zero entry fees.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                                <span className="text-sm font-bold text-foreground/80">No Listing Fees</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                                <span className="text-sm font-bold text-foreground/80">Smart Escrow Protection</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                                <span className="text-sm font-bold text-foreground/80">Hotspot Delivery Network</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                                <span className="text-sm font-bold text-foreground/80">Built-in Kitchen Display System</span>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={openApplicationForm}
                                className="h-16 px-10 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                            >
                                <span>Create Your Shop</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <Link 
                                href="/marketplace"
                                className="h-16 px-10 border border-surface-border bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all"
                            >
                                Explore Marketplace
                            </Link>
                        </div>
                    </div>

                    {/* Right Bento Card Preview */}
                    <div className="lg:col-span-5 relative">
                        <div className="p-1 bg-gradient-to-br from-surface to-background border border-surface-border rounded-[2.5rem] shadow-2xl relative">
                            <div className="absolute -top-6 -right-6 w-16 h-16 bg-primary/15 blur-xl rounded-full" />
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest bg-[#39FF14]/10 border border-[#39FF14]/20 px-3 py-1 rounded-full">Active Hub</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase text-foreground">Kumasi Campus</h3>
                                    <p className="text-xs text-foreground/50 font-bold uppercase tracking-wider">Join active student vendors across university hotspots</p>
                                </div>
                                <div className="border-t border-dashed border-surface-border pt-6 grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-foreground/5 rounded-2xl border border-surface-border">
                                        <div className="text-2xl font-black text-primary">500+</div>
                                        <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block mt-1">Vendors</span>
                                    </div>
                                    <div className="p-4 bg-foreground/5 rounded-2xl border border-surface-border">
                                        <div className="text-2xl font-black text-primary">10K+</div>
                                        <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block mt-1">Daily Traffic</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-surface-border">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Process</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground">Simple 4-Step Launch</h2>
                    <p className="text-sm text-foreground/50 font-bold uppercase tracking-wider">No paperwork, no complex setup. Go live in minutes.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StepItem 
                        num="01" 
                        title="Submit Shop Info" 
                        description="Enter shop details, phone, and target delivery hotspots." 
                    />
                    <StepItem 
                        num="02" 
                        title="Instant Approval" 
                        description="System validates your student vendor role instantly." 
                    />
                    <StepItem 
                        num="03" 
                        title="List Inventory" 
                        description="Upload your product photos, pricing, and custom modifiers." 
                    />
                    <StepItem 
                        num="04" 
                        title="Escrow Selling" 
                        description="Receive secure payments, deliver to hotspot, scan QR code, get paid." 
                    />
                </div>
            </div>

            {/* Benefits Bento Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-surface-border">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Advantages</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground">Built for Campus Commerce</h2>
                    <p className="text-sm text-foreground/50 font-bold uppercase tracking-wider">Everything you need to orchestrate student orders</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <BenefitCard 
                        icon={<Zap className="w-6 h-6" />} 
                        title="Zero Entry Fees" 
                        description="No setup fees, monthly subscriptions, or listing commissions. Keep 100% of your listed product earnings." 
                    />
                    <BenefitCard 
                        icon={<ShieldCheck className="w-6 h-6" />} 
                        title="Escrow Guarantee" 
                        description="Protects both student and vendor. Funds are locked securely inside escrow logs and released upon physical confirmation." 
                    />
                    <BenefitCard 
                        icon={<ShoppingBag className="w-6 h-6" />} 
                        title="Kitchen Display (KDS)" 
                        description="Accept, track, and manage orders with real-time audio notifications. Mark ready for dispatch in one tap." 
                    />
                    <BenefitCard 
                        icon={<BarChart3 className="w-6 h-6" />} 
                        title="Business Analytics" 
                        description="Access intuitive graphs displaying views, sales count, conversion rates, and wallet earnings directly in your dashboard." 
                    />
                </div>
            </div>

            {/* Call To Action Block */}
            <div className="max-w-5xl mx-auto px-4 mt-12">
                <div className="p-1 bg-gradient-to-br from-surface to-background border border-surface-border rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
                    <div className="p-12 md:p-20 space-y-8 relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground leading-none">
                            Ready to Claim Your <br />
                            <span className="text-primary italic">Campus Spot?</span>
                        </h2>
                        <p className="text-base md:text-lg text-foreground/60 font-medium max-w-xl mx-auto leading-relaxed">
                            Join university students who are actively monetizing their skills and products on LaHustle today.
                        </p>
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={openApplicationForm}
                                className="h-16 px-12 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                Apply Now - It's Free
                            </button>
                            <p className="text-xs text-foreground/40">
                                Already registered? <Link href="/dashboard/vendor" className="text-primary hover:underline font-bold">Go to Dashboard →</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Form Overlay Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface border border-surface-border rounded-3xl max-w-xl w-full my-8 overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-surface-border bg-foreground/5 relative">
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Vendor Registration</h2>
                                <p className="text-xs text-foreground/50 font-bold uppercase tracking-wider mt-1">Set up your campus retail profile</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Shop Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                                        Shop Name *
                                    </label>
                                    <div className="relative">
                                        <Store className="w-4 h-4 text-foreground/30 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                            placeholder="e.g. Mummy's Kitchen"
                                            className="w-full pl-12 pr-4 py-4 bg-background border border-surface-border rounded-2xl text-base font-bold outline-none ring-2 ring-transparent focus:ring-primary focus:border-primary transition-all text-foreground"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Shop Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                                        What do you offer? *
                                    </label>
                                    <div className="relative">
                                        <FileText className="w-4 h-4 text-foreground/30 absolute left-4 top-5" />
                                        <textarea
                                            value={formData.shopDescription}
                                            onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                                            placeholder="e.g. Hot Jollof Rice, graphic design assets, or styling services."
                                            className="w-full pl-12 pr-4 py-4 bg-background border border-surface-border rounded-2xl text-base font-bold outline-none ring-2 ring-transparent focus:ring-primary focus:border-primary transition-all text-foreground h-28 resize-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                                        Campus Location / Hotspot *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 text-foreground/30 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. Near Unity Hall, Main Gate"
                                            className="w-full pl-12 pr-4 py-4 bg-background border border-surface-border rounded-2xl text-base font-bold outline-none ring-2 ring-transparent focus:ring-primary focus:border-primary transition-all text-foreground"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                                        Active WhatsApp / Call Contact *
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-foreground/30 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            placeholder="e.g. 054 XXXXXXX"
                                            className="w-full pl-12 pr-4 py-4 bg-background border border-surface-border rounded-2xl text-base font-bold outline-none ring-2 ring-transparent focus:ring-primary focus:border-primary transition-all text-foreground"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 h-14 rounded-xl bg-foreground/5 font-black text-xs uppercase hover:bg-foreground/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 h-14 bg-primary text-black rounded-xl font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Submitting...' : 'Register Profile'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Sub-components for Dynamic Experience
function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, borderColor: 'var(--primary)' }}
      className="bg-surface border border-surface-border rounded-3xl p-8 transition-colors group"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3 text-foreground uppercase tracking-tight">{title}</h3>
      <p className="text-foreground/50 font-bold uppercase tracking-wider text-xs leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StepItem({ num, title, description }: { num: string; title: string; description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="p-6 bg-surface border border-surface-border rounded-3xl group"
    >
      <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-xs mb-6 group-hover:rotate-12 transition-transform duration-500">
        {num}
      </div>
      <h3 className="font-black text-lg mb-2 tracking-tight uppercase text-foreground">{title}</h3>
      <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest leading-relaxed">{description}</p>
    </motion.div>
  );
}
