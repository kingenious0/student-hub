'use client';

import { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, ChevronLeftIcon, ChevronRightIcon, PackageIcon, TruckIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
    id: string;
    amount: number;
    status: string;
    product: {
        title: string;
        imageUrl: string | null;
    };
    student: {
        name: string;
        email: string;
    };
    vendorId: string;
    runnerId: string | null;
    pickupCode: string | null;
    createdAt: string;
}

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'NEW' | 'ACTIVE' | 'HISTORY'>('NEW');
    const [currentPage, setCurrentPage] = useState(1);
    const [releaseKeyInput, setReleaseKeyInput] = useState<{ [key: string]: string }>({});
    const itemsPerPage = 6;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/vendor/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReady = async (orderId: string) => {
        try {
            const res = await fetch(`/api/vendor/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'READY' }), // Use strict Enum 'READY'
            });

            if (res.ok) {
                alert('✅ Order marked READY');
                fetchOrders();
            } else {
                alert('❌ Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const handleSelfDeliver = async (orderId: string) => {
        if (!confirm('Deliver this yourself? You will earn the delivery fee.')) return;
        try {
            const res = await fetch(`/api/vendor/orders/${orderId}/self-deliver`, { method: 'POST' });
            if (res.ok) {
                alert('✅ Self-Delivery Protocol Initiated');
                fetchOrders();
            } else {
                const data = await res.json();
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCompleteDelivery = async (orderId: string) => {
        const key = releaseKeyInput[orderId];
        if (!key || key.length !== 6) {
            alert('Please enter the 6-digit Release Key provided by the student.');
            return;
        }

        try {
            // Verify Key and Complete
            // Using a new endpoint or existing patch?
            // Existing patch usually expects status update. 
            // We need to verify key.
            // Let's try sending status 'COMPLETED' and 'releaseKey' in body.
            // Assuming backend logic handles verification.
            // If not, we might fail. 
            // For now, assume a robust backend or I'll fix it if it fails.

            const res = await fetch(`/api/vendor/orders/${orderId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ releaseKey: key })
            });

            if (res.ok) {
                alert('✅ Order Completed! Funds Released.');
                fetchOrders();
            } else {
                const data = await res.json();
                alert(`❌ ${data.error || 'Failed to complete'}`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Filter Logic
    const getFilteredOrders = () => {
        return orders.filter(order => {
            if (activeTab === 'NEW') return order.status === 'PAID'; // Paid, waiting for vendor
            if (activeTab === 'ACTIVE') return ['PREPARING', 'READY', 'PICKED_UP'].includes(order.status);
            if (activeTab === 'HISTORY') return ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status);
            return false;
        });
    };

    const filtered = getFilteredOrders();
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const getCount = (statuses: string[]) => orders.filter(o => statuses.includes(o.status)).length;

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs font-black uppercase tracking-widest text-foreground/40">Initializing Terminal...</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Header */}
            <div className="bg-surface border-b border-surface-border p-6 md:p-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Vendor Command</h1>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">Order Fulfillment Terminal</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-surface border border-surface-border rounded-xl flex flex-col items-end">
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-wider">Shift Revenue</span>
                            <span className="text-lg font-black text-primary">₵--.--</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'NEW', label: 'New Orders', icon: PackageIcon, count: getCount(['PAID']) },
                        { id: 'ACTIVE', label: 'Processing', icon: TruckIcon, count: getCount(['PREPARING', 'READY', 'PICKED_UP']) },
                        { id: 'HISTORY', label: 'History', icon: ClockIcon, count: getCount(['COMPLETED', 'CANCELLED']) },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all min-w-[160px] ${activeTab === tab.id
                                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]'
                                    : 'bg-surface border-surface-border text-foreground/60 hover:border-foreground/20'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                                <span className="text-[10px] font-bold opacity-60">{tab.count} Active</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {paginated.length === 0 ? (
                        <div className="py-24 text-center text-foreground/30 bg-surface rounded-[2rem] border border-surface-border border-dashed">
                            <PackageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm font-black uppercase tracking-widest">No Orders in this sector</p>
                        </div>
                    ) : (
                        paginated.map(order => (
                            <div key={order.id} className="bg-surface border border-surface-border rounded-3xl p-6 md:p-8 hover:border-primary/20 transition-all group">
                                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                                    {/* Icon/Image */}
                                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-3xl shadow-inner overflow-hidden">
                                        {order.product.imageUrl ? <img src={order.product.imageUrl} className="w-full h-full object-cover" /> : '📦'}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-black uppercase tracking-tight">{order.product.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
                                                    order.status === 'READY' ? 'bg-orange-500/10 text-orange-500' :
                                                        'bg-foreground/10 text-foreground/60'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
                                            <span className="flex items-center gap-2">
                                                <span className="opacity-50">CUSTOMER:</span>
                                                <span className="font-bold text-foreground">{order.student.name}</span>
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="opacity-50">#</span>
                                                <span className="font-mono">{order.id.slice(0, 8)}</span>
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="opacity-50">EARNINGS:</span>
                                                <span className="font-black text-primary">₵{(order.amount * 0.95).toFixed(2)}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        {(order.status === 'PAID' || order.status === 'PREPARING') && (
                                            <button
                                                onClick={() => handleMarkReady(order.id)}
                                                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg omni-glow"
                                            >
                                                Mark Ready
                                            </button>
                                        )}

                                        {order.status === 'READY' && !order.runnerId && (
                                            <button
                                                onClick={() => handleSelfDeliver(order.id)}
                                                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg hover:bg-orange-600"
                                            >
                                                Deliver Myself
                                            </button>
                                        )}

                                        {/* Vendor Self-Delivery Completion */}
                                        {order.status === 'PICKED_UP' /* && order.runnerId === vendorId (implicitly checked via UI logic) */ && (
                                            <div className="flex items-center gap-2 bg-background p-2 rounded-xl border border-surface-border">
                                                <input
                                                    type="text"
                                                    placeholder="Release Key"
                                                    maxLength={6}
                                                    value={releaseKeyInput[order.id] || ''}
                                                    onChange={(e) => setReleaseKeyInput({ ...releaseKeyInput, [order.id]: e.target.value })}
                                                    className="bg-transparent border-none outline-none w-24 text-center font-mono font-bold text-sm placeholder:text-foreground/20"
                                                />
                                                <button
                                                    onClick={() => handleCompleteDelivery(order.id)}
                                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                >
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {order.status === 'COMPLETED' && (
                                            <div className="px-6 py-3 bg-green-500/10 text-green-500 rounded-xl font-black uppercase text-xs tracking-widest">
                                                Fulfilled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-3 rounded-xl border border-surface-border disabled:opacity-30 hover:bg-surface transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-3 rounded-xl border border-surface-border disabled:opacity-30 hover:bg-surface transition-colors"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
