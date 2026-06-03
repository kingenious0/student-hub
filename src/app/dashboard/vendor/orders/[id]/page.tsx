
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Phone, CheckCircle } from 'lucide-react';

interface OrderDetail {
    id: string;
    status: string;
    escrowStatus: string;
    amount: number;
    createdAt: string;
    fulfillmentType: 'PICKUP' | 'DELIVERY';
    fulfillmentNote: string | null;
    items: Array<{
        product: {
            title: string;
            description: string;
            imageUrl: string | null;
        };
        quantity: number;
        price: number;
    }>;
    student: {
        name: string | null;
        email: string;
        phoneNumber: string | null;
    };
}

export default function VendorOrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [releaseKey, setReleaseKey] = useState('');

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.order);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setOrder(prev => prev ? { ...prev, status: newStatus } : null);
                toast.success(`Order marked as ${newStatus}`);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleVerifyKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!releaseKey || releaseKey.length !== 6) {
            toast.error('Please enter a valid 6-digit Release Key');
            return;
        }
        setUpdating(true);
        try {
            const res = await fetch(`/api/vendor/orders/${id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ releaseKey }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Handoff verified successfully! Escrow released.');
                setOrder(prev => prev ? { ...prev, status: 'COMPLETED', escrowStatus: 'RELEASED' } : null);
            } else {
                toast.error(data.error || 'Invalid Secure Key');
            }
        } catch (error) {
            toast.error('Connection to transaction ledger failed.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
                <h1 className="text-4xl font-black mb-4">404</h1>
                <p className="text-foreground/40 mb-8 font-bold uppercase tracking-widest text-xs">Order not found or access denied.</p>
                <Link href="/dashboard/vendor" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest omni-glow">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'PREPARING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'READY': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'SHIPPED': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'COMPLETED': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'CANCELLED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/dashboard/vendor"
                    className="inline-flex items-center text-primary hover:text-foreground mb-8 transition-colors group text-xs font-black uppercase tracking-widest"
                >
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                    Back to Operations
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Order Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Header Card */}
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                <div>
                                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </div>
                                    <h1 className="text-3xl font-black text-foreground mt-2 uppercase tracking-tight">
                                        Order #{order.id.slice(-6).toUpperCase()}
                                    </h1>
                                    <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest mt-1">
                                        Placed on {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-foreground">
                                        ₵{order.amount.toFixed(2)}
                                    </div>
                                    <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mt-1">
                                        {order.escrowStatus === 'HELD' ? '🛡️ HELD IN ESCROW' : '✅ FUNDS RELEASED'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 pt-6 border-t border-surface-border">
                                <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Order Items</h3>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-2xl border border-primary/20 overflow-hidden shrink-0">
                                            {item.product.imageUrl ? (
                                                <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : '📦'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-black text-foreground mb-1 uppercase tracking-tight">{item.product.title}</h3>
                                            <p className="text-foreground/30 text-[10px] font-medium leading-relaxed mb-1 line-clamp-1">{item.product.description}</p>
                                            <div className="text-[10px] font-bold text-foreground/60">
                                                Qty: {item.quantity} × ₵{item.price.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-8 space-y-6">
                            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Student Information</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center text-xl">👤</div>
                                <div>
                                    <div className="text-foreground font-black uppercase tracking-tight">{order.student.name || 'Anonymous Student'}</div>
                                    <div className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">{order.student.email}</div>
                                </div>
                            </div>
                            
                            {order.student.phoneNumber && (
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-border">
                                    <a
                                        href={`tel:${order.student.phoneNumber}`}
                                        className="py-3 px-4 bg-background border border-surface-border rounded-2xl text-[10px] font-black uppercase tracking-wider text-foreground hover:bg-foreground/5 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-3.5 h-3.5 fill-current text-primary" viewBox="0 0 24 24">
                                            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.57a1 1 0 00-1.01.24l-2.2 2.2a15.09 15.09 0 01-6.59-6.59l2.2-2.2a1 1 0 00.24-1.01 11.4 11.4 0 01-.57-3.53A1 1 0 0011 3H4a1 1 0 00-1 1 17 17 0 0017 17 1 1 0 001 -1v-7a1 1 0 00-1-1z" />
                                        </svg>
                                        Call Customer
                                    </a>
                                    <a
                                        href={`https://wa.me/${order.student.phoneNumber.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(order.student.name || 'Student')},%20this%20is%20your%20OMNI%20vendor.%20Coordinating%20order%20%23${order.id.slice(-6).toUpperCase()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 border border-transparent"
                                    >
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12.031 2c-5.514 0-10 4.486-10 10 0 1.968.57 3.805 1.558 5.359l-1.558 5.641 5.812-1.523c1.472.859 3.178 1.354 4.99 1.354 5.514 0 10-4.486 10-10s-4.486-10-10-10zm0 18c-1.621 0-3.134-.482-4.421-1.298l-.317-.197-3.277.859.882-3.189-.228-.363c-.888-1.421-1.401-3.109-1.401-4.912 0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm4.646-6.425c-.254-.127-1.503-.742-1.737-.825-.233-.085-.403-.127-.573.127-.17.254-.658.825-.807.994-.148.17-.297.191-.551.064-.254-.127-1.071-.395-2.04-1.26-.754-.672-1.263-1.502-1.411-1.756-.148-.254-.016-.392.111-.518.114-.114.254-.297.381-.446.127-.148.17-.254.254-.424.085-.17.042-.318-.021-.446-.064-.127-.573-1.379-.785-1.887-.207-.5-.435-.433-.594-.442-.154-.008-.33-.008-.507-.008-.178 0-.467.067-.711.332-.244.265-.933.912-.933 2.226 0 1.314.954 2.585 1.087 2.76.133.175 1.879 2.87 4.55 4.024.636.275 1.132.439 1.52.562.639.203 1.22.175 1.679.106.512-.076 1.503-.615 1.716-1.21.213-.595.213-1.104.148-1.21-.063-.105-.233-.148-.487-.275z" />
                                        </svg>
                                        WhatsApp
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Fulfillment details */}
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-8 space-y-4">
                            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Fulfillment Protocol</h2>
                            <div className="flex justify-between items-center text-sm border-b border-surface-border pb-2">
                                <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Type</span>
                                <span className="font-black text-xs uppercase tracking-wider text-primary animate-pulse-glow">
                                    {order.fulfillmentType === 'DELIVERY' ? '🚚 Direct Delivery' : '📍 Self-Pickup'}
                                </span>
                            </div>
                            {order.fulfillmentNote && (
                                <div className="p-4 bg-background/50 border border-surface-border rounded-2xl">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30 block mb-1">Fulfillment Note</span>
                                    <p className="text-xs font-semibold leading-relaxed text-foreground/80">{order.fulfillmentNote}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-8">
                        {/* Control Panel */}
                        <div className="bg-surface border border-surface-border rounded-[2.5rem] p-8">
                            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 text-center">Control Panel</h2>
                            <div className="space-y-4">
                                {order.status === 'PAID' && (
                                    <button
                                        onClick={() => updateStatus('PREPARING')}
                                        disabled={updating}
                                        className="w-full py-4 bg-primary hover:brightness-110 disabled:opacity-50 text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg omni-glow"
                                    >
                                        Start Preparing
                                    </button>
                                )}
                                {order.status === 'PREPARING' && (
                                    <button
                                        onClick={() => updateStatus('READY')}
                                        disabled={updating}
                                        className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-600/20"
                                    >
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'READY' && (
                                    <form onSubmit={handleVerifyKey} className="space-y-4">
                                        <div className="text-center py-4 bg-background/5 rounded-2xl border border-dashed border-surface-border mb-2">
                                            <div className="text-2xl mb-1">🤝</div>
                                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Awaiting Escrow Unlock</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[8px] font-black uppercase tracking-widest text-foreground/45">Enter Student's 6-Digit PIN</label>
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={releaseKey}
                                                onChange={(e) => setReleaseKey(e.target.value)}
                                                placeholder="e.g. 123456"
                                                className="w-full bg-background border border-surface-border rounded-xl p-3 font-bold text-center tracking-[0.3em] focus:border-primary outline-none text-sm placeholder:tracking-normal placeholder:text-foreground/20 text-foreground"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={updating}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-emerald-500/10"
                                        >
                                            Complete Handoff & Release
                                        </button>
                                    </form>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <div className="text-center py-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-pulse-glow" />
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Transaction Completed</p>
                                        <p className="text-[8px] text-foreground/40 uppercase tracking-wider mt-1 font-bold">Funds Released to Vault</p>
                                    </div>
                                )}
                                <p className="text-[9px] text-center text-foreground/20 mt-4 leading-relaxed font-black uppercase tracking-tighter">
                                    Funds are held securely in Escrow until the secure 6-digit key is verified.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
