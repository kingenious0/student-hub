'use client';

import { useState, useMemo } from 'react';
import { 
    ChevronDown, 
    Send, 
    MessageSquare, 
    HelpCircle, 
    Search, 
    CheckCircle, 
    Package, 
    Store, 
    User, 
    CreditCard,
    Activity,
    Mail,
    Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'orders' | 'vendors' | 'account' | 'payments';
}

const faqs: FAQItem[] = [
    {
        category: 'general',
        question: 'What is OMNI?',
        answer:
            'OMNI is an all-in-one campus marketplace that connects students with local vendors and student runners for seamless shopping and delivery within university ecosystems.',
    },
    {
        category: 'general',
        question: 'Is the platform safe?',
        answer:
            'Yes! We employ multiple security measures including encrypted payments via Paystack, verified student vendors, and a unique QR-code based escrow system.',
    },
    {
        category: 'orders',
        question: 'How do payments work?',
        answer:
            'We use a secure escrow system. When you pay, funds are held safely by OMNI. They are only released to the vendor when you scan the QR code upon delivery to confirm you have received your order.',
    },
    {
        category: 'orders',
        question: 'How do I become a runner?',
        answer:
            'Go to the Runner Dashboard from the main menu and toggle your status to "Online". You will need to complete a quick verification process to start receiving delivery missions.',
    },
    {
        category: 'payments',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major payment methods through Paystack, including Mobile Money (MTN, Telecel, AT), debit/credit cards, and bank transfers.',
    },
    {
        category: 'vendors',
        question: 'How can I sell on OMNI?',
        answer:
            'Click on "Become a Vendor" in the navigation menu, fill in your shop details, and submit your application. Our team reviews applications within 24 hours.',
    },
    {
        category: 'account',
        question: 'Can I use OMNI on multiple campuses?',
        answer:
            'Yes! You can switch your location in the header to see vendors and hubs at supported campuses like AAMUSTED, UPSA, etc.',
    },
];

export default function HelpPage() {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    
    // Support form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Order Inquiries');
    const [orderId, setOrderId] = useState('');
    const [message, setMessage] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            const matchesSearch = searchQuery === '' || 
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

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
                toast.success('Support ticket successfully transmitted to OMNI Command.');
                // Reset form fields
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

    const categories = [
        { id: 'all', label: 'All FAQs', icon: HelpCircle, color: 'text-primary' },
        { id: 'general', label: 'General', icon: Activity, color: 'text-blue-500' },
        { id: 'orders', label: 'Orders', icon: Package, color: 'text-yellow-500' },
        { id: 'vendors', label: 'Vendors', icon: Store, color: 'text-green-500' },
        { id: 'account', label: 'Account', icon: User, color: 'text-purple-500' },
        { id: 'payments', label: 'Payments', icon: CreditCard, color: 'text-rose-500' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-24 px-4 sm:px-6 md:px-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header & Status Indicator */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-primary">
                            Help Hub
                        </h1>
                        <p className="text-lg md:text-xl text-foreground/60 max-w-xl font-medium">
                            Everything you need to know about the OMNI ecosystem. Can't find it here? Contact our support squad.
                        </p>
                    </div>

                    {/* System Status Banner */}
                    <div className="glass border border-surface-border rounded-2xl p-4 flex items-center gap-3 shrink-0 shadow-lg select-none">
                        <div className="relative flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-none">OMNI NETWORK</div>
                            <div className="text-xs font-black uppercase text-foreground/95 tracking-wide mt-1">Systems Operational</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar Bento Section */}
                <div className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 glass shadow-lg flex flex-col md:flex-row gap-4 items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search questions, answers, support resources..."
                            className="w-full bg-background border border-surface-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary outline-none text-foreground placeholder:text-foreground/30 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Bento Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQ Area (Span 2) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Category Selectors */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                const isSelected = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setExpandedId(null);
                                        }}
                                        className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-24 ${
                                            isSelected
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                                : 'bg-surface border-surface-border hover:border-primary/40 hover:bg-surface/50'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-foreground' : cat.color}`} />
                                        <span className="font-black uppercase tracking-wider text-xs block leading-none">
                                            {cat.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* FAQ List */}
                        <div className="space-y-4 pt-2">
                            <AnimatePresence mode="popLayout">
                                {filteredFaqs.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-surface border border-surface-border rounded-[2rem] p-12 text-center"
                                    >
                                        <HelpCircle className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                                        <p className="font-bold text-foreground/40 uppercase tracking-widest text-xs">No matching FAQs detected.</p>
                                    </motion.div>
                                ) : (
                                    filteredFaqs.map((faq, idx) => (
                                        <motion.div 
                                            key={faq.question} 
                                            layout
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-surface border border-surface-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors"
                                        >
                                            <button
                                                onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                                                className="w-full px-6 py-5 text-left flex justify-between items-center group cursor-pointer"
                                            >
                                                <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors pr-4">{faq.question}</span>
                                                <ChevronDown className={`w-4 h-4 shrink-0 text-foreground/40 group-hover:text-primary transition-all duration-300 ${expandedId === idx ? 'rotate-180 text-primary' : ''}`} />
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {expandedId === idx && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="px-6 pb-5 text-xs sm:text-sm text-foreground/70 leading-relaxed border-t border-surface-border/50 pt-4">
                                                            {faq.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Support Ticket Submission Side Bar */}
                    <div className="space-y-6">
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 glass shadow-xl relative overflow-hidden">
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
                                            Transmit Ticket
                                        </h2>
                                        
                                        <form onSubmit={handleContactSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Name</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-background border border-surface-border rounded-xl p-3 text-xs focus:border-primary outline-none text-foreground font-semibold"
                                                        placeholder="Your name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Email</label>
                                                    <input 
                                                        type="email" 
                                                        className="w-full bg-background border border-surface-border rounded-xl p-3 text-xs focus:border-primary outline-none text-foreground font-semibold"
                                                        placeholder="Your email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Subject</label>
                                                    <select 
                                                        className="w-full bg-background border border-surface-border rounded-xl p-3 text-xs focus:border-primary outline-none text-foreground font-semibold"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                    >
                                                        <option>Order Inquiries</option>
                                                        <option>Payment Issues</option>
                                                        <option>Vendor Support</option>
                                                        <option>Runner Application</option>
                                                        <option>Bug Report</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Order ID <span className="text-foreground/30 font-medium">(Optional)</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full bg-background border border-surface-border rounded-xl p-3 text-xs focus:border-primary outline-none text-foreground font-mono font-semibold"
                                                        placeholder="#abcdef12"
                                                        value={orderId}
                                                        onChange={(e) => setOrderId(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[8px] font-black uppercase mb-1.5 tracking-wider text-foreground/45">Message Details</label>
                                                <textarea 
                                                    className="w-full bg-background border border-surface-border rounded-xl p-3 text-xs h-32 focus:border-primary outline-none resize-none text-foreground font-semibold" 
                                                    placeholder="Describe your issue or question in detail..."
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>

                                            <button 
                                                disabled={isSubmitting}
                                                type="submit"
                                                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] py-3.5 rounded-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-xs cursor-pointer disabled:opacity-50"
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
                                        className="py-12 text-center space-y-6"
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

                        {/* Direct Contacts Bento Box */}
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-md">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Direct Communication</h3>
                            <p className="text-xs text-foreground/60 font-semibold leading-relaxed">
                                Need emergency system assistance? Contact our central operations desk directly.
                            </p>
                            <div className="space-y-3 font-semibold text-xs text-foreground/80">
                                <a href="mailto:support@omni-student.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 border border-transparent hover:border-surface-border transition-all">
                                    <Mail className="w-4 h-4 text-primary" />
                                    support@omni-student.com
                                </a>
                                <a href="tel:0244795495" className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 border border-transparent hover:border-surface-border transition-all">
                                    <Phone className="w-4 h-4 text-primary" />
                                    +233 24 479 5495
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
