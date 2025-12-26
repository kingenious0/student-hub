
'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Mock types for now
interface SystemSettings {
    maintenanceMode: boolean;
    activeFeatures: string[];
    globalNotice: string | null;
}

import { useTheme } from '@/components/providers/ThemeProvider';

export default function CommandCenterPage() {
    // State
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ESCROW' | 'USERS' | 'VENDORS'>('OVERVIEW');
    const [escrows, setEscrows] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Lock Screen State
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [shake, setShake] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [broadcastColor, setBroadcastColor] = useState('#39FF14');

    // --- DEFINITIONS BEFORE USE ---

    const fetchSettings = async () => {
        console.log('[COMMAND CENTER] Fetching settings...');
        try {
            const res = await fetch('/api/admin/system', {
                credentials: 'include'
            });
            console.log('[COMMAND CENTER] Settings response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('[COMMAND CENTER] Settings data:', data);
                setSettings(data);
            } else {
                const errorText = await res.text();
                console.error('[COMMAND CENTER] Settings fetch failed:', res.status, errorText);
            }
        } catch (e) {
            console.error('[COMMAND CENTER] Settings fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchEscrows = async () => {
        try {
            const res = await fetch('/api/admin/escrow', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setEscrows(data);
            }
        } catch (error) {
            console.error('[COMMAND CENTER] Error fetching escrows:', error);
        }
    }

    const fetchUsers = async () => {
        console.log('[COMMAND CENTER] Fetching users...');
        try {
            const res = await fetch(`/api/admin/users?q=${searchTerm}`, {
                credentials: 'include'
            });
            console.log('[COMMAND CENTER] Users response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('[COMMAND CENTER] Users data:', data);

                if (data.success && data.users) {
                    setUsers(data.users);
                    console.log('[COMMAND CENTER] Set users count:', data.users.length);
                } else {
                    console.error('[COMMAND CENTER] Invalid users data structure:', data);
                    setUsers([]);
                }
            } else {
                const errorText = await res.text();
                console.error('[COMMAND CENTER] Failed to fetch users:', res.status, errorText);
                setUsers([]);
            }
        } catch (error) {
            console.error('[COMMAND CENTER] Error fetching users:', error);
            setUsers([]);
        }
    }

    const fetchVendors = async () => {
        console.log('[COMMAND CENTER] Fetching vendors...');
        try {
            const res = await fetch('/api/admin/vetting', {
                credentials: 'include'
            });
            console.log('[COMMAND CENTER] Vendors response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('[COMMAND CENTER] Vendors data:', data);

                if (data.success && data.vendors) {
                    setVendors(data.vendors);
                    console.log('[COMMAND CENTER] Set vendors count:', data.vendors.length);
                } else {
                    console.error('[COMMAND CENTER] Invalid vendors data structure:', data);
                    setVendors([]);
                }
            } else {
                const errorText = await res.text();
                console.error('[COMMAND CENTER] Failed to fetch vendors:', res.status, errorText);
                setVendors([]);
            }
        } catch (error) {
            console.error('[COMMAND CENTER] Error fetching vendors:', error);
            setVendors([]);
        }
    }

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'omniadmin.com') {
            try {
                // Set the cookie via API
                const res = await fetch('/api/admin/unlock-command-center', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                if (res.ok) {
                    setIsUnlocked(true);
                    localStorage.setItem('OMNI_GOD_MODE_UNLOCKED', 'true');
                    fetchSettings(); // Safe to call now
                } else {
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                    setPassword('');
                }
            } catch (error) {
                console.error('Unlock error:', error);
                setShake(true);
                setTimeout(() => setShake(false), 500);
                setPassword('');
            }
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setPassword('');
        }
    }

    const handleUserSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    }

    const handleEscrowAction = async (orderId: string, action: 'FORCE_RELEASE' | 'FORCE_REFUND') => {
        if (!confirm(`CONFIRM: ${action} for Order?`)) return;
        await fetch('/api/admin/escrow', {
            method: 'POST',
            headers: { 'credentials': 'include' },
            body: JSON.stringify({ orderId, action })
        });
        fetchEscrows();
    }

    const handleUserAction = async (targetUserId: string, action: string, value?: any) => {
        if (!confirm(`CONFIRM: ${action} for User?`)) return;
        await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
            body: JSON.stringify({ targetUserId, action, value })
        });
        fetchUsers();
        setSelectedUser(null); // Close modal
    }

    const handleVendorAction = async (vendorId: string, action: 'APPROVE' | 'REJECT') => {
        setActionLoading(vendorId);
        try {
            const res = await fetch('/api/admin/vetting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ vendorId, action })
            });

            if (res.ok) {
                setVendors(prev => prev.filter(v => v.id !== vendorId));
            }
        } catch (error) {
            console.error('Vendor action failed:', error);
        } finally {
            setActionLoading(null);
        }
    }

    const toggleSystem = async (mode: boolean) => {
        if (!confirm(mode ? '⚠️ ACTIVATE MAINTENANCE MODE? (Stops all traffic)' : '✅ RESTORE SYSTEM? (Go Live)')) return;

        console.log('[KILL SWITCH] Toggling to:', mode ? 'MAINTENANCE' : 'LIVE');

        // Optimistic update
        setSettings(prev => prev ? { ...prev, maintenanceMode: mode } : null);

        try {
            const res = await fetch('/api/admin/system', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    maintenanceMode: mode,
                    activeFeatures: settings?.activeFeatures || []
                })
            });

            if (res.ok) {
                console.log('[KILL SWITCH] Toggle successful');
                // Fetch fresh settings from server to ensure accuracy
                await fetchSettings();
                alert(mode ? '🔴 MAINTENANCE MODE ACTIVATED' : '🟢 SYSTEM RESTORED');
            } else {
                throw new Error(`API returned ${res.status}`);
            }
        } catch (e) {
            console.error('[KILL SWITCH] Toggle failed:', e);
            alert('❌ Failed to toggle system. Please try again.');
            // Revert to actual server state
            fetchSettings();
        }
    };

    const toggleFeature = async (feature: string) => {
        if (!settings) return;
        const isActive = settings.activeFeatures.includes(feature);
        const newFeatures = isActive
            ? settings.activeFeatures.filter(f => f !== feature)
            : [...settings.activeFeatures, feature];

        setSettings({ ...settings, activeFeatures: newFeatures });

        try {
            await fetch('/api/admin/system', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
                body: JSON.stringify({
                    maintenanceMode: settings.maintenanceMode,
                    activeFeatures: newFeatures
                })
            });
        } catch (e) { fetchSettings(); }
    };

    // --- EFFECTS ---

    useEffect(() => {
        // Check local storage for previous session
        const autoUnlock = async () => {
            if (localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true') {
                try {
                    // Ensure cookie is set by calling the API
                    const res = await fetch('/api/admin/unlock-command-center', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: 'omniadmin.com' })
                    });

                    if (res.ok) {
                        setIsUnlocked(true);
                        fetchSettings();
                    } else {
                        // Cookie invalid, clear localStorage
                        localStorage.removeItem('OMNI_GOD_MODE_UNLOCKED');
                    }
                } catch (error) {
                    console.error('Auto-unlock error:', error);
                    localStorage.removeItem('OMNI_GOD_MODE_UNLOCKED');
                }
            }
            setLoading(false);
        };

        autoUnlock();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Data Fetching Effects
    useEffect(() => {
        if (isUnlocked) {
            if (activeTab === 'ESCROW') fetchEscrows();
            if (activeTab === 'USERS') fetchUsers();
            if (activeTab === 'VENDORS') fetchVendors();
        }
    }, [activeTab, isUnlocked, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    // --- RENDER ---

    // RENDER LOCK SCREEN if not unlocked
    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono text-center">
                <div className="mb-8 opacity-20 hover:opacity-100 transition-opacity duration-1000">
                    <img src="/OMNI-LOGO.ico" className="w-16 h-16 invert" />
                </div>

                <h1 className="text-4xl text-gray-800 font-black mb-2 uppercase tracking-tighter">System Error 404</h1>
                <p className="text-gray-900 text-xs mb-10">Resource not found on this server.</p>

                <form onSubmit={handleUnlock} className={`flex flex-col gap-4 w-full max-w-xs transition-transform ${shake ? 'translate-x-[-10px] text-red-500' : ''} ${shake ? 'animate-pulse' : ''}`}>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="ADMIN KEY"
                        className="bg-transparent border-b border-gray-800 text-center text-white p-2 focus:outline-none focus:border-red-500 transition-colors uppercase placeholder:text-gray-900 font-black tracking-[0.5em]"
                        autoFocus
                    />
                </form>
            </div>
        );
    }

    // Auth Check for God Mode (Secondary Backup) - Optional, but keeping UI clean
    // if (loading || !user) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono">AUTHENTICATING GOD_MODE...</div>;


    const isKillSwitchActive = settings?.maintenanceMode ?? false;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-mono transition-colors duration-300">
            {/* Header */}
            <div className="p-6 border-b border-surface-border flex justify-between items-center bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu (Mobile Only) */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-foreground p-2 hover:bg-surface rounded-lg transition-colors"
                    >
                        <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
                    </button>

                    <div>
                        <h1 className="text-xl font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                            Command Center
                        </h1>
                        <p className="text-[10px] text-foreground/40 font-bold tracking-[0.2em] mt-1">SYSTEM CONTROLLER • V1.0</p>
                    </div>
                </div>

                {/* DESKTOP TABS */}
                <div className="hidden md:flex bg-surface rounded-lg p-1">
                    {['OVERVIEW', 'ESCROW', 'USERS', 'VENDORS'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-foreground text-background' : 'text-foreground/40 hover:text-foreground'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                        title={`Switch to ${theme === 'omni' ? 'Light' : 'Dark'} Mode`}
                    >
                        {theme === 'omni' ? '☀️' : '🌑'}
                    </button>

                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-bold text-foreground/60">ADMIN</span>
                        <span className="text-[10px] text-foreground/40">{user?.primaryEmailAddress?.emailAddress || 'GHOST ACCESS'}</span>
                    </div>

                    <button onClick={() => {
                        localStorage.removeItem('OMNI_GOD_MODE_UNLOCKED');
                        window.location.reload();
                    }} className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-all uppercase font-bold tracking-wider">
                        Exit
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8 max-w-2xl mx-auto">

                {/* OVERVIEW TAB */}
                {activeTab === 'OVERVIEW' && (
                    <>
                        {/* 1. THE KILL SWITCH */}
                        <div className={`p-8 rounded-3xl border-2 transition-all duration-500 ${isKillSwitchActive ? 'bg-red-500/10 border-red-500' : 'bg-green-500/10 border-green-500'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-2xl font-black uppercase tracking-tighter ${isKillSwitchActive ? 'text-red-500' : 'text-green-500'}`}>
                                    {isKillSwitchActive ? 'SYSTEM OFFLINE' : 'SYSTEM LIVE'}
                                </h2>
                                <div className={`w-4 h-4 rounded-full ${isKillSwitchActive ? 'bg-red-500 animate-ping' : 'bg-green-500 shadow-[0_0_20px_#22c55e]'}`}></div>
                            </div>

                            <p className="text-xs text-gray-400 mb-6 font-bold uppercase tracking-wide">
                                {isKillSwitchActive
                                    ? 'The platform is currently in maintenance mode. Users cannot access the marketplace.'
                                    : 'All systems operational. Traffic is flowing normally.'}
                            </p>

                            <button
                                onClick={() => toggleSystem(!isKillSwitchActive)}
                                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl ${isKillSwitchActive
                                    ? 'bg-green-500 text-black hover:bg-green-400'
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                    }`}
                            >
                                {isKillSwitchActive ? 'RESTORE SYSTEM' : 'INITIATE KILL SWITCH'}
                            </button>
                        </div>

                        {/* 1.5 VIRTUAL SYSTEM ACCESS */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-4 ml-2">Virtual System Access</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <a href="/marketplace" target="_blank" className="p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group text-center">
                                    <div className="text-2xl mb-2">👁️</div>
                                    <div className="text-primary font-black uppercase tracking-widest text-[10px]">Marketplace</div>
                                </a>
                                <a href="/dashboard/vendor" target="_blank" className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all group text-center">
                                    <div className="text-2xl mb-2">🏪</div>
                                    <div className="text-purple-500 font-black uppercase tracking-widest text-[10px]">Vendor Console</div>
                                </a>
                                <a href="/runner" target="_blank" className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all group text-center">
                                    <div className="text-2xl mb-2">⚡</div>
                                    <div className="text-yellow-500 font-black uppercase tracking-widest text-[10px]">Runner Terminal</div>
                                </a>
                                <a href="/stories" target="_blank" className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all group text-center">
                                    <div className="text-2xl mb-2">📹</div>
                                    <div className="text-pink-500 font-black uppercase tracking-widest text-[10px]">Pulse Feed</div>
                                </a>
                            </div>
                        </div>

                        {/* 2. GLOBAL ANNOUNCEMENT */}
                        <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-20"><span className="text-4xl">📢</span></div>
                            <h2 className="text-zinc-500 font-bold mb-4 text-xs tracking-widest uppercase">Global Broadcast Protocol</h2>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2 mb-2">
                                    {['#39FF14', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setBroadcastColor(color)}
                                            className={`w-6 h-6 rounded-full border transition-transform ${broadcastColor === color ? 'scale-125 border-white shadow-[0_0_10px_white]' : 'border-white/20 hover:scale-110'}`}
                                            style={{ backgroundColor: color }}
                                            title="Set Bar Color"
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="TYPE URGENT MESSAGE TO ALL STUDENTS..."
                                        className="bg-background border border-surface-border text-foreground rounded-xl p-3 w-full font-mono text-sm focus:border-red-500 focus:outline-none placeholder:text-foreground/30"
                                        defaultValue={settings?.globalNotice || ''}
                                        id="broadcast-input"
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            if (val !== settings?.globalNotice) {
                                                // Auto-save on blur logic preserved
                                            }
                                        }}
                                    />
                                    <button
                                        className="bg-red-600 hover:bg-red-700 text-white font-black px-6 rounded-xl uppercase text-xs tracking-widest transition-colors"
                                        onClick={() => {
                                            const input = document.getElementById('broadcast-input') as HTMLInputElement;
                                            if (input) {
                                                // Strip existing color tag if present to avoid duplication
                                                const rawVal = input.value.replace(/^\[(#.*?|[a-z]+)\]/, '');
                                                const finalMessage = `[${broadcastColor}]${rawVal}`;

                                                setSettings(prev => prev ? { ...prev, globalNotice: finalMessage } : null);
                                                fetch('/api/admin/system', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
                                                    body: JSON.stringify({
                                                        maintenanceMode: settings?.maintenanceMode,
                                                        activeFeatures: settings?.activeFeatures,
                                                        globalNotice: finalMessage
                                                    })
                                                });
                                                alert('PROTOCOL BROADCASTED WITH COLOR');
                                            }
                                        }}
                                    >
                                        SYNC
                                    </button>
                                    <button
                                        className="bg-surface border border-surface-border text-foreground/60 hover:text-red-500 font-black px-4 rounded-xl uppercase text-xs tracking-widest transition-colors"
                                        onClick={() => {
                                            const input = document.getElementById('broadcast-input') as HTMLInputElement;
                                            if (input) {
                                                input.value = '';
                                                setSettings(prev => prev ? { ...prev, globalNotice: '' } : null);
                                                fetch('/api/admin/system', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
                                                    body: JSON.stringify({
                                                        maintenanceMode: settings?.maintenanceMode,
                                                        activeFeatures: settings?.activeFeatures,
                                                        globalNotice: ''
                                                    })
                                                });
                                            }
                                        }}
                                    >
                                        CLEAR
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. FEATURE FLAGS */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-2">Active Protocols</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {['MARKET', 'MARKET_ACTIONS', 'PULSE', 'RUNNER', 'ESCROW', 'VENDOR'].map((feature) => {
                                    const active = settings?.activeFeatures.includes(feature);
                                    return (
                                        <button
                                            key={feature}
                                            onClick={() => toggleFeature(feature)}
                                            className={`p-4 rounded-2xl border transition-all text-left group ${active
                                                ? 'bg-primary/10 border-primary/20'
                                                : 'bg-surface border-surface-border opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-foreground/50'
                                                    }`}>{feature}</span>
                                                <div className={`w-2 h-2 rounded-full ${active ? 'bg-primary shadow-[0_0_10px_var(--primary)]' : 'bg-surface-border'
                                                    }`}></div>
                                            </div>
                                            <div className={`h-1 w-full rounded-full mt-2 ${active ? 'bg-primary/30' : 'bg-surface-border'
                                                }`}>
                                                <div className={`h-full bg-primary rounded-full transition-all ${active ? 'w-full' : 'w-0'
                                                    }`}></div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* ESCROW TAB */}
                {activeTab === 'ESCROW' && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Active Conflicts</h2>
                        {escrows.length === 0 ? (
                            <div className="text-center py-10 text-gray-600 font-mono text-xs">NO ACTIVE ESCROWS FOUND</div>
                        ) : (
                            escrows.map(order => (
                                <div key={order.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase">{order.vendor.shopName}</p>
                                        <p className="text-[10px] text-gray-400">GH₵ {order.amount.toFixed(2)} • {order.student.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEscrowAction(order.id, 'FORCE_RELEASE')} className="px-3 py-1 bg-green-500/20 text-green-400 text-[9px] font-black uppercase rounded border border-green-500/30">Release</button>
                                        <button onClick={() => handleEscrowAction(order.id, 'FORCE_REFUND')} className="px-3 py-1 bg-red-500/20 text-red-400 text-[9px] font-black uppercase rounded border border-red-500/30">Refund</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'USERS' && (
                    <div className="space-y-4">
                        <form onSubmit={handleUserSearch} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search email, name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                            />
                            <button type="submit" className="px-4 bg-white text-black rounded-xl font-black text-xs uppercase">Search</button>
                        </form>

                        <div className="space-y-2">
                            {users.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm font-bold">No users found</p>
                                    <p className="text-xs mt-2">There are no users in the system yet, or they don't match your search.</p>
                                </div>
                            ) : (
                                users.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{u.name}</p>
                                                <p className="text-[10px] text-gray-400">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[9px] px-2 py-1 rounded font-bold ${u.role === 'ADMIN' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                                                    {u.role}
                                                </span>
                                                <span className="text-xs font-black text-green-500">₵{u.balance.toFixed(2)}</span>
                                                <span className="text-gray-500 text-lg">→</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* POWER CARD MODAL */}
                        {selectedUser && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedUser(null)}>
                                <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                                    {/* Header */}
                                    <div className="p-6 border-b border-white/5 flex justify-between items-start bg-black/50 relative">
                                        <div>
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedUser.name}</h2>
                                            <p className="text-xs text-zinc-500 font-mono tracking-wider">{selectedUser.email}</p>
                                        </div>
                                        <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors">✕</button>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 space-y-8 relative">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                                                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Wallet Assets</div>
                                                <div className="text-2xl font-mono text-green-400">₵{selectedUser.balance.toFixed(2)}</div>
                                            </div>
                                            <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                                                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Clearance Level</div>
                                                <div className={`text-xl font-black uppercase ${selectedUser.role === 'ADMIN' ? 'text-red-500' : 'text-white'}`}>
                                                    {selectedUser.role}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-2">Override Protocols</p>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleUserAction(selectedUser.id, 'SET_ROLE', 'VENDOR')}
                                                    className="py-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl font-bold text-[10px] uppercase hover:bg-purple-500/20 hover:border-purple-500/40 transition-all"
                                                >
                                                    Grant Vendor Status
                                                </button>
                                                <button
                                                    onClick={() => handleUserAction(selectedUser.id, 'SET_ROLE', 'ADMIN')}
                                                    className="py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-[10px] uppercase hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                                                >
                                                    Promote to Admin
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleUserAction(selectedUser.id, 'FREEZE_WALLET')}
                                                className="w-full py-4 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl font-bold text-[10px] uppercase hover:bg-red-950 hover:text-red-500 hover:border-red-900 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span>❄️</span> Emergency Freeze Assets
                                            </button>

                                            <div className="pt-4 border-t border-white/5">
                                                <button
                                                    onClick={() => window.open(`/?impersonate=${selectedUser.id}`, '_blank')}
                                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2"
                                                >
                                                    <span>👁️</span> View User Screen
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* VENDORS TAB */}
                {activeTab === 'VENDORS' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Pending Vendor Applications</h2>
                            <span className="text-xs font-mono text-gray-500">{vendors.length} pending</span>
                        </div>

                        {vendors.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                <div className="text-4xl mb-4 opacity-20">🏪</div>
                                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">No pending vendor applications</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vendors.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-white/20 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg">
                                                    🏪
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                                                        {vendor.shopName}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-mono text-yellow-500">
                                                            📍 {vendor.shopLandmark}
                                                        </span>
                                                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                        <span className="text-[10px] font-mono text-gray-400">
                                                            👤 {vendor.name}
                                                        </span>
                                                    </div>
                                                    {vendor.email && (
                                                        <p className="text-[9px] text-gray-500 mt-0.5">{vendor.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 border-t border-white/5 pt-3">
                                            <button
                                                disabled={!!actionLoading}
                                                onClick={() => handleVendorAction(vendor.id, 'REJECT')}
                                                className="flex-1 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-30"
                                            >
                                                Deny
                                            </button>
                                            <button
                                                disabled={!!actionLoading}
                                                onClick={() => handleVendorAction(vendor.id, 'APPROVE')}
                                                className="flex-1 py-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all disabled:opacity-30"
                                            >
                                                {actionLoading === vendor.id ? 'PROCESSING...' : 'Authorize'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


            </div>
        </div>
    );
}
