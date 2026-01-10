// src/app/orders/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAdmin } from '@/context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import OmniDialog from '@/components/ui/OmniDialog';

// --- Interfaces ---
interface Order {
    id: string;
    status: string;
    escrowStatus: string;
    amount: number;
    createdAt: string;
    paidAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    updatedAt?: string;
    releaseKey: string | null;
    fulfillmentType?: string;
    product: {
        title: string;
        imageUrl: string | null;
    };
    vendor: {
        name: string | null;
        currentHotspot: string | null;
    };
}

// --- Icons & Helpers ---
const StatusIcon = ({ status, fulfillment }: { status: string, fulfillment?: string }) => {
    switch (status) {
        case 'PAID': return <span className="text-xl">🛡️</span>; // Escrow Secured
        case 'PREPARING': return <span className="text-xl">⚙️</span>; // Operational
        case 'READY': return <span className="text-xl">{fulfillment === 'DELIVERY' ? '⚡' : '📍'}</span>; // Zone/Transit
        case 'PICKED_UP': return <span className="text-xl">🏃</span>; // Runner Active
        case 'COMPLETED': return <span className="text-xl">✅</span>; // Success
        case 'CANCELLED': return <span className="text-xl">🚫</span>; // Aborted
        case 'REFUNDED': return <span className="text-xl">💸</span>; // Refunded
        default: return <span className="text-xl">📡</span>; // Pending loop
    }
};

const getStatusLabel = (status: string, fulfillment: string) => {
    switch (status) {
        case 'PAID': return 'Escrow Secured';
        case 'PREPARING': return 'Processing';
        case 'READY': return fulfillment === 'DELIVERY' ? 'Runner Dispatching' : 'Ready for Pickup';
        case 'PICKED_UP': return 'In Transit'; // Priority Status!
        case 'COMPLETED': return 'Mission Success';
        case 'CANCELLED': return 'Protocol Aborted';
        case 'REFUNDED': return 'Funds Returned';
        default: return 'Awaiting Uplink';
    }
};

// --- Components ---

// 1. Expanded Priority Card (The "Theater Mode" for Top Orders)
// Styles updated for Light/Dark Mode compatibility
const ExpandedPriorityCard = ({ order, handleCancel }: { order: Order, handleCancel: (id: string) => void }) => {
    const isTransit = order.status === 'PICKED_UP';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full bg-surface border border-surface-border rounded-[2rem] overflow-hidden shadow-xl dark:shadow-[0_0_40px_rgba(57,255,20,0.1)] mb-8"
        >
            {/* Live Map / Visual Header */}
            <div className="h-48 w-full bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden group">
                {order.product.imageUrl ? (
                    <img src={order.product.imageUrl} className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/5">
                        <span className="text-4xl opacity-20">📦</span>
                    </div>
                )}
                {/* Live Tracking overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase text-white/80 tracking-widest">Live Feed</span>
                    </div>
                </div>

                {/* Product Title Overlaid */}
                <div className="absolute bottom-4 left-6">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none shadow-black drop-shadow-lg">{order.product.title}</h2>
                    <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Vendor: {order.vendor.name}</p>
                </div>
            </div>

            {/* Tactical Body */}
            <div className="p-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 ${isTransit ? 'animate-pulse' : ''}`}>
                            <StatusIcon status={order.status} fulfillment={order.fulfillmentType} />
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Current Status</div>
                            <div className="text-lg font-black text-foreground uppercase tracking-tight">{getStatusLabel(order.status, order.fulfillmentType || 'PICKUP')}</div>
                        </div>
                    </div>
                    {/* Amount */}
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Value</div>
                        <div className="text-xl font-black text-foreground">₵{order.amount.toFixed(2)}</div>
                    </div>
                </div>

                {/* Secure Key Module */}
                {order.releaseKey && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-1 border border-zinc-200 dark:border-zinc-800 mb-6">
                        <div className="bg-white dark:bg-[#050505] rounded-xl p-4 flex items-center justify-between border border-zinc-200 dark:border-zinc-800/50">
                            <div>
                                <div className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mb-1">Secure Release Key</div>
                                <div className="text-3xl font-mono font-black text-foreground tracking-[0.15em] tabular-nums">
                                    {order.releaseKey.slice(0, 3)}-{order.releaseKey.slice(3)}
                                </div>
                            </div>
                            <button
                                onClick={() => { navigator.clipboard.writeText(order.releaseKey || ''); alert('Key copied to clipboard'); }}
                                className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                            >
                                📋
                            </button>
                        </div>
                        <div className="px-4 py-2 text-[10px] text-zinc-500 text-center font-medium">
                            Show this key to the runner/vendor ONLY when you have received the item.
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button className="flex-1 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs rounded-xl hover:opacity-90 transition-opacity">
                        Message Partner
                    </button>
                    <button
                        onClick={() => handleCancel(order.id)}
                        className="px-6 py-4 bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
                    >
                        Abort
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// 2. Condensed Status Strip (For Queue Items)
const CondensedOrderStrip = ({ order, onClick }: { order: Order, onClick: () => void }) => {
    return (
        <motion.div
            layoutId={`order-strip-${order.id}`}
            onClick={onClick}
            className="group w-full bg-surface backdrop-blur-md border border-surface-border hover:border-primary/20 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] mb-3 shadow-sm"
        >
            <div className="flex items-center gap-4">
                {/* Tiny Image Thumbnail */}
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                    {order.product.imageUrl && <img src={order.product.imageUrl} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/20"></div>
                </div>

                {/* Info */}
                <div>
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{order.product.title}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'READY' ? 'bg-primary animate-pulse' : 'bg-zinc-400 dark:bg-zinc-600'}`}></span>
                        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{getStatusLabel(order.status, order.fulfillmentType || 'PICKUP')}</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Arrow */}
            <div className="text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                ➔
            </div>
        </motion.div>
    );
};

// 3. Ledger Row (For Archive)
const LedgerRow = ({ order, onClick }: { order: Order, onClick: () => void }) => {
    const isSuccess = order.status === 'COMPLETED';

    return (
        <div
            onClick={onClick}
            className="flex items-center justify-between p-4 border-b border-surface-border hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${isSuccess ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                    {isSuccess ? '✓' : '✕'}
                </div>
                <div>
                    <div className="font-mono text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-sm font-bold text-foreground line-clamp-1">{order.product.title}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="font-mono text-sm text-foreground">₵{order.amount.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {new Date(order.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

import { toPng } from 'html-to-image';

// 4. Evidence Vault (Timeline Modal)
// Declare native interface
declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage: (message: string) => void;
        };
    }
}

const EvidenceVault = ({ order, onClose }: { order: Order, onClose: () => void }) => {
    const [copied, setCopied] = useState(false);
    const [showFormats, setShowFormats] = useState(false);
    const [generating, setGenerating] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    const timeline = [
        { label: 'Initialized', time: order.createdAt, done: true },
        { label: 'Funds Secured', time: order.paidAt, done: !!order.paidAt },
        { label: 'Picked Up', time: order.pickedUpAt, done: !!order.pickedUpAt },
        { label: 'Digital Handshake', time: order.deliveredAt || (order.status === 'COMPLETED' ? order.updatedAt : null), done: order.status === 'COMPLETED' },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(order.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadTxt = () => {
        const receiptContent = `
OMNI MARKETPLACE - DIGITAL RECEIPT
----------------------------------
Order ID:      ${order.id}
Date:          ${new Date(order.createdAt).toLocaleString()}
Status:        ${order.status}
----------------------------------
Item:          ${order.product.title}
Vendor:        ${order.vendor.name || 'Unknown'}
Amount:        ₵${order.amount.toFixed(2)}
----------------------------------
TIMELINE:
- Created:     ${new Date(order.createdAt).toLocaleString()}
${order.paidAt ? `- Paid:        ${new Date(order.paidAt).toLocaleString()}` : ''}
${order.pickedUpAt ? `- Picked Up:   ${new Date(order.pickedUpAt).toLocaleString()}` : ''}
${order.deliveredAt ? `- Delivered:   ${new Date(order.deliveredAt).toLocaleString()}` : ''}
----------------------------------
Thank you for using Omni.
Live. Learn. Earn.
        `.trim();

        const filename = `OMNI-Receipt-${order.id.slice(0, 8)}.txt`;

        if (window.ReactNativeWebView) {
            // Encode text to Base64 for native saving
            // alert('Saving Receipt to Device...'); // Debug feedback
            const base64 = btoa(unescape(encodeURIComponent(receiptContent))); // handle utf8
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'DOWNLOAD_BLOB',
                base64: base64,
                filename: filename,
                mimetype: 'text/plain'
            }));
            setShowFormats(false);
            return;
        }

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowFormats(false);
    };

    const handleDownloadImage = async () => {
        if (receiptRef.current) {
            setGenerating(true);
            try {
                // skipFonts: true avoids CORS SecurityError when reading external stylesheets
                const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3, skipFonts: true });
                const filename = `OMNI-Receipt-${order.id.slice(0, 8)}.png`;

                if (window.ReactNativeWebView) {
                    // alert('Saving Image to Device...'); // Debug feedback
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'DOWNLOAD_BLOB',
                        base64: dataUrl,
                        filename: filename,
                        mimetype: 'image/png'
                    }));
                } else {
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = dataUrl;
                    link.click();
                }
            } catch (err) {
                console.error('Failed to generate receipt image', err);
                alert('Could not generate image. Try TXT version.');
            } finally {
                setGenerating(false);
                setShowFormats(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-lg bg-surface border border-surface-border rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Acquisition Archive</h2>
                        <p className="text-xs text-zinc-500 font-mono mt-1">ID: #{order.id.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700">✕</button>
                </div>

                {/* Evidence Body */}
                <div className="p-6">
                    {/* Status Badge Big */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 ${order.status === 'COMPLETED' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        <span className="text-xs font-black uppercase tracking-widest">{order.status}</span>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-6 relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 ml-2">
                        {timeline.map((event, i) => (
                            <div key={i} className={`relative pl-6 ${event.done ? 'opacity-100' : 'opacity-30'}`}>
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${event.done ? 'bg-black dark:bg-white border-primary' : 'bg-zinc-200 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-700'}`}></div>
                                <div className="text-sm font-bold text-foreground uppercase tracking-wide">{event.label}</div>
                                {event.time && <div className="text-xs text-zinc-500 font-mono mt-0.5">{new Date(event.time).toLocaleString()}</div>}
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-4 h-16 items-center">
                        {!showFormats ? (
                            <>
                                <button
                                    onClick={handleCopy}
                                    className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    {copied ? '✅ Copied!' : 'Copy Evidence ID'}
                                </button>
                                <button
                                    onClick={() => setShowFormats(true)}
                                    className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase hover:opacity-90 transition-colors"
                                >
                                    Download Receipt
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <button
                                    onClick={handleDownloadTxt}
                                    className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-black uppercase hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    📄 TXT
                                </button>
                                <button
                                    onClick={handleDownloadImage}
                                    disabled={generating}
                                    className="flex-1 py-3 bg-[#39FF14] text-black rounded-xl text-xs font-black uppercase hover:bg-[#32d911] transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                                >
                                    {generating ? 'Wait...' : '🖼️ PNG'}
                                </button>
                                <button
                                    onClick={() => setShowFormats(false)}
                                    className="w-12 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                    aria-label="Cancel"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* HIDDEN RECEIPT TEMPLATE FOR IMAGE GEN */}
                <div className="absolute top-0 left-0 w-full z-[-50] opacity-0 pointer-events-none">
                    <div ref={receiptRef} className="w-[600px] bg-black text-white p-12 font-sans relative overflow-hidden border-8 border-black">
                        {/* Background Texture */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/30 via-black to-black"></div>

                        {/* Header */}
                        <div className="relative z-10 flex justify-between items-start mb-12 border-b border-white/10 pb-8">
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Omni Market</h1>
                                <p className="text-sm font-mono text-zinc-500">OFFICIAL DIGITAL RECEIPT</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[#39FF14] text-xl font-black">{order.status}</div>
                                <div className="text-zinc-500 text-xs font-mono mt-1">{new Date().toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="relative z-10 grid grid-cols-2 gap-8 mb-12">
                            <div>
                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Product Items</div>
                                <div className="text-2xl font-bold">{order.product.title}</div>
                                <div className="text-sm text-zinc-400 mt-1">Vendor: {order.vendor.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Value</div>
                                <div className="text-4xl font-black tracking-tight">₵{order.amount.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* ID Block */}
                        <div className="relative z-10 bg-zinc-900/50 p-6 rounded-2xl border border-white/10 mb-8 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Transaction ID</div>
                                <div className="font-mono text-lg tracking-widest text-[#39FF14]">{order.id.toUpperCase()}</div>
                            </div>
                            <div className="w-16 h-16 bg-white p-1 rounded-lg">
                                {/* Mock QR */}
                                <div className="w-full h-full bg-black/10 flex flex-wrap content-start">
                                    {[...Array(16)].map((_, i) => (
                                        <div key={i} className={`w-1/4 h-1/4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 pt-8 border-t border-white/10 text-center">
                            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-bold">Verified by Omni Secure Protocol</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


// --- MAIN PAGE ---
export default function OrdersPage() {
    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
    const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const hasAutoExpanded = useRef(false);

    // Dialog State
    const [cancelDialogState, setCancelDialogState] = useState<{ isOpen: boolean; orderId: string | null }>({
        isOpen: false,
        orderId: null
    });

    const executeCancellation = async () => {
        const orderId = cancelDialogState.orderId;
        if (!orderId) return;

        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                fetchOrders(true);
            } else {
                alert(data.error || 'Failed to abort');
            }
        } catch (error) {
            alert('Error aborting mission');
        }
    };

    const fetchOrders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/orders', { cache: 'no-store' });
            if (!response.ok) {
                if (response.status === 404) throw new Error('User not found. Try re-login.');
                throw new Error('Server error');
            }
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
                // Auto-expand logic (Only once per session mount)
                if (!silent && !hasAutoExpanded.current) {
                    const priority = data.orders.find((o: Order) => ['PICKED_UP', 'READY'].includes(o.status));
                    if (priority) {
                        setExpandedOrderId(priority.id);
                        hasAutoExpanded.current = true;
                    }
                }
            } else {
                setError(data.error || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setError(error instanceof Error ? error.message : 'Connection failed');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders(); // Initial load

        const refreshSilent = () => fetchOrders(true);

        window.addEventListener('focus', refreshSilent);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') refreshSilent();
        });

        return () => {
            window.removeEventListener('focus', refreshSilent);
            document.removeEventListener('visibilitychange', refreshSilent);
        };
    }, [fetchOrders]);

    const handleCancelOrder = (orderId: string) => {
        setCancelDialogState({ isOpen: true, orderId });
    };

    const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));
    const historyOrders = orders.filter(o => ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));

    // Sort Active: Priority (In Transit) -> Ready -> Others
    const sortedActive = [...activeOrders].sort((a, b) => {
        const score = (status: string) => {
            if (status === 'PICKED_UP') return 3;
            if (status === 'READY') return 2;
            if (status === 'PREPARING') return 1;
            return 0;
        };
        return score(b.status) - score(a.status);
    });

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-24 px-4 sm:px-6">

            {/* Header */}
            <div className="max-w-md mx-auto mb-8 text-center">
                <h1 className="text-2xl font-black uppercase tracking-tight text-foreground mb-2">Order Command Center</h1>
                <div className="flex bg-surface p-1 rounded-xl border border-surface-border shadow-sm">
                    <button
                        onClick={() => setActiveTab('ACTIVE')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'ACTIVE' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                        Active Acquisitions
                    </button>
                    <button
                        onClick={() => setActiveTab('ARCHIVE')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'ARCHIVE' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                        Acquisition Archive
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto">
                {error ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-surface border border-red-500/20 rounded-3xl mt-8 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-red-500 font-black uppercase tracking-widest mb-2">Signal Lost</h3>
                        <p className="text-zinc-500 text-xs mb-4">{error}</p>
                        <button onClick={() => fetchOrders()} className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90">
                            Retry Uplink
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* ACTIVE TAB */}
                        {activeTab === 'ACTIVE' && (
                            <AnimatePresence>
                                {sortedActive.length === 0 ? (
                                    <div className="text-center py-20 opacity-50">
                                        <div className="text-4xl mb-4">📡</div>
                                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">No Active Protocols</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Top Priority Card (Always expanded or first in list) */}
                                        {sortedActive.map((order, i) => {
                                            // If it's the expanded one OR (none expanded and it's the first one)
                                            const isExpanded = expandedOrderId === order.id || (!expandedOrderId && i === 0);

                                            if (isExpanded) {
                                                return <ExpandedPriorityCard key={order.id} order={order} handleCancel={handleCancelOrder} />;
                                            }
                                            return null;
                                        })}

                                        {/* The Stack (Condensed Strips) */}
                                        <div className="mt-8">
                                            {sortedActive.length > 1 && <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 px-2">In Queue</h3>}
                                            {sortedActive.map((order, i) => {
                                                const isExpanded = expandedOrderId === order.id || (!expandedOrderId && i === 0);
                                                if (!isExpanded) {
                                                    return (
                                                        <CondensedOrderStrip
                                                            key={order.id}
                                                            order={order}
                                                            onClick={() => setExpandedOrderId(order.id)}
                                                        />
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </>
                                )}
                            </AnimatePresence>
                        )}

                        {/* ARCHIVE TAB */}
                        {activeTab === 'ARCHIVE' && (
                            <div className="bg-surface border border-surface-border rounded-3xl overflow-hidden min-h-[50vh] shadow-sm">
                                {historyOrders.length === 0 ? (
                                    <div className="text-center py-20 text-zinc-500">
                                        <p className="text-xs font-black uppercase">Ledger is Empty</p>
                                    </div>
                                ) : (
                                    historyOrders.map(order => (
                                        <LedgerRow
                                            key={order.id}
                                            order={order}
                                            onClick={() => setSelectedHistoryOrder(order)}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {selectedHistoryOrder && (
                <EvidenceVault
                    order={selectedHistoryOrder}
                    onClose={() => setSelectedHistoryOrder(null)}
                />
            )}

            <OmniDialog
                isOpen={cancelDialogState.isOpen}
                onClose={() => setCancelDialogState({ ...cancelDialogState, isOpen: false })}
                onConfirm={executeCancellation}
                title="Abort Protocol?"
                message="This will immediately cancel the active order and refund funds to the student's escrow. This action cannot be undone."
                confirmLabel="Abort Mission"
                cancelLabel="Resume"
                variant="destructive"
            />
        </div>
    );
}
