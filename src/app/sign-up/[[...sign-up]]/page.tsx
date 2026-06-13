import { SignUp } from "@clerk/nextjs";
import { LaHustleLogo } from "@/components/ui/LaHustleLogo";
import { ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";

export default function SignUpPage() {
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
            {/* Left: Premium Branding & Bento Features */}
            <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-12 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                {/* Logo Section */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <LaHustleLogo size="lg" className="brightness-200" />
                    </div>
                </div>

                {/* Center Content: Premium Title & Bento Grid */}
                <div className="relative z-10 max-w-xl my-auto py-12">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-tight">
                        Join the <br />
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Campus Revolution.</span>
                    </h2>
                    <p className="text-lg text-white/75 font-medium leading-relaxed mb-8">
                        Create your account today. Buy, sell, and connect with verified students on your campus.
                    </p>

                    {/* Bento Grid Features */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-1">Buy & Sell Instantly</h4>
                                <p className="text-sm text-white/60">Discover hundreds of listings from verified students on your campus.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-1">Secure Peer Verification</h4>
                                <p className="text-sm text-white/60">All profiles are verified using student credentials to ensure total campus trust.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-1">Exclusive Student Gigs</h4>
                                <p className="text-sm text-white/60">Access campus-only side hustles, skill exchanges, and micro-jobs.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="relative z-10 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <span>© 2026 LaHustle Inc.</span>
                    <span>•</span>
                    <span>Secure & Encrypted</span>
                </div>
            </div>

            {/* Right: Clerk Component */}
            <div className="flex items-center justify-center p-8 pt-32 md:p-8 bg-background relative overflow-y-auto">
                {/* Mobile Top Border Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 md:hidden"></div>

                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                'bg-primary hover:bg-primary/90 text-primary-foreground normal-case text-sm font-bold rounded-2xl py-3 shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer',
                            card: 'bg-card border border-surface-border shadow-2xl rounded-3xl p-8 z-10 max-w-[440px] w-full',
                            headerTitle: 'text-2xl font-black uppercase tracking-tight text-foreground',
                            headerSubtitle: 'text-muted-foreground font-medium text-sm',
                            socialButtonsBlockButton:
                                'bg-card hover:bg-muted border border-surface-border text-foreground rounded-2xl py-2.5 font-bold transition-all duration-200 cursor-pointer',
                            dividerLine: 'bg-surface-border',
                            dividerText: 'text-muted-foreground/60 font-bold uppercase text-[9px] tracking-widest',
                            formFieldLabel: 'text-muted-foreground font-bold uppercase text-[9px] tracking-widest mb-1.5',
                            formFieldInput:
                                'bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm',
                            footerActionLink: 'text-primary font-bold hover:text-primary/80 transition-colors',
                            footerActionText: 'text-muted-foreground font-medium',
                            identityPreviewEditButton: 'text-primary font-bold',
                            formFieldAction: 'text-primary font-bold hover:text-primary/80 transition-colors'
                        },
                        variables: {
                            colorPrimary: '#059669', // Forest Emerald matching Light theme
                            colorText: 'inherit',
                            colorBackground: 'inherit',
                            fontFamily: 'inherit',
                            borderRadius: '1rem',
                        }
                    }}
                    forceRedirectUrl="/verify"
                />
            </div>
        </div>
    );
}
