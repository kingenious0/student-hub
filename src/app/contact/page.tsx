'use client';

import { useState } from 'react';
import { Send, MessageSquare, CheckCircle, Mail, Phone, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Order Inquiries');
    const [orderId, setOrderId] = useState('');
    const [message, setMessage] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/support/ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message, orderId: orderId || undefined }),
            });

            if (res.ok) {
                setIsSubmitted(true);
                toast.success('Support ticket successfully transmitted to LaHustle Command.');
                setName('');
                setEmail('');
                setMessage('');
                setOrderId('');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to submit support ticket.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error. Unable to connect to support ledger.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-24 px-4 sm:px-6 md:px-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Header & Status Indicator */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-surface-border pb-10">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                            ⚡ Operations Center
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-primary">
                            Contact Command
                        </h1>
                        <p className="text-lg md:text-xl text-foreground/60 max-w-xl font-medium">
                            Reach out to our support squad. We monitor incoming transmissions 24/7.
                        </p>
                    </div>

                    {/* System Status Banner */}
                    <div className="glass border border-surface-border rounded-2xl p-4 flex items-center gap-3 shrink-0 shadow-lg select-none">
                        <div className="relative flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-none">SYSTEM STATUS</div>
                            <div className="text-xs font-black uppercase text-foreground/95 tracking-wide mt-1">Operational & Online</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Information Column (Left) */}
                    <div className="space-y-6">
                        <div className="bg-surface/30 border border-surface-border rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Direct Channels</h3>
                            
                            <div className="space-y-4 font-semibold text-xs text-foreground/80">
                                <a href="mailto:LaHustleghana@gmail.com" className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-surface-border/50 hover:border-primary/30 transition-all">
                                    <Mail className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-[9px] text-foreground/40 uppercase tracking-wider mb-0.5">Email Support</div>
                                        <div>LaHustleghana@gmail.com</div>
                                    </div>
                                </a>
                                
                                <a href="tel:0597626090" className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-surface-border/50 hover:border-primary/30 transition-all">
                                    <Phone className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-[9px] text-foreground/40 uppercase tracking-wider mb-0.5">Hotline Desk</div>
                                        <div>+233 59 762 6090</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Hours & Hub Location */}
                        <div className="bg-surface/30 border border-surface-border rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-md">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Hub Operations</h3>
                            
                            <div className="space-y-4 text-xs font-semibold text-foreground/80">
                                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-surface-border/50">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-[9px] text-foreground/40 uppercase tracking-wider mb-0.5">Active Hours</div>
                                        <div>08:00 AM - 10:00 PM Daily</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-surface-border/50">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-[9px] text-foreground/40 uppercase tracking-wider mb-0.5">HQ Campus Hub</div>
                                        <div>Legon, Accra, Ghana</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Form Column (Right - Spans 2) */}
                    <div className="lg:col-span-2">
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                            
                            <AnimatePresence mode="wait">
                                {!isSubmitted ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                                            <MessageSquare className="text-primary w-5 h-5" />
                                            Transmit Support Ticket
                                        </h2>
                                        
                                        <form onSubmit={handleContactSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Name</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-background border border-surface-border rounded-xl p-3.5 text-xs focus:border-primary outline-none text-foreground font-semibold"
                                                        placeholder="Your full name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Email</label>
                                                    <input 
                                                        type="email" 
                                                        className="w-full bg-background border border-surface-border rounded-xl p-3.5 text-xs focus:border-primary outline-none text-foreground font-semibold"
                                                        placeholder="Your email address"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Subject</label>
                                                    <select 
                                                        className="w-full bg-background border border-surface-border rounded-xl p-3.5 text-xs focus:border-primary outline-none text-foreground font-semibold"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                    >
                                                        <option>Order Inquiries</option>
                                                        <option>Payment Issues</option>
                                                        <option>Vendor Support</option>
                                                        <option>Bug Report</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Order ID <span className="text-foreground/30 font-medium">(Optional)</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-background border border-surface-border rounded-xl p-3.5 text-xs focus:border-primary outline-none text-foreground font-mono font-semibold"
                                                        placeholder="#abcdef12"
                                                        value={orderId}
                                                        onChange={(e) => setOrderId(e.target.value)}
                                                    />
                                                </div>
                                            </div>
 
                                            <div>
                                                <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Message Details</label>
                                                <textarea 
                                                    className="w-full bg-background border border-surface-border rounded-xl p-3.5 text-xs h-36 focus:border-primary outline-none resize-none text-foreground font-semibold" 
                                                    placeholder="Describe your request or details in detail so our squad can assist..."
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>
 
                                            <button 
                                                disabled={isSubmitting}
                                                type="submit"
                                                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] py-4 rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-xs cursor-pointer disabled:opacity-50"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <Send className="w-3.5 h-3.5" />
                                                        Send Transmission
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-16 text-center space-y-6"
                                    >
                                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-pulse-glow" />
                                        <div className="space-y-2">
                                            <h3 className="font-black uppercase tracking-tight text-xl">Transmission Received</h3>
                                            <p className="text-xs text-foreground/60 leading-relaxed font-semibold">
                                                Our team has been briefed on the issue. We'll deploy support parameters to your email shortly.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="px-6 py-2.5 bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all border border-surface-border cursor-pointer"
                                        >
                                            Submit Another Ticket
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
