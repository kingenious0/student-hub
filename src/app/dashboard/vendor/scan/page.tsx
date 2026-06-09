
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VendorUnlockPage() {
    const [releaseKey, setReleaseKey] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');

    const handleVerify = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (releaseKey.length < 6) return;

        setStatus('VERIFYING');
        try {
            const res = await fetch('/api/orders/verify-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ releaseKey: releaseKey.replace('-', '') }),
            });
            const data = await res.json();

            if (data.success) {
                setStatus('SUCCESS');
                setMessage(data.message);
                setReleaseKey('');
            } else {
                setStatus('ERROR');
                setMessage(data.error || 'Invalid Release Key');
            }
        } catch (error) {
            setStatus('ERROR');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 transition-colors duration-300">
            <div className="max-w-xl mx-auto px-4">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/dashboard/vendor" className="p-3 bg-surface border border-surface-border rounded-2xl hover:bg-foreground/5 transition-all">
                        ⬅️
                    </Link>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Escrow Unlock</h1>
                </div>

                <div className="bg-surface border border-surface-border rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl">
                    {status === 'IDLE' && (
                        <div className="text-center py-8">
                            <div className="text-7xl mb-6">🛡️</div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight text-foreground">LaHustle Secure-Key</h2>
                            <p className="text-foreground/40 mb-8 max-w-sm mx-auto font-black uppercase tracking-widest text-[10px]">
                                Ask the student for their 6-digit Release Key to unlock your payment.
                            </p>

                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        value={releaseKey}
                                        onChange={(e) => setReleaseKey(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full bg-background border-2 border-surface-border rounded-2xl py-6 text-center text-5xl font-black tracking-[0.3em] text-foreground focus:border-primary outline-none transition-all placeholder:text-foreground/5 group-hover:border-surface-border"
                                        autoFocus
                                    />
                                    {releaseKey.length === 6 && (
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                                            READY TO UNLOCK
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={releaseKey.length < 6}
                                    className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-lg lh-glow hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all uppercase tracking-widest"
                                >
                                    VERIFY & RELEASE 🔓
                                </button>
                            </form>
                        </div>
                    )}

                    {(status === 'VERIFYING' || status === 'SUCCESS' || status === 'ERROR') && (
                        <div className="text-center py-12">
                            {status === 'VERIFYING' && (
                                <>
                                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Unlocking Shield...</h2>
                                    <p className="text-foreground/40 mt-2 font-black uppercase tracking-widest text-[10px]">Checking with LaHustle Central</p>
                                </>
                            )}

                            {status === 'SUCCESS' && (
                                <>
                                    <div className="text-8xl mb-6 animate-bounce">💰</div>
                                    <h2 className="text-3xl font-black text-green-400 mb-4 uppercase tracking-tighter">SUCCESS!</h2>
                                    <p className="text-foreground/60 mb-8 text-lg font-black uppercase tracking-tight">{message}</p>
                                    <button
                                        onClick={() => setStatus('IDLE')}
                                        className="w-full py-5 bg-green-600 rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                                    >
                                        VERIFY ANOTHER
                                    </button>
                                </>
                            )}

                            {status === 'ERROR' && (
                                <>
                                    <div className="text-8xl mb-6">❌</div>
                                    <h2 className="text-3xl font-black text-red-500 mb-4 uppercase tracking-tighter">DENIED</h2>
                                    <p className="text-foreground/60 mb-8 text-lg font-black uppercase tracking-tight">{message}</p>
                                    <button
                                        onClick={() => setStatus('IDLE')}
                                        className="w-full py-5 bg-foreground/5 border border-surface-border rounded-2xl font-black text-xl hover:bg-foreground/10 transition-all text-foreground"
                                    >
                                        TRY AGAIN
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-[2rem]">
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-4">Professional Protocol</p>
                    <ul className="space-y-3 text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                        <li className="flex gap-3 items-center">
                            <span className="text-primary text-lg">01.</span>
                            Confirm items with student.
                        </li>
                        <li className="flex gap-3 items-center">
                            <span className="text-primary text-lg">02.</span>
                            Enter 6-digit key from student.
                        </li>
                        <li className="flex gap-3 items-center">
                            <span className="text-primary text-lg">03.</span>
                            Release funds to dashboard.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
