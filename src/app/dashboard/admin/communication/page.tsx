'use client';

import { useState, useEffect } from 'react';
import { SendIcon, UsersIcon, MessageSquareIcon, AlertCircleIcon, CheckCircleIcon, SearchIcon, PhoneIcon, CheckIcon, UserIcon, ShieldIcon } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunicationPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [manualPhone, setManualPhone] = useState('');
    const [useManual, setUseManual] = useState(false);

    // Selection State
    const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'VENDOR'>('ALL');

    // Message
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users.filter((u: any) => u.phoneNumber)); // Only users with phone
            }
        } catch (error) {
            console.error('Fetch failed');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleToggleSelect = (phone: string) => {
        const next = new Set(selectedPhones);
        if (next.has(phone)) next.delete(phone);
        else next.add(phone);
        setSelectedPhones(next);
    };

    const handleSelectAll = (filteredList: any[]) => {
        const next = new Set(selectedPhones);
        const allSelected = filteredList.every(u => next.has(u.phoneNumber));

        if (allSelected) {
            // Deselect these
            filteredList.forEach(u => next.delete(u.phoneNumber));
        } else {
            // Select these
            filteredList.forEach(u => next.add(u.phoneNumber));
        }
        setSelectedPhones(next);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setStatus(null);

        const recipients = useManual ? [manualPhone] : Array.from(selectedPhones);

        if (recipients.length === 0) {
            setStatus({ type: 'error', text: 'No recipients selected' });
            setSending(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/communicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: useManual ? 'SINGLE' : 'SELECTION',
                    recipient: useManual ? manualPhone : undefined, // For legacy SINGLE mode check
                    recipients: useManual ? undefined : recipients,
                    message
                })
            });
            const data = await res.json();

            if (data.success) {
                setStatus({ type: 'success', text: `Sent to ${recipients.length} target(s)` });
                setMessage('');
                if (useManual) setManualPhone('');
                else setSelectedPhones(new Set()); // Clear selection? Maybe separate button
            } else {
                setStatus({ type: 'error', text: data.error || 'Transmission Failed' });
            }
        } catch (error) {
            setStatus({ type: 'error', text: 'Network Uplink Failure' });
        } finally {
            setSending(false);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phoneNumber?.includes(searchTerm);
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto pt-20">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all">← Back to Command Center</Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">Comms Uplink</h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Target Selection & Broadcast</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-300px)] min-h-[600px]">

                    {/* LEFT PANEL: User Selection */}
                    <div className="lg:col-span-2 bg-surface border border-surface-border rounded-[2rem] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-surface-border">
                            {/* Controls */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                    <input
                                        type="text"
                                        placeholder="Search entities..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-background border border-surface-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex bg-background border border-surface-border rounded-xl p-1">
                                    {['ALL', 'STUDENT', 'VENDOR'].map(role => (
                                        <button
                                            key={role}
                                            onClick={() => setRoleFilter(role as any)}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === role ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-foreground/5'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => handleSelectAll(filteredUsers)}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                >
                                    {['Select All', 'Deselect All'][Number(filteredUsers.every(u => selectedPhones.has(u.phoneNumber)))]} Visible ({filteredUsers.length})
                                </button>
                                <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                    {selectedPhones.size} Selected
                                </div>
                            </div>
                        </div>

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loadingUsers ? (
                                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-20 opacity-40 text-xs font-black uppercase tracking-widest">No signals found</div>
                            ) : (
                                filteredUsers.map(user => {
                                    const isSelected = selectedPhones.has(user.phoneNumber);
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => handleToggleSelect(user.phoneNumber)}
                                            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected
                                                ? 'bg-primary/5 border-primary shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]'
                                                : 'bg-background border-surface-border hover:border-foreground/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-foreground/20'
                                                    }`}>
                                                    {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-foreground">{user.name}</div>
                                                    <div className="text-[10px] text-foreground/40 flex items-center gap-2">
                                                        <span className={user.role === 'VENDOR' ? 'text-orange-500' : 'text-blue-500'}>{user.role}</span>
                                                        <span>•</span>
                                                        <span className="font-mono">{user.phoneNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {user.vendorStatus !== 'NOT_APPLICABLE' && (
                                                <div className="text-[9px] px-2 py-1 rounded bg-foreground/5 font-black uppercase tracking-wider opacity-60">
                                                    {user.vendorStatus}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Composition and Send */}
                    <div className="bg-surface border border-surface-border rounded-[2rem] p-6 flex flex-col">
                        <div className="flex-1 space-y-6">
                            {/* Mode Toggle */}
                            <div className="space-y-3">
                                <span className="text-xs font-black uppercase tracking-widest text-foreground/40">Transmission Mode</span>
                                <div className="flex bg-background border border-surface-border rounded-xl p-1">
                                    <button
                                        onClick={() => setUseManual(false)}
                                        className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!useManual ? 'bg-foreground text-background shadow-sm' : 'text-foreground/40 hover:bg-foreground/5'
                                            }`}
                                    >
                                        List Selection
                                    </button>
                                    <button
                                        onClick={() => setUseManual(true)}
                                        className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${useManual ? 'bg-foreground text-background shadow-sm' : 'text-foreground/40 hover:bg-foreground/5'
                                            }`}
                                    >
                                        Manual Entry
                                    </button>
                                </div>
                            </div>

                            {/* Recipients Display */}
                            <div className="relative">
                                {useManual ? (
                                    <input
                                        type="tel"
                                        value={manualPhone}
                                        onChange={(e) => setManualPhone(e.target.value)}
                                        placeholder="Enter Phone Number..."
                                        className="w-full bg-background border-2 border-surface-border rounded-xl p-4 font-mono text-lg focus:border-primary outline-none"
                                    />
                                ) : (
                                    <div className="bg-background border-2 border-surface-border rounded-xl p-4 min-h-[60px] flex items-center justify-center">
                                        {selectedPhones.size === 0 ? (
                                            <span className="text-xs font-black uppercase tracking-widest text-foreground/20">Select targets from list</span>
                                        ) : (
                                            <div className="text-center">
                                                <div className="text-3xl font-black text-primary">{selectedPhones.size}</div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Recipients Selected</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-3">Payload</h3>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type secure broadcast message..."
                                    className="flex-1 w-full bg-background border-2 border-surface-border rounded-xl p-4 text-sm focus:border-primary outline-none resize-none min-h-[200px]"
                                />
                                <div className="text-right text-[10px] font-mono text-foreground/40 mt-2">
                                    {message.length} chars
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 space-y-4">
                            <button
                                onClick={handleSend}
                                disabled={sending || (!useManual && selectedPhones.size === 0) || !message}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${sending || (!useManual && selectedPhones.size === 0) || !message
                                    ? 'bg-foreground/10 cursor-not-allowed opacity-50'
                                    : 'bg-primary text-primary-foreground hover:scale-[1.02] shadow-xl lh-glow'
                                    }`}
                            >
                                {sending ? 'TRANSMITTING...' : 'SEND MESSAGE'}
                            </button>

                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 text-center ${status.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                                        }`}
                                >
                                    {status.type === 'success' ? <CheckCircleIcon className="w-4 h-4" /> : <AlertCircleIcon className="w-4 h-4" />}
                                    <span className="text-[10px] font-black uppercase tracking-wide">{status.text}</span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
