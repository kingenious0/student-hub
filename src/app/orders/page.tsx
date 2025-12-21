// src/app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';


interface Order {
    id: string;
    status: string;
    escrowStatus: string;
    amount: number;
    createdAt: string;
    releaseKey: string | null;
    product: {
        title: string;
        imageUrl: string | null;
    };
    vendor: {
        name: string | null;
        currentHotspot: string | null;
    };
    fulfillmentType?: string;
}

export default function OrdersPage() {
    const { user } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'COZY' | 'COMPACT' | 'GRID'>('COZY');
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));
    const historyOrders = orders.filter(o => ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));

    // Handle scroll lock for modal
    useEffect(() => {
        if (showHistory) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [showHistory]);

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Abort mission? If already paid, funds will be returned to your OMNI Balance.')) return;

        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchOrders(); // Refresh list
            } else {
                alert(data.error || 'Operation failed');
            }
        } catch (error) {
            alert('Error aborting mission');
        }
    };

    const getStatusInfo = (status: string, fulfillment: string) => {
        switch (status) {
            case 'PAID':
                return {
                    label: 'Escrow Secured',
                    desc: 'Funds held in OMNI Vault. Vendor notified.',
                    icon: '🛡️',
                    color: 'text-primary',
                    bgColor: 'bg-primary/10'
                };
            case 'PREPARING':
                return {
                    label: 'Operational',
                    desc: 'Partner is preparing your acquisition.',
                    icon: '⚙️',
                    color: 'text-primary',
                    bgColor: 'bg-primary/10'
                };
            case 'READY':
                return {
                    label: fulfillment === 'DELIVERY' ? 'In Transit' : 'In Landing Zone',
                    desc: fulfillment === 'DELIVERY'
                        ? 'Operation Runner dispatched to your sector.'
                        : 'Deploy to vendor location for handover.',
                    icon: fulfillment === 'DELIVERY' ? '⚡' : '📍',
                    color: 'text-primary',
                    bgColor: 'bg-primary/10'
                };
            case 'PICKED_UP':
                return {
                    label: 'Mobile Handover',
                    desc: 'Runner has secured the package.',
                    icon: '🏃',
                    color: 'text-primary',
                    bgColor: 'bg-primary/10'
                };
            case 'COMPLETED':
                return {
                    label: 'Mission Success',
                    desc: 'Transaction closed. Funds released.',
                    icon: '✅',
                    color: 'text-primary',
                    bgColor: 'bg-primary/10'
                };
            case 'PENDING':
                return {
                    label: 'Awaiting Uplink',
                    desc: 'Complete payment to authorize vendor.',
                    icon: '📡',
                    color: 'text-yellow-400',
                    bgColor: 'bg-yellow-400/10'
                };
            case 'CANCELLED':
            case 'REFUNDED':
                return {
                    label: status === 'REFUNDED' ? 'Protocol Refunded' : 'Protocol Aborted',
                    desc: 'Link terminated.',
                    icon: '🚫',
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10'
                };
            default:
                return {
                    label: 'Syncing',
                    desc: 'Status updating...',
                    icon: '🌀',
                    color: 'text-foreground/40',
                    bgColor: 'bg-surface'
                };
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-12 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter text-foreground">
                            MISSION LOGS
                        </h1>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] border-l-2 border-primary/30 pl-4">Live Operational Tracking • Alpha Sector</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-surface p-1.5 rounded-2xl border border-surface-border">
                            {(['COZY', 'COMPACT', 'GRID'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === mode
                                        ? 'bg-foreground text-background shadow-lg'
                                        : 'text-foreground/20 hover:text-foreground'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowHistory(true)}
                            className="p-4 rounded-2xl border bg-surface border-surface-border text-foreground/40 hover:text-foreground transition-all flex items-center gap-2 relative group"
                        >
                            <span className="text-lg group-hover:scale-110 transition-transform">📁</span>
                            <span className="text-[10px] font-black tracking-widest uppercase">Archive</span>
                            {historyOrders.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center border-2 border-background">{historyOrders.length}</span>
                            )}
                        </button>

                        <button
                            onClick={fetchOrders}
                            className="p-4 bg-surface rounded-2xl border border-surface-border hover:border-primary/30 transition-all active:scale-95 group"
                        >
                            <span className="block group-hover:rotate-180 transition-transform duration-500">🔄</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin omni-glow"></div>
                        <p className="mt-8 text-primary font-black text-[10px] tracking-[0.5em] uppercase">Syncing Protocol...</p>
                    </div>
                ) : activeOrders.length === 0 ? (
                    <div className="bg-surface border border-surface-border rounded-[3rem] p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                        <div className="text-8xl mb-6 opacity-20">📡</div>
                        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-foreground">No Active Protocols</h2>
                        <p className="text-foreground/20 mb-12 max-w-sm mx-auto font-bold text-xs uppercase tracking-widest leading-loose">
                            The ecosystem is quiet in your sector. Initialize a session in the marketplace to start.
                        </p>
                        <a
                            href="/marketplace"
                            className="inline-block px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all omni-glow hover:scale-105 active:scale-95"
                        >
                            Open Marketplace
                        </a>
                    </div>
                ) : (
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 px-2">
                                <div className="h-[1px] flex-1 bg-foreground/5"></div>
                                <h2 className="text-[10px] font-black tracking-[0.5em] text-foreground/30 uppercase">Operational Missions</h2>
                                <div className="h-[1px] flex-1 bg-foreground/5"></div>
                            </div>

                            <div className={`
                                ${viewMode === 'GRID' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8'}
                            `}>
                                {activeOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        viewMode={viewMode}
                                        getStatusInfo={getStatusInfo}
                                        handleCancelOrder={handleCancelOrder}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 📁 Archive Modal (Quick View) */}
            {showHistory && (
                <ArchiveModal
                    orders={historyOrders}
                    onClose={() => setShowHistory(false)}
                    getStatusInfo={getStatusInfo}
                />
            )}
        </div>
    );
}

interface ArchiveModalProps {
    orders: Order[];
    onClose: () => void;
    getStatusInfo: (status: string, fulfillment: string) => { label: string; desc: string; icon: string; color: string; bgColor: string };
}

// 🏛️ Archive Modal Component with Pagination
function ArchiveModal({ orders, onClose, getStatusInfo }: ArchiveModalProps) {
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl bg-surface border border-surface-border rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="p-8 border-b border-surface-border flex items-center justify-between bg-foreground/5 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center text-2xl border border-foreground/10 shadow-inner">📁</div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none mb-1">Mission Archive</h2>
                            <p className="text-foreground/20 text-[10px] font-black uppercase tracking-widest">History of operations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-foreground/5 hover:bg-foreground/10 rounded-full flex items-center justify-center transition-all text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4 opacity-20">🕳️</div>
                            <p className="text-white/20 font-black uppercase tracking-widest text-xs">The bin is empty</p>
                        </div>
                    ) : (
                        <>
                            {currentOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    viewMode="COMPACT"
                                    getStatusInfo={getStatusInfo}
                                    isHistory={true}
                                />
                            ))}
                        </>
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-surface-border bg-foreground/5 flex items-center justify-between">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-6 py-2 bg-foreground/5 hover:bg-foreground/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-foreground text-background' : 'bg-foreground/5 text-foreground/40 hover:text-foreground'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-6 py-2 bg-foreground/5 hover:bg-foreground/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

interface OrderCardProps {
    order: Order;
    viewMode: 'COZY' | 'COMPACT' | 'GRID';
    getStatusInfo: (status: string, fulfillment: string) => { label: string; desc: string; icon: string; color: string; bgColor: string };
    handleCancelOrder?: (id: string) => void;
    isHistory?: boolean;
}

// 🎴 Dynamic Order Card Component
function OrderCard({ order, viewMode, getStatusInfo, handleCancelOrder, isHistory = false }: OrderCardProps) {
    const info = getStatusInfo(order.status, order.fulfillmentType || 'PICKUP');
    const isReady = ['PAID', 'PREPARING', 'READY', 'PICKED_UP'].includes(order.status);

    if (viewMode === 'COMPACT') {
        return (
            <div className={`relative group overflow-hidden bg-surface border border-surface-border rounded-2xl p-4 transition-all hover:border-primary/30 ${isHistory ? 'opacity-60 saturate-0 hover:opacity-100 hover:saturate-100' : ''}`}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-background border border-surface-border">
                        {order.product.imageUrl ? <img src={order.product.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-black text-foreground text-sm truncate uppercase tracking-tight">{order.product.title}</h3>
                            <span className="text-foreground font-black text-sm">₵{order.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-foreground/5 rounded-md border border-foreground/10">
                                <span className={`text-[8px] font-black uppercase ${info.color}`}>{info.label}</span>
                            </div>
                            <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-tighter">{order.vendor.name}</span>
                        </div>
                    </div>
                    {!isHistory && !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
                        <button onClick={() => handleCancelOrder?.(order.id)} title="Cancel Mission" className="p-2 text-red-400/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">🗑️</button>
                    )}
                </div>
            </div>
        );
    }

    if (viewMode === 'GRID') {
        return (
            <div className={`relative group h-full bg-surface border border-surface-border rounded-3xl p-6 flex flex-col transition-all hover:border-primary/30 ${isHistory ? 'opacity-60 saturate-0 hover:opacity-100 hover:saturate-100' : ''}`}>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-background border border-surface-border mb-6">
                    {order.product.imageUrl ? <img src={order.product.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg text-[8px] font-black text-foreground uppercase">{order.fulfillmentType || 'PICKUP'}</div>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-foreground text-lg leading-tight uppercase line-clamp-2">{order.product.title}</h3>
                        <div className="text-foreground font-black whitespace-nowrap ml-2">GH₵{order.amount.toFixed(2)}</div>
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-4 ${info.color}`}>{info.label}</div>

                    <div className="mt-auto space-y-3">
                        <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                            <div className={`h-full bg-primary transition-all duration-1000 ${order.status === 'PAID' ? 'w-1/4' : order.status === 'PREPARING' ? 'w-2/4' : order.status === 'READY' ? 'w-3/4' : order.status === 'PICKED_UP' ? 'w-3/4' : order.status === 'COMPLETED' ? 'w-full' : 'w-0'}`}></div>
                        </div>
                        {!isHistory && isReady && order.releaseKey && (
                            <div className="py-2 px-4 bg-primary/10 border border-primary/30 rounded-xl text-center omni-glow">
                                <div className="text-[8px] font-black text-primary tracking-tighter uppercase mb-1">SECURE-KEY</div>
                                <div className="text-xl font-black tracking-widest text-primary">{order.releaseKey.slice(0, 3)}-{order.releaseKey.slice(3)}</div>
                            </div>
                        )}
                        {!isHistory && !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
                            <button onClick={() => handleCancelOrder?.(order.id)} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase border border-red-500/20">Abort Mission</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // COZY (Default - Existing UI)
    return (
        <div className={`group relative ${isHistory ? 'opacity-60 saturate-0' : ''}`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-700 blur-sm"></div>
            <div className="relative bg-surface backdrop-blur-3xl border border-surface-border rounded-[2.5rem] p-8 transition-all group-hover:border-primary/50">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-40 h-40 rounded-3xl overflow-hidden bg-background border-2 border-surface-border flex-shrink-0 relative">
                        {order.product.imageUrl ? <img src={order.product.imageUrl} className="w-full h-full object-cover" alt={order.product.title} /> : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
                        <div className="absolute top-2 right-2 px-3 py-1 bg-background/60 backdrop-blur-md rounded-full text-[10px] font-black text-foreground uppercase tracking-tighter">{order.fulfillmentType || 'PICKUP'}</div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-all duration-300 uppercase tracking-tighter leading-none mb-2">{order.product.title}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-black text-primary">{order.vendor.name?.[0]?.toUpperCase() || 'V'}</div>
                                    <span className="text-xs font-black text-foreground/40 uppercase tracking-widest">{order.vendor.name || 'Anonymous'}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-foreground">₵{order.amount.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="relative h-1 bg-foreground/5 rounded-full overflow-hidden">
                            <div className={`absolute inset-y-0 left-0 bg-primary transition-all duration-1000 ${order.status === 'PAID' ? 'w-1/4' : order.status === 'PREPARING' ? 'w-2/4' : order.status === 'READY' ? 'w-3/4' : order.status === 'PICKED_UP' ? 'w-3/4' : order.status === 'COMPLETED' ? 'w-full' : 'w-0'}`}></div>
                        </div>

                        <div className="p-5 bg-background/40 rounded-[1.5rem] border border-surface-border flex items-center gap-5">
                            <div className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] animate-pulse">{info.icon}</div>
                            <div>
                                <div className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${info.color}`}>{info.label}</div>
                                <p className="text-foreground/70 text-sm font-medium leading-tight">{info.desc}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {!isHistory && isReady && order.releaseKey && (
                                <div className="flex-[2] bg-primary/10 p-[1px] rounded-2xl border border-primary/30 shadow-[0_10px_30px_rgba(57,255,20,0.1)]">
                                    <div className="bg-background rounded-2xl p-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">OMNI SECURE-KEY</div>
                                            <div className="text-4xl font-black text-foreground tracking-[0.1em]">{order.releaseKey.slice(0, 3)}-{order.releaseKey.slice(3)}</div>
                                        </div>
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl omni-glow">🛡️</div>
                                    </div>
                                </div>
                            )}
                            <button className="flex-1 px-6 py-4 bg-surface border border-surface-border rounded-2xl font-black text-[10px] text-foreground/40 hover:bg-surface/80 hover:text-foreground uppercase tracking-widest transition-all">Message</button>
                            {!isHistory && !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
                                <button onClick={() => handleCancelOrder?.(order.id)} className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-black text-[10px] border border-red-500/20 transition-all uppercase tracking-widest">Abort Order</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

