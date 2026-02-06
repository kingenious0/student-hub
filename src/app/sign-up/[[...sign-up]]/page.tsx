'use client';

import { useEffect, useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { CheckCircleIcon, PackageIcon, ZapIcon } from "@/components/ui/Icons";

const features = [
    { icon: '🛒', title: 'Buy Like Jumia', description: 'Shop verified campus products with fast delivery and great prices.' },
    { icon: '🏪', title: 'Become a Seller', description: 'List your items and sell to students on your campus in minutes.' },
    { icon: '⚡', title: 'Lightning Fast', description: 'Get orders delivered within 15–30 minutes across campus.' },
    { icon: '🔒', title: 'Secure Payments', description: 'Escrow protection and bank-grade encryption on every order.' }
];

const stats = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Campus Vendors' },
    { value: '50K+', label: 'Orders Delivered' },
    { value: '4.9★', label: 'User Rating' }
];

const testimonials = [
    {
        name: 'Kwame A.',
        role: 'Engineering Student',
        university: 'KNUST',
        quote: 'Best thing that happened to campus life! Got my laptop charger delivered in 10 minutes.',
        avatar: '👨🏿‍🎓'
    },
    {
        name: 'Ama K.',
        role: 'Medical Student',
        university: 'UG',
        quote: 'Started selling snacks and made ₵2000 in my first week. OMNI changed my life!',
        avatar: '👩🏿‍⚕️'
    },
    {
        name: 'Kofi M.',
        role: 'Business Student',
        university: 'GIMPA',
        quote: 'I buy like Jumia and also sell gadgets to classmates. Easy money, fast delivery.',
        avatar: '👨🏿‍💼'
    }
];

export default function SignUpPage() {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-black via-gray-900 to-black text-white p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#39FF14]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <ZapIcon className="w-8 h-8 text-[#39FF14]" />
                        <h1 className="text-2xl font-black tracking-tighter">OMNI</h1>
                    </div>
                    <div className="flex gap-3">
                        <span className="px-3 py-1 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full text-[10px] font-black uppercase tracking-wider text-[#39FF14]">
                            🛒 Buy Like Jumia
                        </span>
                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-400">
                            🏪 Become a Seller
                        </span>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
                            Buy & Sell on <br />
                            <span className="text-[#39FF14]">Campus.</span>
                        </h2>
                        <p className="text-xl text-white/60 font-medium leading-relaxed max-w-lg">
                            Shop like Jumia or become a seller. List your items, reach students instantly, and earn more.
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="text-2xl font-black text-[#39FF14]">{stat.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-2 hover:bg-white/10 transition-all">
                                <div className="text-3xl">{feature.icon}</div>
                                <div className="font-black text-sm">{feature.title}</div>
                                <div className="text-xs text-white/60 leading-relaxed">{feature.description}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">{testimonials[currentTestimonial].avatar}</div>
                            <div>
                                <div className="font-black text-sm">{testimonials[currentTestimonial].name}</div>
                                <div className="text-xs text-white/60">{testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].university}</div>
                            </div>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed italic">
                            "{testimonials[currentTestimonial].quote}"
                        </p>
                        <div className="flex gap-1.5">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentTestimonial(idx)}
                                    className={`h-1.5 rounded-full transition-all ${
                                        idx === currentTestimonial ? 'w-8 bg-[#39FF14]' : 'w-1.5 bg-white/20'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
                        <span>© 2026 OMNI Inc.</span>
                        <span>•</span>
                        <span>Student First</span>
                    </div>
                    <div className="flex gap-2">
                        <a href="/privacy" className="text-xs text-white/40 hover:text-white/60 transition-colors">Privacy</a>
                        <span className="text-white/40">•</span>
                        <a href="/terms" className="text-xs text-white/40 hover:text-white/60 transition-colors">Terms</a>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center p-8 pt-32 lg:p-12 bg-gray-50 dark:bg-background relative overflow-y-auto">
                {/* Light Mode Premium Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:hidden"></div>

                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#39FF14] via-blue-500 to-[#39FF14] lg:hidden"></div>

                <div className="absolute top-8 left-8 lg:hidden">
                    <div className="flex items-center gap-2">
                        <ZapIcon className="w-6 h-6 text-[#39FF14]" />
                        <h1 className="text-xl font-black tracking-tighter">OMNI</h1>
                    </div>
                </div>

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="lg:hidden space-y-4">
                        <h2 className="text-3xl font-black uppercase tracking-tight">
                            Buy or Sell on <span className="text-[#39FF14]">OMNI</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {features.slice(0, 2).map((feature, idx) => (
                                <div key={idx} className="bg-white dark:bg-surface border border-gray-200 dark:border-surface-border rounded-2xl p-4 space-y-2 shadow-sm dark:shadow-none">
                                    <div className="text-2xl">{feature.icon}</div>
                                    <div className="font-black text-xs">{feature.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SignUp
                        appearance={{
                            elements: {
                                formButtonPrimary:
                                    'bg-[#39FF14] hover:bg-[#32e612] text-black normal-case text-sm font-bold rounded-xl py-3 shadow-lg hover:shadow-[#39FF14]/20 transition-all active:scale-95',
                                card: 'bg-white dark:bg-surface border border-gray-200 dark:border-surface-border shadow-2xl rounded-3xl p-8',
                                headerTitle: 'text-2xl font-black uppercase tracking-tight text-foreground',
                                headerSubtitle: 'text-foreground/60 font-medium mt-2',
                                socialButtonsBlockButton:
                                    'bg-gray-50 dark:bg-surface hover:bg-gray-100 dark:hover:bg-surface-hover border border-gray-200 dark:border-surface-border text-foreground rounded-xl py-2.5 font-bold transition-all hover:border-[#39FF14]/50',
                                socialButtonsBlockButtonText: 'font-bold',
                                dividerLine: 'bg-gray-200 dark:bg-surface-border',
                                dividerText: 'text-foreground/40 font-bold uppercase text-[10px] tracking-widest',
                                formFieldLabel: 'text-foreground/60 font-bold uppercase text-[10px] tracking-widest mb-1.5',
                                formFieldInput:
                                    'bg-white dark:bg-background border border-gray-200 dark:border-surface-border rounded-xl px-4 py-3 text-foreground font-medium focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 transition-all shadow-sm',
                                footerActionLink: 'text-[#39FF14] font-bold hover:text-[#32e612] transition-colors',
                                footerActionText: 'text-foreground/60 font-medium',
                                formFieldErrorText: 'text-red-500 text-xs font-bold mt-1',
                                identityPreviewText: 'font-bold',
                                formResendCodeLink: 'text-[#39FF14] font-bold hover:text-[#32e612]',
                                identityPreviewEditButton: 'text-[#39FF14] font-bold hover:text-[#32e612]',
                                formFieldSuccessText: 'text-[#39FF14] text-xs font-bold mt-1',
                                otpCodeFieldInput: 'border-surface-border focus:border-[#39FF14]'
                            },
                            variables: {
                                colorPrimary: '#39FF14',
                                fontFamily: 'inherit',
                                borderRadius: '0.75rem'
                            }
                        }}
                        routing="path"
                        path="/sign-up"
                        signInUrl="/sign-in"
                        forceRedirectUrl="/verify"
                    />

                    <div className="flex items-center justify-center gap-6 pt-4">
                        <div className="flex items-center gap-2">
                            <PackageIcon className="w-4 h-4 text-[#39FF14]" />
                            <span className="text-xs font-bold text-foreground/60">Buyer & Seller</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-[#39FF14]" />
                            <span className="text-xs font-bold text-foreground/60">Secure Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
