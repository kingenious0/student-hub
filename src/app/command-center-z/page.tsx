
'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Mock types for now
interface SystemSettings {
    maintenanceMode: boolean;
    activeFeatures: string[];
    globalNotice: string | null;
}

import { useTheme } from '@/components/providers/ThemeProvider';

import { useModal } from '@/context/ModalContext';

export default function CommandCenterPage() {
    // State
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const modal = useModal();
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ESCROW' | 'USERS' | 'VENDORS' | 'SIGNALS' | 'APPLICATIONS' | 'TESTING'>('OVERVIEW');
    const [escrows, setEscrows] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [signals, setSignals] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Lock Screen State
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [shake, setShake] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [broadcastColor, setBroadcastColor] = useState('#39FF14');

    // Testing Panel State
    const [testSmsPhone, setTestSmsPhone] = useState('');
    const [testSmsMessage, setTestSmsMessage] = useState('LaHustle SMS Test Confirmation!');
    const [testPushUser, setTestPushUser] = useState('');
    const [testPushTitle, setTestPushTitle] = useState('LaHustle PWA Test');
    const [testPushBody, setTestPushBody] = useState('This is a real-time system test notification! 🔔');
    const [testPushUrl, setTestPushUrl] = useState('/marketplace');
    const [testSmsLoading, setTestSmsLoading] = useState(false);
    const [testPushLoading, setTestPushLoading] = useState(false);

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

    const fetchSignals = async () => {
        try {
            const res = await fetch('/api/feedback', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data.success) setSignals(data.feedback);
            }
        } catch (e) {
            console.error('Signals fetch error', e);
        }
    }

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/admin/vendor-applications', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
            }
        } catch (e) { console.error(e); }
    }

    const handleApproveApplication = async (appId: string) => {
        if (!await modal.confirm('Initiate vendor promotion sequence? This will elevate the user to VENDOR status.', 'Promote Candidate')) return;
        try {
            const res = await fetch('/api/admin/vendor-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: appId, action: 'APPROVE' })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`SUCCESS: ${data.message}`);
                fetchApplications();
            } else {
                toast.error(`ERROR: ${data.error}`);
            }
        } catch (e) { toast.error('Failed'); }
    }

    const handleDeleteApplication = async (appId: string) => {
        if (!await modal.confirm('Terminal rejection of vendor request? The user remains eligible for re-application.', 'Reject Protocol')) return;
        try {
            const res = await fetch('/api/admin/vendor-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: appId, action: 'REJECT' })
            });
            if (res.ok) {
                fetchApplications();
                toast.success('Application rejected');
            } else {
                toast.error('Failed to reject');
            }
        } catch (e) { toast.error('Error'); }
    }

    const deleteSignal = async (id: string) => {
        if (!await modal.confirm('Permanently purge this intercepted signal from the intelligence database?', 'Purge Signal')) return;
        setSignals(prev => prev.filter(s => s.id !== id));
        try {
            await fetch('/api/feedback', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (e) { fetchSignals(); }
    }

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'LaHustleadmin.com') {
            try {
                // Set the cookie via API
                const res = await fetch('/api/admin/unlock-command-center', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                if (res.ok) {
                    setIsUnlocked(true);
                    localStorage.setItem('LH_GOD_MODE_UNLOCKED', 'true');
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
        if (!await modal.confirm(`CONFIRM: ${action} for Order?`, 'Confirm Escrow Action', true)) return;
        await fetch('/api/admin/escrow', {
            method: 'POST',
            headers: { 'credentials': 'include' },
            body: JSON.stringify({ orderId, action })
        });
        fetchEscrows();
    }

    const handleUserAction = async (targetUserId: string, action: string, value?: any) => {
        if (!await modal.confirm(`CONFIRM: ${action} for User?`, 'Confirm User Action', true)) return;
        await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'credentials': 'include' },
            body: JSON.stringify({ targetUserId, action, value })
        });
        fetchUsers();
        setSelectedUser(null); // Close modal
    }

    const handleImpersonate = async (userId: string) => {
        try {
            // Start impersonation
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'START' })
            });

            if (res.ok) {
                // Open new tab - the app will detect impersonation cookie
                window.open('/', '_blank');
            }
        } catch (e) {
            modal.alert('Failed to start impersonation', 'Error');
        }
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
        if (!await modal.confirm(
            mode ? '⚠️ ACTIVATE MAINTENANCE MODE? (Stops all traffic)' : '✅ RESTORE SYSTEM? (Go Live)',
            'System Override',
            true
        )) return;

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
                modal.alert(mode ? '🔴 MAINTENANCE MODE ACTIVATED' : '🟢 SYSTEM RESTORED', 'System Status');
            } else {
                throw new Error(`API returned ${res.status}`);
            }
        } catch (e) {
            console.error('[KILL SWITCH] Toggle failed:', e);
            modal.alert('❌ Failed to toggle system. Please try again.', 'Error');
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
            if (localStorage.getItem('LH_GOD_MODE_UNLOCKED') === 'true') {
                try {
                    // Ensure cookie is set by calling the API
                    const res = await fetch('/api/admin/unlock-command-center', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: 'LaHustleadmin.com' })
                    });

                    if (res.ok) {
                        setIsUnlocked(true);
                        fetchSettings();
                    } else {
                        // Cookie invalid, clear localStorage
                        localStorage.removeItem('LH_GOD_MODE_UNLOCKED');
                    }
                } catch (error) {
                    console.error('Auto-unlock error:', error);
                    localStorage.removeItem('LH_GOD_MODE_UNLOCKED');
                }
            }
            setLoading(false);
        };

        autoUnlock();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Parse broadcast color from globalNotice
    useEffect(() => {
        if (settings?.globalNotice) {
            const match = settings.globalNotice.match(/^\[(#[a-fA-F0-9]{6})\]/);
            if (match) {
                setBroadcastColor(match[1]);
            }
        }
    }, [settings?.globalNotice]);

    // Data Fetching Effects
    useEffect(() => {
        if (isUnlocked) {
            if (activeTab === 'ESCROW') fetchEscrows();
            if (activeTab === 'USERS' || activeTab === 'TESTING') fetchUsers();
            if (activeTab === 'VENDORS') fetchVendors();
            if (activeTab === 'SIGNALS') fetchSignals();
            if (activeTab === 'APPLICATIONS') fetchApplications();
        }
    }, [activeTab, isUnlocked, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    // --- RENDER ---

    // RENDER LOCK SCREEN if not unlocked
    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-mono text-center">
                <div className="mb-8 opacity-20 hover:opacity-100 transition-opacity duration-1000">
                    <img src="/lahustle-icon.svg" className="w-16 h-16 invert" />
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
            <div className="p-6 border-b border-surface-border/80 flex justify-between items-center bg-background/90 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu (Mobile Only) */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-foreground p-2 hover:bg-surface rounded-lg transition-colors cursor-pointer"
                    >
                        <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
                    </button>

                    <div>
                        <h1 className="text-xl font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></span>
                            Command Center
                        </h1>
                        <p className="text-[9px] text-foreground/40 font-black tracking-[0.2em] mt-1">SYSTEM CONTROLLER • V1.0</p>
                    </div>
                </div>

                <div className="hidden md:flex bg-surface border border-surface-border/80 rounded-full p-1 shadow-sm">
                    {['OVERVIEW', 'ESCROW', 'USERS', 'VENDORS', 'SIGNALS', 'APPLICATIONS', 'TESTING'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab ? 'bg-primary text-black shadow-md' : 'text-foreground/40 hover:text-foreground'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                        title={`Switch to ${theme === 'lahustle' ? 'Light' : 'Dark'} Mode`}
                    >
                        {theme === 'lahustle' ? '☀️' : '🌑'}
                    </button>

                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-black tracking-wider text-foreground/60">ADMIN</span>
                        <span className="text-[9px] text-foreground/40 font-mono font-medium">{user?.primaryEmailAddress?.emailAddress || 'GHOST ACCESS'}</span>
                    </div>

                    <button onClick={() => {
                        localStorage.removeItem('LH_GOD_MODE_UNLOCKED');
                        window.location.reload();
                    }} className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-3.5 py-1.5 rounded-xl hover:bg-red-500 hover:text-white transition-all uppercase font-black tracking-wider cursor-pointer">
                        Exit
                    </button>
                </div>
            </div>

            {/* MOBILE MENU DROPDOWN */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-surface border-b border-surface-border/80 p-4">
                    <div className="flex flex-col gap-2">
                        {['OVERVIEW', 'ESCROW', 'USERS', 'VENDORS', 'SIGNALS', 'APPLICATIONS', 'TESTING'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab as any);
                                    setMobileMenuOpen(false);
                                }}
                                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left cursor-pointer ${activeTab === tab
                                    ? 'bg-primary text-black'
                                    : 'text-foreground/40 hover:text-foreground hover:bg-surface-border/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8 space-y-12 max-w-5xl mx-auto pt-12">

                {/* OVERVIEW TAB */}
                {activeTab === 'OVERVIEW' && (
                    <>
                        {/* 1. THE KILL SWITCH */}
                        <div className={cn(
                            "border rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl transition-all duration-500",
                            isKillSwitchActive
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-emerald-500/10 border-emerald-500/30'
                        )}>
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" style={{ backgroundImage: isKillSwitchActive ? undefined : 'linear-gradient(to right, var(--color-primary), #10b981)' }} />
                            <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />

                            <div className="border-b border-dashed border-surface-border/60 pb-6 flex justify-between items-center mb-6">
                                <div>
                                    <h2 className={cn(
                                        "text-2xl font-black uppercase tracking-tight",
                                        isKillSwitchActive ? 'text-red-500' : 'text-emerald-500'
                                    )}>
                                        {isKillSwitchActive ? 'SYSTEM OFFLINE' : 'SYSTEM LIVE'}
                                    </h2>
                                    <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest mt-1">Platform Status Indicator</p>
                                </div>
                                <div className={cn(
                                    "w-4 h-4 rounded-full shadow-lg shrink-0",
                                    isKillSwitchActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                                )}></div>
                            </div>

                            <p className="text-xs text-foreground/50 mb-6 font-bold uppercase tracking-wide leading-relaxed">
                                {isKillSwitchActive
                                    ? 'The platform is currently in maintenance mode. Users cannot access the marketplace.'
                                    : 'All systems operational. Traffic is flowing normally.'}
                            </p>

                            <button
                                onClick={() => toggleSystem(!isKillSwitchActive)}
                                className={cn(
                                    "w-full py-4.5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.01] active:scale-95 shadow-xl cursor-pointer",
                                    isKillSwitchActive
                                        ? 'bg-emerald-500 text-black shadow-emerald-500/10'
                                        : 'bg-red-500 text-white shadow-red-500/10'
                                )}
                            >
                                {isKillSwitchActive ? 'RESTORE SYSTEM' : 'INITIATE KILL SWITCH'}
                            </button>
                        </div>

                        {/* 1.5 VIRTUAL SYSTEM ACCESS */}
                        <div className="space-y-6">
                            <div className="border-b border-dashed border-surface-border/60 pb-3.5">
                                <h3 className="text-xs font-black text-foreground/40 uppercase tracking-[0.2em]">Virtual System Access</h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { href: '/marketplace', label: 'Marketplace', icon: '👁️', color: 'text-primary bg-primary/10 border-primary/20 hover:bg-primary/20' },
                                    { href: '/dashboard/vendor', label: 'Vendor Console', icon: '🏪', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20' },
                                    { href: '/stories', label: 'Pulse Feed', icon: '📹', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20' },
                                    { href: '/dashboard/admin/flash-sales', label: 'Flash Sales CMS', icon: '⚡', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20' },
                                    { href: '/dashboard/admin', label: 'Admin Dashboard', icon: '📊', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' },
                                ].map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.href}
                                        target="_blank"
                                        className={cn(
                                            "p-5 rounded-3xl border transition-all text-center relative overflow-hidden group shadow-sm flex flex-col items-center justify-center min-h-[110px]",
                                            item.color
                                        )}
                                    >
                                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                                        <div className="font-black uppercase tracking-widest text-[9px]">{item.label}</div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* 2. GLOBAL ANNOUNCEMENT */}
                        <div className="bg-surface border border-surface-border/80 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-6">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
                            <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />

                            <div className="border-b border-dashed border-surface-border/60 pb-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                        <span>📢</span> Global Broadcast Protocol
                                    </h2>
                                    <p className="text-foreground/30 text-[9px] font-black uppercase tracking-widest mt-1">Uplink urgent notice to all student terminals</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-dashed border-surface-border/60 pb-4">
                                    <div>
                                        <span className="text-xs font-black text-foreground uppercase tracking-tight">Broadcast Accent Color</span>
                                        <p className="text-foreground/40 text-[9px] font-black uppercase tracking-widest mt-1">Visual classification priority level</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {['#39FF14', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setBroadcastColor(color)}
                                                className={`w-7 h-7 rounded-full border cursor-pointer transition-transform ${broadcastColor === color ? 'scale-115 border-white shadow-[0_0_8px_white]' : 'border-white/10 hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                                title="Set Bar Color"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        placeholder="TYPE URGENT MESSAGE TO ALL STUDENTS..."
                                        className="bg-background border border-surface-border/80 text-foreground rounded-2xl p-4 w-full font-mono text-xs focus:border-red-500 focus:outline-none placeholder:text-foreground/20 font-bold"
                                        defaultValue={settings?.globalNotice?.replace(/^\[(#.*?|[a-z]+)\]/, '') || ''}
                                        key={settings?.globalNotice}
                                        id="broadcast-input"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            className="py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase text-xs tracking-widest transition-colors cursor-pointer"
                                            onClick={async () => {
                                                const input = document.getElementById('broadcast-input') as HTMLInputElement;
                                                if (input) {
                                                    try {
                                                        const rawVal = input.value.replace(/^\[(#.*?|[a-z]+)\]/, '');
                                                        const finalMessage = `[${broadcastColor}]${rawVal}`;
                                                        const response = await fetch('/api/admin/system', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            credentials: 'include',
                                                            body: JSON.stringify({
                                                                maintenanceMode: settings?.maintenanceMode,
                                                                activeFeatures: settings?.activeFeatures,
                                                                globalNotice: finalMessage
                                                            })
                                                        });
                                                        if (response.ok) {
                                                            const data = await response.json();
                                                            setSettings(data);
                                                            modal.alert('The message has been synchronized across all terminal interfaces.', 'Broadcast Uplinked');
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }
                                            }}
                                        >
                                            SYNC BROADCAST
                                        </button>
                                        <button
                                            className="py-3.5 bg-surface border border-surface-border text-foreground/60 hover:text-red-500 font-black rounded-xl uppercase text-xs tracking-widest transition-colors cursor-pointer"
                                            onClick={async () => {
                                                const input = document.getElementById('broadcast-input') as HTMLInputElement;
                                                if (input) {
                                                    try {
                                                        input.value = '';
                                                        const response = await fetch('/api/admin/system', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            credentials: 'include',
                                                            body: JSON.stringify({
                                                                maintenanceMode: settings?.maintenanceMode,
                                                                activeFeatures: settings?.activeFeatures,
                                                                globalNotice: null
                                                            })
                                                        });
                                                        if (response.ok) {
                                                            const data = await response.json();
                                                            setSettings(data);
                                                            toast.success('Broadcast protocols deactivated.');
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }
                                            }}
                                        >
                                            CLEAR NOTICE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. FEATURE FLAGS */}
                        <div className="space-y-6 pb-16">
                            <div className="border-b border-dashed border-surface-border/60 pb-3.5">
                                <h3 className="text-xs font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Active Service Protocols</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {['MARKET', 'MARKET_ACTIONS', 'PULSE', 'ESCROW', 'VENDOR'].map((feature) => {
                                    const active = settings?.activeFeatures.includes(feature);
                                    return (
                                        <button
                                            key={feature}
                                            onClick={() => toggleFeature(feature)}
                                            className={cn(
                                                "p-5 rounded-3xl border transition-all text-left group cursor-pointer shadow-sm relative overflow-hidden",
                                                active
                                                    ? 'bg-primary/10 border-primary/20'
                                                    : 'bg-surface border-surface-border/80 opacity-60 hover:opacity-100 hover:border-surface-border'
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-wider",
                                                    active ? 'text-primary font-black' : 'text-foreground/50'
                                                )}>{feature.replace('_', ' ')}</span>
                                                <div className={cn(
                                                    "w-2.5 h-2.5 rounded-full shrink-0",
                                                    active ? 'bg-primary shadow-[0_0_10px_var(--primary)]' : 'bg-surface-border'
                                                )}></div>
                                            </div>
                                            <div className={cn(
                                                "h-1.5 w-full rounded-full mt-3",
                                                active ? 'bg-primary/30' : 'bg-surface-border/50'
                                            )}>
                                                <div className={cn(
                                                    "h-full bg-primary rounded-full transition-all",
                                                    active ? 'w-full' : 'w-0'
                                                )}></div>
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
                    <div className="space-y-6">
                        <div className="bg-surface border border-surface-border/80 rounded-[2rem] p-6 relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-transparent" />
                            <form onSubmit={handleUserSearch} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="SEARCH EMAIL, NAME..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-background border border-surface-border text-foreground rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-primary/50 uppercase placeholder:text-foreground/20 font-bold"
                                />
                                <button type="submit" className="px-6 bg-primary text-black rounded-2xl font-black text-xs uppercase hover:brightness-110 active:scale-95 transition-all cursor-pointer">
                                    SEARCH
                                </button>
                            </form>
                        </div>

                        <div className="space-y-3">
                            {users.length === 0 ? (
                                <div className="text-center py-16 bg-surface border border-surface-border/80 rounded-[2rem] relative overflow-hidden">
                                    <div className="text-4xl mb-3 opacity-20">👤</div>
                                    <p className="text-xs font-black text-foreground/80 uppercase tracking-widest">No users found</p>
                                    <p className="text-[10px] text-foreground/45 uppercase tracking-wider mt-2">Zero query matches found in terminal registers.</p>
                                </div>
                            ) : (
                                users.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className="bg-surface border border-surface-border/80 p-5 rounded-[1.5rem] hover:border-primary/50 transition-all cursor-pointer group shadow-sm relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-wider">{u.name}</p>
                                                <p className="text-[9px] text-foreground/40 font-mono mt-1">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-surface-border/50 text-foreground/70 border border-surface-border'}`}>
                                                    {u.role}
                                                </span>
                                                <span className="text-[10px] font-black text-primary font-mono">₵{(u.balance || 0).toFixed(2)}</span>
                                                <span className="text-foreground/30 text-xs font-mono group-hover:translate-x-1 transition-transform">→</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* POWER CARD MODAL */}
                        {selectedUser && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedUser(null)}>
                                <div className="bg-[#0A0A0A] border border-surface-border w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                                    {/* Header */}
                                    <div className="p-6 border-b border-surface-border flex justify-between items-start bg-black/50 relative">
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedUser.name}</h2>
                                            <p className="text-[10px] text-zinc-500 font-mono tracking-wider mt-1">{selectedUser.email}</p>
                                        </div>
                                        <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer">✕</button>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 space-y-6 relative font-mono">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-black/40 rounded-2xl border border-surface-border">
                                                <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5 font-black">Wallet Assets</div>
                                                <div className="text-base font-black text-green-400">
                                                    ₵{(selectedUser.walletFrozen ? (selectedUser.frozenBalance || 0) : selectedUser.balance).toFixed(2)}
                                                    {selectedUser.walletFrozen && <span className="text-[9px] text-red-500 block"> (FROZEN)</span>}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-black/40 rounded-2xl border border-surface-border">
                                                <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5 font-black">Clearance Level</div>
                                                <div className={`text-base font-black uppercase ${selectedUser.role === 'ADMIN' ? 'text-red-500' : 'text-white'}`}>
                                                    {selectedUser.role}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Override Protocols</p>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleUserAction(selectedUser.id, 'SET_ROLE', 'VENDOR')}
                                                    className="py-3.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl font-black text-[9px] uppercase hover:bg-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
                                                >
                                                    Grant Vendor
                                                </button>
                                                <button
                                                    onClick={() => handleUserAction(selectedUser.id, 'SET_ROLE', 'ADMIN')}
                                                    className="py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[9px] uppercase hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
                                                >
                                                    Promote Admin
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleUserAction(selectedUser.id, selectedUser.walletFrozen ? 'UNFREEZE_WALLET' : 'FREEZE_WALLET')}
                                                className={`w-full py-4 border rounded-2xl font-black text-[9px] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${selectedUser.walletFrozen
                                                    ? 'bg-green-950/30 text-green-400 border-green-900/50 hover:bg-green-950/50 hover:text-green-500'
                                                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:bg-red-950/30 hover:text-red-500 hover:border-red-900/50'
                                                    }`}
                                            >
                                                <span>{selectedUser.walletFrozen ? '🔓' : '❄️'}</span>
                                                {selectedUser.walletFrozen ? 'Unfreeze Wallet' : 'Emergency Freeze Assets'}
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    if (selectedUser.banned) {
                                                        handleUserAction(selectedUser.id, 'UNBAN_USER');
                                                    } else {
                                                        const reason = await modal.prompt('Reason for ban (optional):', 'Ban User');
                                                        if (reason !== null) {
                                                            handleUserAction(selectedUser.id, 'BAN_USER', reason || 'Banned by administrator');
                                                        }
                                                    }
                                                }}
                                                className={`w-full py-4 border rounded-2xl font-black text-[9px] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer ${selectedUser.banned
                                                    ? 'bg-green-950/30 text-green-400 border-green-900/50 hover:bg-green-950/50 hover:text-green-500'
                                                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:bg-red-950/30 hover:text-red-500 hover:border-red-900/50'
                                                    }`}
                                            >
                                                <span>{selectedUser.banned ? '✅' : '🚫'}</span>
                                                {selectedUser.banned ? 'Unban User' : 'Ban User'}
                                            </button>

                                            <div className="pt-4 border-t border-surface-border space-y-3">
                                                <button
                                                    onClick={() => handleImpersonate(selectedUser.id)}
                                                    className="w-full py-4 bg-primary text-black rounded-2xl font-black text-xs uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <span>👁️</span> View as User (Read-Only)
                                                </button>

                                                <button
                                                    onClick={async () => {
                                                        if (await modal.confirm('PERMANENTLY DELETE USER? This cannot be undone. All data (orders, products) will be wiped.', 'DANGER: DELETE USER', true)) {
                                                            handleUserAction(selectedUser.id, 'DELETE_USER');
                                                        }
                                                    }}
                                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all active:scale-95 cursor-pointer"
                                                >
                                                    ⚠️ DELETE USER & DATA
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SIGNALS TAB */}
                {activeTab === 'SIGNALS' && (
                    <div className="space-y-6 pb-20">
                        <div className="flex justify-between items-end border-b border-dashed border-surface-border/60 pb-4">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <span>📡</span> Signal Intelligence
                            </h2>
                            <span className="text-[10px] text-foreground/45 font-black uppercase tracking-widest">{signals.length} intercepted</span>
                        </div>

                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {signals.length === 0 ? (
                                <div className="col-span-full py-24 text-center bg-surface border border-surface-border/80 rounded-[2.5rem] relative overflow-hidden">
                                    <div className="text-4xl mb-3 opacity-20">📭</div>
                                    <div className="text-xs font-black text-foreground/80 uppercase tracking-widest">No signals intercepted</div>
                                    <p className="text-[10px] text-foreground/45 uppercase tracking-wider mt-2">Zero transmission interceptions registered in logs.</p>
                                </div>
                            ) : (
                                signals.map(signal => (
                                    <div key={signal.id} className="bg-surface border border-surface-border/80 p-6 rounded-[2rem] relative group hover:border-primary/50 transition-all flex flex-col justify-between min-h-[220px] shadow-sm overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 to-transparent" />
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-black text-foreground text-xs uppercase tracking-wider mb-1">{signal.userName.split('(')[0]}</h3>
                                                    <p className="text-[9px] text-foreground/45 font-mono">{signal.userName.includes('(') ? signal.userName.split('(')[1].replace(')', '') : 'No Contact'}</p>
                                                    <p className="text-[8px] text-primary font-mono mt-1.5 uppercase tracking-widest">{new Date(signal.createdAt).toLocaleString()}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteSignal(signal.id); }}
                                                    className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer text-xs"
                                                    title="Delete Signal"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            <div className="bg-background/80 p-4 rounded-2xl border border-surface-border/80 h-full mt-2">
                                                <p className="text-foreground/70 text-[10px] font-mono whitespace-pre-wrap leading-relaxed">
                                                    {signal.content}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center pt-3 border-t border-dashed border-surface-border/40">
                                            <span className={`text-[8px] uppercase font-black px-2.5 py-1 rounded-full ${signal.status === 'OPEN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                {signal.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* VENDORS TAB */}
                {activeTab === 'VENDORS' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-dashed border-surface-border/60 pb-4">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <span>🏪</span> Vetting Protocol
                            </h2>
                            <span className="text-[10px] font-black text-foreground/45 uppercase tracking-widest">{vendors.length} pending</span>
                        </div>

                        {vendors.length === 0 ? (
                            <div className="bg-surface border border-surface-border/80 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
                                <div className="text-4xl mb-4 opacity-20">🏪</div>
                                <p className="text-xs font-black text-foreground/80 uppercase tracking-widest">No pending vendor applications</p>
                                <p className="text-[10px] text-foreground/45 uppercase mt-2">System registration queues are currently clean.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {vendors.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        className="bg-surface border border-surface-border/80 p-6 rounded-[2rem] hover:border-primary/50 transition-all shadow-sm relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center text-lg">
                                                    🏪
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-black text-foreground uppercase tracking-tight">
                                                        {vendor.shopName}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                        <span className="text-[9px] font-mono text-yellow-500 uppercase tracking-wider">
                                                            📍 {vendor.shopLandmark}
                                                        </span>
                                                        <span className="w-1 h-1 bg-surface-border rounded-full"></span>
                                                        <span className="text-[9px] font-mono text-foreground/60 uppercase tracking-wider">
                                                            👤 {vendor.name}
                                                        </span>
                                                    </div>
                                                    {vendor.email && (
                                                        <p className="text-[9px] text-foreground/40 mt-1 font-mono">{vendor.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 border-t border-dashed border-surface-border/60 pt-4">
                                            <button
                                                disabled={!!actionLoading}
                                                onClick={() => handleVendorAction(vendor.id, 'REJECT')}
                                                className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-30 cursor-pointer"
                                            >
                                                Deny
                                            </button>
                                            <button
                                                disabled={!!actionLoading}
                                                onClick={() => handleVendorAction(vendor.id, 'APPROVE')}
                                                className="flex-1 py-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all disabled:opacity-30 cursor-pointer animate-pulse"
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

                {/* APPLICATIONS TAB */}
                {activeTab === 'APPLICATIONS' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-dashed border-surface-border/60 pb-4">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <span>📄</span> Promotion Pipeline
                            </h2>
                            <span className="text-[10px] font-black text-foreground/45 uppercase tracking-widest">{applications.length} requests</span>
                        </div>

                        {applications.length === 0 ? (
                            <div className="bg-surface border border-surface-border/80 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
                                <div className="text-4xl mb-4 opacity-20">📂</div>
                                <p className="text-xs font-black text-foreground/80 uppercase tracking-widest">No pending applications</p>
                                <p className="text-[10px] text-foreground/45 uppercase mt-2">Zero escalation reports active in registry.</p>
                            </div>
                        ) : (
                            applications.map(app => (
                                <div key={app.id} className="bg-surface border border-surface-border/80 p-6 rounded-[2rem] relative overflow-hidden shadow-sm space-y-4">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{app.shopName}</h3>
                                            <p className="text-[9px] text-primary font-mono mt-1 uppercase tracking-wider">{app.user.name} ({app.user.email})</p>
                                        </div>
                                        <div className="text-[8px] text-foreground/40 bg-background border border-surface-border px-2.5 py-1.5 rounded-full font-mono font-bold uppercase tracking-wider">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="bg-background/80 p-4 rounded-2xl border border-surface-border/80">
                                        <p className="text-[8px] text-foreground/40 uppercase tracking-widest mb-1.5 font-black">PROMOTION JUSTIFICATION</p>
                                        <p className="text-[10px] text-foreground/80 font-medium italic font-sans leading-relaxed">"{app.shopDesc}"</p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            onClick={() => handleDeleteApplication(app.id)}
                                            className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApproveApplication(app.id)}
                                            className="px-5 py-2.5 bg-primary text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:brightness-110 transition-transform cursor-pointer"
                                        >
                                            Approve & Promote
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'TESTING' && (
                    <div className="space-y-6 pb-20">
                        <div className="border-b border-dashed border-surface-border/60 pb-4">
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                                <span>🔧</span> System Diagnostics
                            </h2>
                            <p className="text-[9px] text-foreground/40 font-black uppercase tracking-[0.25em] mt-1.5">Integrate and test notification payloads & Wigal SMS uplinks</p>
                        </div>

                        {/* Push Notification Panel */}
                        <div className="bg-surface border border-surface-border/80 p-6 sm:p-8 rounded-[2rem] space-y-4 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 to-transparent" />
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🔔</span>
                                <h3 className="font-black text-xs uppercase tracking-widest text-primary">Web Push Payload Test</h3>
                            </div>
                            <p className="text-[10px] text-foreground/45 leading-relaxed font-bold uppercase tracking-wider font-mono">
                                Sends a targeted VAPID payload to the designated user terminal.
                            </p>

                            <div className="space-y-4 pt-2 font-mono">
                                <div>
                                    <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest block mb-1.5">Designate Recipient</label>
                                    <select
                                        value={testPushUser}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setTestPushUser(val);
                                            const found = users.find(u => u.id === val);
                                            if (found?.phoneNumber) {
                                                setTestSmsPhone(found.phoneNumber);
                                            }
                                        }}
                                        className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:border-primary/50 cursor-pointer uppercase font-black"
                                    >
                                        <option value="" className="bg-background text-foreground/40">-- SELECT TARGET USER --</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id} className="bg-background text-foreground font-black uppercase text-[10px]">
                                                {u.name || 'Unnamed'} ({u.email}) {u.phoneNumber ? `· ${u.phoneNumber}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest block mb-1.5">Alert Header</label>
                                        <input
                                            type="text"
                                            value={testPushTitle}
                                            onChange={(e) => setTestPushTitle(e.target.value)}
                                            placeholder="Notification Title"
                                            className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/50 uppercase font-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest block mb-1.5">Action Redirect (URL Path)</label>
                                        <input
                                            type="text"
                                            value={testPushUrl}
                                            onChange={(e) => setTestPushUrl(e.target.value)}
                                            placeholder="e.g. /orders"
                                            className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/50 font-mono"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest block mb-1.5">Alert Payload Content</label>
                                    <textarea
                                        value={testPushBody}
                                        onChange={(e) => setTestPushBody(e.target.value)}
                                        rows={2}
                                        placeholder="Enter notification message..."
                                        className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none font-sans font-bold"
                                    />
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!testPushUser || !testPushBody) {
                                            toast.error('Recipient and message body are required');
                                            return;
                                        }
                                        setTestPushLoading(true);
                                        try {
                                            const res = await fetch('/api/admin/communicate', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    channel: 'PUSH',
                                                    mode: 'SINGLE',
                                                    recipient: testPushUser,
                                                    message: testPushBody,
                                                    title: testPushTitle,
                                                    url: testPushUrl
                                                })
                                            });
                                            const data = await res.json();
                                            if (res.ok && data.success) {
                                                toast.success(`Success: Sent to ${data.sentCount} / ${data.totalSubCount} registered devices!`);
                                            } else {
                                                toast.error(`Failed: ${data.error || 'Unknown error'}`);
                                            }
                                        } catch (e) {
                                            toast.error('Failed to communicate with system uplink');
                                        } finally {
                                            setTestPushLoading(false);
                                        }
                                    }}
                                    disabled={testPushLoading}
                                    className="w-full py-3.5 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {testPushLoading ? 'TRANSMITTING...' : 'SEND WEB PUSH'}
                                </button>
                            </div>
                        </div>

                        {/* SMS Testing Panel */}
                        <div className="bg-surface border border-surface-border/80 p-6 sm:p-8 rounded-[2rem] space-y-4 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500/30 to-transparent" />
                            <div className="flex items-center gap-3">
                                <span className="text-lg">💬</span>
                                <h3 className="font-black text-xs uppercase tracking-widest text-yellow-500">Wigal SMS Transmission Uplink</h3>
                            </div>
                            <p className="text-[10px] text-foreground/45 leading-relaxed font-bold uppercase tracking-wider font-mono">
                                Dispatches clean SMS streams via Frog API gateways. Header: "LaHustle".
                            </p>

                            <div className="space-y-4 pt-2 font-mono">
                                <div>
                                    <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest block mb-1.5">Destination Terminal</label>
                                    <input
                                        type="tel"
                                        value={testSmsPhone}
                                        onChange={(e) => setTestSmsPhone(e.target.value)}
                                        placeholder="e.g. 054XXXXXXX or 233XXXXXXXXX"
                                        className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-yellow-500/50 font-black"
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest block mb-1.5">SMS Payload Content</label>
                                    <textarea
                                        value={testSmsMessage}
                                        onChange={(e) => setTestSmsMessage(e.target.value)}
                                        rows={2}
                                        placeholder="Type SMS text..."
                                        className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-yellow-500/50 resize-none font-black"
                                    />
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!testSmsPhone || !testSmsMessage) {
                                            toast.error('Recipient phone and message content are required');
                                            return;
                                        }
                                        setTestSmsLoading(true);
                                        try {
                                            const res = await fetch('/api/admin/communicate', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    channel: 'SMS',
                                                    mode: 'SINGLE',
                                                    recipient: testSmsPhone,
                                                    message: testSmsMessage
                                                })
                                            });
                                            const data = await res.json();
                                            if (res.ok && data.success !== false) {
                                                toast.success('SMS successfully dispatched to gateway!');
                                            } else {
                                                toast.error(`Failed: ${data.error || 'Gateway response failed'}`);
                                            }
                                        } catch (e) {
                                            toast.error('Failed to communicate with SMS system');
                                        } finally {
                                            setTestSmsLoading(false);
                                        }
                                    }}
                                    disabled={testSmsLoading}
                                    className="w-full py-3.5 bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {testSmsLoading ? 'TRANSMITTING...' : 'DISPATCH SMS'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
