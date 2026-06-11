import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowLeft, Radio, Database } from 'lucide-react';

export default async function SignalIntelligencePage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    // Check admin
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user?.role !== 'ADMIN' && user?.role !== 'GOD_MODE') {
        redirect('/');
    }

    const signals = await prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto pt-20 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
                        </Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                            <Radio className="w-10 h-10 text-[#39FF14]" /> Signal Intelligence
                        </h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">
                            INTERCEPTING TESTER TRANSMISSIONS
                        </p>
                    </div>
                    <div className="bg-surface border border-surface-border rounded-2xl px-5 py-2.5 flex items-center gap-2 relative overflow-hidden self-start md:self-auto">
                        <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{signals.length} Signals Intercepted</span>
                    </div>
                </div>

                {/* Signals Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {signals.map(signal => (
                        <div 
                            key={signal.id} 
                            className="bg-surface border border-surface-border p-6 rounded-[2.5rem] relative overflow-hidden group shadow-xl flex flex-col justify-between"
                        >
                            {/* Brand Line */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#39FF14] to-[#14532d]" />
                            {/* Dotted border overlay simulating receipt paper */}
                            <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h3 className="font-black text-foreground text-base uppercase tracking-tight">{signal.userName}</h3>
                                        <p className="text-[9px] text-foreground/45 font-mono font-bold uppercase tracking-wider mt-0.5">
                                            ID: {signal.id.slice(-6).toUpperCase()} • {new Date(signal.createdAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border shrink-0",
                                        signal.status === 'OPEN' 
                                            ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                    )}>
                                        {signal.status}
                                    </span>
                                </div>

                                <div className="bg-foreground/[0.02] border border-surface-border rounded-2xl p-4 text-xs font-bold text-foreground/80 leading-relaxed font-mono">
                                    {signal.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {signals.length === 0 && (
                        <div className="col-span-full py-24 text-center text-foreground/40 border border-dashed border-surface-border rounded-[2.5rem] space-y-4">
                            <Database className="w-12 h-12 mx-auto opacity-35" />
                            <p className="uppercase tracking-widest text-[10px] font-black">No signals currently intercepted.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Ensure dynamic rendering to see new feedbacks instantly
export const dynamic = 'force-dynamic';
