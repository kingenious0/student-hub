import { SignUp } from "@clerk/nextjs";
import { ZapIcon } from "@/components/ui/Icons";

export default function SignUpPage() {
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left: Premium Branding */}
            <div className="hidden md:flex flex-col justify-between bg-black text-white p-12 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <ZapIcon className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl font-black tracking-tighter">OMNI</h1>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
                        Join the <br />
                        <span className="text-primary">Campus Revolution.</span>
                    </h2>
                    <p className="text-xl text-white/60 font-medium leading-relaxed">
                        Create your account today. Buy, sell, and connect with verified students on your campus.
                    </p>
                </div>

                <div className="relative z-10 flex gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
                    <span>© 2026 OMNI Inc.</span>
                    <span>•</span>
                    <span>Secure & Encrypted</span>
                </div>
            </div>

            {/* Right: Clerk Component */}
            <div className="flex items-center justify-center p-8 pt-32 md:p-8 bg-gray-50 dark:bg-background relative">
                {/* Light Mode Premium Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:hidden"></div>
                
                {/* Mobile Background Blob */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-primary md:hidden"></div>

                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                'bg-primary hover:bg-primary/90 text-primary-foreground normal-case text-sm font-bold rounded-xl py-3 shadow-lg hover:shadow-primary/20 transition-all',
                            card: 'bg-white dark:bg-surface border border-gray-200 dark:border-surface-border shadow-2xl dark:shadow-none rounded-3xl p-8 z-10',
                            headerTitle: 'text-2xl font-black uppercase tracking-tight text-foreground',
                            headerSubtitle: 'text-foreground/60 font-medium',
                            socialButtonsBlockButton:
                                'bg-gray-50 dark:bg-surface hover:bg-gray-100 dark:hover:bg-surface-hover border border-gray-200 dark:border-surface-border text-foreground rounded-xl py-2.5 font-bold transition-all',
                            dividerLine: 'bg-gray-200 dark:bg-surface-border',
                            dividerText: 'text-foreground/40 font-bold uppercase text-[10px] tracking-widest',
                            formFieldLabel: 'text-foreground/60 font-bold uppercase text-[10px] tracking-widest mb-1.5',
                            formFieldInput:
                                'bg-white dark:bg-background border border-gray-200 dark:border-surface-border rounded-xl px-4 py-3 text-foreground font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm',
                            footerActionLink: 'text-primary font-bold hover:text-primary/80',
                            footerActionText: 'text-foreground/60 font-medium'
                        },
                        variables: {
                            colorPrimary: '#EAB308', // Yellow-500
                            colorText: 'inherit',
                            colorBackground: 'inherit',
                            fontFamily: 'inherit',
                            borderRadius: '0.75rem',
                        }
                    }}
                    forceRedirectUrl="/verify"
                />
            </div>
        </div>
    );
}
