'use client';

import { useState, useEffect } from 'react';
import { Send, Search, Phone, Check, User, Shield, MessageSquare, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 } 
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto pt-20 space-y-12"
            >
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
                        </Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter">Comms Uplink</h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Target Selection & Broadcast</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">

                    {/* LEFT PANEL: User Selection */}
                    <motion.div 
                        variants={cardVariants}
                        className="lg:col-span-2 bg-surface border border-surface-border rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                        <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                        
                        <div className="p-6 border-b border-dashed border-surface-border/60 space-y-6">
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                                    <input
                                        type="text"
                                        placeholder="Search entities..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-background border-2 border-surface-border rounded-2xl pl-11 pr-4 py-3 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-primary text-foreground placeholder-foreground/30"
                                    />
                                </div>
                                <div className="flex bg-background border border-surface-border rounded-2xl p-1 shrink-0">
                                    {['ALL', 'STUDENT', 'VENDOR'].map(role => (
                                        <button
                                            key={role}
                                            onClick={() => setRoleFilter(role as any)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                                roleFilter === role ? 'bg-primary text-black shadow-sm' : 'hover:bg-foreground/5 text-foreground/50'
                                            )}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between font-bold text-xs">
                                <button
                                    onClick={() => handleSelectAll(filteredUsers)}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer"
                                >
                                    {['Select All', 'Deselect All'][Number(filteredUsers.every(u => selectedPhones.has(u.phoneNumber)))]} Visible ({filteredUsers.length})
                                </button>
                                <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                    {selectedPhones.size} Selected
                                </div>
                            </div>
                        </div>

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 max-h-[500px]">
                            {loadingUsers ? (
                                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-20 opacity-40 text-xs font-black uppercase tracking-widest">No signals found</div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredUsers.map(user => {
                                        const isSelected = selectedPhones.has(user.phoneNumber);
                                        return (
                                            <div
                                                key={user.id}
                                                onClick={() => handleToggleSelect(user.phoneNumber)}
                                                className={cn(
                                                    "p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all",
                                                    isSelected
                                                        ? 'bg-primary/5 border-primary shadow-[inset_0_0_10px_rgba(37,99,235,0.05)]'
                                                        : 'bg-background border-surface-border hover:border-foreground/20'
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                                        isSelected ? 'bg-primary border-primary' : 'border-foreground/25'
                                                    )}>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-sm text-foreground uppercase tracking-tight">{user.name}</div>
                                                        <div className="text-[10px] text-foreground/45 flex items-center gap-2 font-bold uppercase">
                                                            <span className={user.role === 'VENDOR' ? 'text-orange-500' : 'text-blue-500'}>{user.role}</span>
                                                            <span className="h-1.5 w-1.5 bg-foreground/20 rounded-full"></span>
                                                            <span className="font-mono">{user.phoneNumber}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {user.vendorStatus !== 'NOT_APPLICABLE' && (
                                                    <div className="text-[9px] px-2.5 py-1 rounded-xl bg-foreground/[0.04] border border-surface-border font-black uppercase tracking-wider opacity-60">
                                                        {user.vendorStatus}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT PANEL: Composition and Send */}
                    <motion.div 
                        variants={cardVariants}
                        className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-2xl relative"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-emerald-500" />
                        <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                        
                        <div className="flex-1 space-y-6">
                            {/* Mode Toggle */}
                            <div className="space-y-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Transmission Mode</span>
                                <div className="flex bg-background border border-surface-border rounded-2xl p-1">
                                    <button
                                        onClick={() => setUseManual(false)}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                            !useManual ? 'bg-primary text-black shadow-md' : 'text-foreground/50 hover:bg-foreground/5'
                                        )}
                                    >
                                        Selection
                                    </button>
                                    <button
                                        onClick={() => setUseManual(true)}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                            useManual ? 'bg-primary text-black shadow-md' : 'text-foreground/50 hover:bg-foreground/5'
                                        )}
                                    >
                                        Manual
                                    </button>
                                </div>
                            </div>

                            {/* Recipients Display */}
                            <div className="relative">
                                {useManual ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Target Phone</label>
                                        <input
                                            type="tel"
                                            value={manualPhone}
                                            onChange={(e) => setManualPhone(e.target.value)}
                                            placeholder="Enter phone number..."
                                            className="w-full bg-background border-2 border-surface-border rounded-2xl p-4 font-mono font-bold text-sm focus:border-primary outline-none text-foreground"
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-background border-2 border-surface-border rounded-2xl p-5 min-h-[80px] flex items-center justify-center">
                                        {selectedPhones.size === 0 ? (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/25">Select targets from list</span>
                                        ) : (
                                            <div className="text-center">
                                                <div className="text-3xl font-black text-primary font-mono tracking-tight">{selectedPhones.size}</div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mt-1">Recipients Selected</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="flex flex-col space-y-1.5">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Payload Message</h3>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type secure broadcast message..."
                                    className="w-full bg-background border-2 border-surface-border rounded-2xl p-4 text-xs font-bold focus:border-primary outline-none resize-none min-h-[160px] text-foreground"
                                />
                                <div className="text-right text-[10px] font-mono text-foreground/45 font-bold">
                                    {message.length} CHARS
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 space-y-4">
                            <button
                                onClick={handleSend}
                                disabled={sending || (!useManual && selectedPhones.size === 0) || !message}
                                className={cn(
                                    "w-full py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg",
                                    sending || (!useManual && selectedPhones.size === 0) || !message
                                        ? 'bg-foreground/10 text-foreground/25 cursor-not-allowed border border-surface-border/50'
                                        : 'bg-primary text-black hover:scale-[1.02] active:scale-95 shadow-primary/10'
                                )}
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{sending ? 'TRANSMITTING...' : 'SEND MESSAGE'}</span>
                            </button>

                            <AnimatePresence>
                                {status && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={cn(
                                            "p-3.5 rounded-2xl flex items-center justify-center gap-2 text-center text-xs font-black uppercase border",
                                            status.type === 'success' 
                                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500' 
                                                : 'bg-red-500/10 border-red-500/25 text-red-500'
                                        )}
                                    >
                                        {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                        <span className="tracking-wide text-[9px]">{status.text}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
