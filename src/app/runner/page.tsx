
// src/app/runner/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface DeliveryRequest {
    id: string;
    product: {
        title: string;
    };
    amount: number;
    pickupLocation: string;
    deliveryLocation: string;
    estimatedEarnings: number;
    estimatedXP: number;
    distance: string;
    createdAt: string;
}

interface ActiveDelivery {
    id: string;
    product: string;
    pickupLocation: string;
    deliveryLocation: string;
    earnings: number;
    xp: number;
}

interface DeliveryHistoryItem {
    id: string;
    product: string;
    date: string;
    earnings: number;
}

export default function RunnerModePage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // State
    const [isRunnerMode, setIsRunnerMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [runnerStats, setRunnerStats] = useState({
        xp: 0,
        level: 1,
        totalEarnings: 0,
        completedDeliveries: 0,
        badges: [] as string[],
    });
    const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
    const [availableDeliveries, setAvailableDeliveries] = useState<DeliveryRequest[]>([]);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [unlockKey, setUnlockKey] = useState('');
    const [unlocking, setUnlocking] = useState(false);
    const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistoryItem[]>([]);
    const [historyPage, setHistoryPage] = useState(1);

    // Fetch initial status and stats
    const fetchStatusAndStats = useCallback(async () => {
        try {
            // Fetch runner status
            const statusRes = await fetch('/api/runner/toggle');
            if (statusRes.ok) {
                const statusData = await statusRes.json();
                setIsRunnerMode(statusData.isRunner);
            }

            // Fetch runner stats & active delivery
            const statsRes = await fetch('/api/runner/stats');
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setRunnerStats({
                    xp: statsData.stats.xp || 0,
                    level: statsData.stats.level || 1,
                    totalEarnings: statsData.stats.totalEarnings || 0,
                    completedDeliveries: statsData.stats.completedDeliveries || 0,
                    badges: statsData.stats.badges || [],
                });
                setActiveDelivery(statsData.activeDelivery);
                setDeliveryHistory(statsData.history || []);
            }
        } catch (error) {
            console.error('Failed to fetch runner data', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoaded && user) {
            fetchStatusAndStats();
        }
    }, [isLoaded, user, fetchStatusAndStats]);

    // Polling for deliveries
    const fetchDeliveries = useCallback(async () => {
        if (!isRunnerMode || activeDelivery) return;

        try {
            const res = await fetch('/api/runner/deliveries');
            if (res.ok) {
                const data = await res.json();
                setAvailableDeliveries(data.deliveries);
            }
        } catch (error) {
            console.error('Failed to fetch deliveries', error);
        }
    }, [isRunnerMode, activeDelivery]);

    useEffect(() => {
        if (isRunnerMode && !activeDelivery) {
            fetchDeliveries();
            const interval = setInterval(fetchDeliveries, 10000); // Poll every 10s
            return () => clearInterval(interval);
        } else {
            setAvailableDeliveries([]);
        }
    }, [isRunnerMode, activeDelivery, fetchDeliveries]);

    const toggleRunnerMode = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/runner/toggle', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setIsRunnerMode(data.isRunner);
            }
        } catch (error) {
            alert('Failed to toggle runner mode');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (orderId: string) => {
        if (!confirm('Are you ready to pick up this order immediately?')) return;

        setClaimingId(orderId);
        try {
            const res = await fetch('/api/runner/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                await fetchStatusAndStats(); // Refresh to see active delivery
            } else {
                alert(data.error || 'Failed to claim delivery');
            }
        } catch (error) {
            alert('Error claiming delivery');
        } finally {
            setClaimingId(null);
        }
    };

    const handleUnlock = async () => {
        if (unlockKey.length < 6) return;
        setUnlocking(true);
        try {
            const res = await fetch('/api/orders/verify-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ releaseKey: unlockKey }),
            });
            const data = await res.json();

            if (data.success) {
                alert('Mission Accomplished! Funds released.');
                setUnlockKey('');
                await fetchStatusAndStats(); // Update XP and earnings
            } else {
                alert(data.error || 'Invalid key');
            }
        } catch (error) {
            alert('Unlock failed');
        } finally {
            setUnlocking(false);
        }
    };

    const getLevelProgress = () => {
        const xpForNextLevel = runnerStats.level * 100;
        return Math.min(100, (runnerStats.xp / xpForNextLevel) * 100);
    };

    if (!isLoaded) return <div className="text-white text-center py-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">
                            RUNNER HUB
                        </h1>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em] border-l-2 border-primary/30 pl-4">Elite Segment Delivery Operations • Sector Alpha</p>
                    </div>
                    <div className="bg-surface border border-surface-border rounded-2xl px-6 py-3 flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Global Tier</div>
                            <div className="text-lg font-black italic">OMNI SHADOW</div>
                        </div>
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-xl omni-glow">⚡</div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Profile */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Level Card */}
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>

                            <div className="relative">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg omni-glow">
                                        {runnerStats.level}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">XP Uplink</div>
                                        <div className="text-2xl font-black text-foreground tracking-tighter">{runnerStats.xp}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.3em]">
                                        <span className="text-primary">Level Synchronization</span>
                                        <span className="text-foreground/40">{runnerStats.xp} / {runnerStats.level * 100}</span>
                                    </div>
                                    <div className="h-2 bg-background/40 rounded-full overflow-hidden border border-surface-border">
                                        <div
                                            className="h-full bg-primary omni-glow transition-all duration-1000"
                                            style={{ width: `${getLevelProgress()}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Earnings Card */}
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-8 flex items-center justify-between group">
                            <div>
                                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Combat Earnings</div>
                                <div className="text-3xl font-black text-primary tracking-tighter">₵{runnerStats.totalEarnings.toFixed(2)}</div>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">₵</div>
                        </div>

                        {/* Badges Section */}
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-8">
                            <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-6">Service Ribbons</h3>
                            <div className="flex flex-wrap gap-2">
                                {runnerStats.badges.length > 0 ? runnerStats.badges.map(badge => (
                                    <div key={badge} className="px-3 py-1.5 bg-foreground/5 border border-foreground/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary/70">
                                        {badge}
                                    </div>
                                )) : (
                                    <p className="text-foreground/10 text-[9px] font-black uppercase tracking-widest italic">No ribbons earned</p>
                                )}
                            </div>
                        </div>

                        {/* Toggle Mode */}
                        <button
                            onClick={toggleRunnerMode}
                            disabled={loading || !!activeDelivery}
                            className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 border-2 ${isRunnerMode
                                ? 'bg-primary/5 border-primary/30 text-primary omni-glow'
                                : 'bg-surface border-surface-border text-foreground/20'
                                } ${activeDelivery ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                        >
                            {isRunnerMode ? (
                                <><span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span> ACTIVE STATUS</>
                            ) : (
                                <><span className="w-2 h-2 bg-foreground/10 rounded-full"></span> INITIALIZE UPLINK</>
                            )}
                        </button>
                    </div>

                    {/* Right Column: Missions */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Mission */}
                        {activeDelivery ? (
                            <div className="bg-primary/10 border border-primary/30 rounded-[3rem] p-1 shadow-[0_30px_60px_rgba(57,255,20,0.1)]">
                                <div className="bg-background rounded-[2.8rem] p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20 mb-4 inline-block animate-pulse">
                                                Operational Mission 🔥
                                            </span>
                                            <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter">{activeDelivery.product}</h2>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black text-primary tracking-tighter">+₵{activeDelivery.earnings.toFixed(2)}</div>
                                            <div className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Pending Payout</div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                                        <div className="bg-surface p-6 rounded-3xl border border-surface-border">
                                            <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Extraction Zone</div>
                                            <div className="text-xl font-black text-foreground uppercase">{activeDelivery.pickupLocation || 'Sector Unknown'}</div>
                                        </div>
                                        <div className="bg-surface p-6 rounded-3xl border border-surface-border">
                                            <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Landing Zone</div>
                                            <div className="text-xl font-black text-foreground uppercase">{activeDelivery.deliveryLocation || 'Sector Unknown'}</div>
                                        </div>
                                    </div>

                                    <div className="bg-background/60 border border-surface-border rounded-[2.5rem] p-8">
                                        <h3 className="text-center text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mb-6">Security Handshake</h3>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                placeholder="000-000"
                                                value={unlockKey}
                                                onChange={(e) => setUnlockKey(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="flex-1 bg-background border border-surface-border rounded-2xl py-5 text-center text-4xl font-black tracking-[0.4em] text-primary focus:border-primary/50 transition-all outline-none placeholder:text-foreground/5"
                                            />
                                            <button
                                                onClick={handleUnlock}
                                                disabled={unlockKey.length < 6 || unlocking}
                                                className="px-8 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all omni-glow hover:scale-[1.05] active:scale-95 whitespace-nowrap"
                                            >
                                                {unlocking ? 'TRX...' : 'COMPLETE MISSION'}
                                            </button>
                                        </div>
                                        <p className="text-center text-[9px] text-foreground/20 mt-6 uppercase font-black tracking-[0.2em]">Secure the student&apos;s 6-digit OMNI Key to release funds</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary pl-4 border-l-2 border-primary/30">
                                    {isRunnerMode ? 'Active Scanner' : 'System Terminal'}
                                </h2>

                                {!isRunnerMode ? (
                                    <div className="bg-surface border border-surface-border rounded-[3rem] p-16 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                                        <div className="text-8xl mb-6 opacity-20">📡</div>
                                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter text-foreground">Uplink Disconnected</h3>
                                        <p className="text-foreground/20 mb-8 max-w-sm mx-auto font-bold text-xs uppercase tracking-widest leading-loose">
                                            Re-establish connection to receive operational contracts in your vicinity.
                                        </p>
                                        <button
                                            onClick={toggleRunnerMode}
                                            className="px-10 py-5 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all omni-glow"
                                        >
                                            Connect Uplink ⚡
                                        </button>
                                    </div>
                                ) : availableDeliveries.length === 0 ? (
                                    <div className="bg-surface border border-surface-border rounded-[3rem] p-16 text-center">
                                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                            <div className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <span className="text-3xl animate-pulse">📡</span>
                                        </div>
                                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter text-foreground">Scanning All Sectors...</h3>
                                        <p className="text-foreground/20 font-bold text-xs uppercase tracking-widest">Awaiting high-priority contracts.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {availableDeliveries.map((delivery) => (
                                            <div
                                                key={delivery.id}
                                                className="bg-surface border border-surface-border rounded-[2rem] p-8 hover:border-primary/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8"
                                            >
                                                <div className="flex gap-6 items-center">
                                                    <div className="w-16 h-16 bg-background border border-surface-border rounded-2xl flex items-center justify-center text-3xl group-hover:bg-primary/10 transition-colors">📦</div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{delivery.product.title}</h3>
                                                        <div className="flex items-center gap-3 mt-2 text-[9px] text-foreground/30 font-black uppercase tracking-widest">
                                                            <span className="text-primary">EX: {delivery.pickupLocation}</span>
                                                            <span className="opacity-20">/</span>
                                                            <span>LZ: {delivery.deliveryLocation || 'Alpha Sector'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 justify-between md:justify-end">
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-primary tracking-tighter">₵{delivery.estimatedEarnings.toFixed(2)}</div>
                                                        <div className="text-[10px] font-black text-foreground/20 uppercase">+{delivery.estimatedXP} XP</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleClaim(delivery.id)}
                                                        disabled={claimingId === delivery.id}
                                                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest transition-all omni-glow active:scale-95"
                                                    >
                                                        {claimingId === delivery.id ? 'CLAIMING...' : 'ACCEPT'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 📁 Mission Archive (The Bin) */}
                        {deliveryHistory.length > 0 && (
                            <div className="space-y-6 pt-12">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20 pl-4 border-l-2 border-foreground/10">
                                    Mission Archive
                                </h2>
                                <div className="grid gap-3">
                                    {(() => {
                                        const ITEMS_PER_PAGE = 5;
                                        const totalPages = Math.ceil(deliveryHistory.length / ITEMS_PER_PAGE);
                                        const currentItems = deliveryHistory.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

                                        return (
                                            <>
                                                {currentItems.map((mission) => (
                                                    <div
                                                        key={mission.id}
                                                        className="bg-surface border border-surface-border rounded-2xl p-5 flex items-center justify-between opacity-50 hover:opacity-100 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">✅</div>
                                                            <div>
                                                                <div className="text-[11px] font-black text-foreground uppercase tracking-tight">{mission.product}</div>
                                                                <div className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{mission.date}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-black text-primary tracking-tighter">₵{mission.earnings.toFixed(2)}</div>
                                                            <div className="text-[8px] font-black text-foreground/10 uppercase tracking-widest">SUCCESS</div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {totalPages > 1 && (
                                                    <div className="flex items-center justify-center gap-6 pt-6">
                                                        <button
                                                            disabled={historyPage === 1}
                                                            onClick={() => setHistoryPage(p => p - 1)}
                                                            className="p-3 bg-foreground/5 hover:bg-foreground/10 disabled:opacity-20 rounded-xl transition-all"
                                                        >
                                                            <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Prev</span>
                                                        </button>
                                                        <span className="text-[10px] font-black text-primary tracking-widest">{historyPage} <span className="text-foreground/10">/</span> {totalPages}</span>
                                                        <button
                                                            disabled={historyPage === totalPages}
                                                            onClick={() => setHistoryPage(p => p + 1)}
                                                            className="p-3 bg-foreground/5 hover:bg-foreground/10 disabled:opacity-20 rounded-xl transition-all"
                                                        >
                                                            <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Next</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
