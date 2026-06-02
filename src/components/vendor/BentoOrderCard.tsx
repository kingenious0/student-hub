import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ZapIcon } from '@/components/ui/Icons';

interface Order {
    id: string;
    status: string;
    escrowStatus: string;
    amount: number;
    createdAt: string;
    items: Array<{
        product: {
            title: string;
        };
    }>;
    student: {
        name: string | null;
    };
}

interface BentoOrderCardProps {
    order: Order;
}

export default function BentoOrderCard({ order }: BentoOrderCardProps) {
    const primaryItem = order.items?.[0];
    const displayTitle = order.items?.length > 1 ? `${primaryItem?.product.title} + ${order.items.length - 1} more` : (primaryItem?.product.title || 'Unknown Item');

    const router = useRouter();
    // Combine both contexts: Global Modal for system alerts, Local state for the custom Verify UI
    const modal = useModal();
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [pickupCode, setPickupCode] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleMarkReady = async () => {
        // Use Global Modal for standard confirmations
        if (!await modal.confirm('Mark this order as READY?', 'Confirm Status Update')) return;

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'READY' })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Refresh to update UI and notify system
                window.location.reload();
            } else {
                modal.alert(data.error || 'Failed to update status', 'Error');
                setIsUpdating(false);
            }
        } catch (error) {
            console.error(error);
            modal.alert('Connection error', 'Error');
            setIsUpdating(false);
        }
    };

    const handleVerifyPickup = () => {
        // Trigger Local Custom Modal
        setShowVerifyModal(true);
    };

    const confirmVerification = async () => {
        if (!pickupCode || pickupCode.length < 6) {
            modal.alert('Please enter a valid 6-digit key', 'Invalid Input');
            return;
        }

        setIsUpdating(true);
        try {
            const res = await fetch('/api/vendor/verify-pickup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    pickupCode: pickupCode
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setShowVerifyModal(false);
                await modal.alert('Runnner Verified! Order is now in transit.', 'Success');
                window.location.reload();
            } else {
                modal.alert(data.error || 'Verification Failed', 'Error');
                setIsUpdating(false);
            }
        } catch (error) {
            console.error(error);
            modal.alert('Connection error', 'Error');
            setIsUpdating(false);
        }
    };

    // Determine status glow color
    const getStatusGlow = () => {
        if (order.status === 'PAID' || order.status === 'PREPARING') {
            return {
                glow: 'shadow-[0_0_20px_rgba(57,255,20,0.3)]',
                border: 'border-[#39FF14]',
                badge: 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/30',
                label: 'ACTIVE DELIVERY',
                icon: '🚀'
            };
        }
        if (order.escrowStatus === 'HELD') {
            return {
                glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
                border: 'border-amber-500',
                badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                label: 'SHIELD VERIFICATION',
                icon: '🛡️'
            };
        }
        if (order.status === 'READY') {
            return {
                glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
                border: 'border-blue-500',
                badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                label: 'READY FOR PICKUP',
                icon: '✅'
            };
        }
        return {
            glow: 'shadow-lg',
            border: 'border-surface-border',
            badge: 'bg-foreground/10 text-foreground/40 border-foreground/20',
            label: order.status,
            icon: '📦'
        };
    };

    const statusStyle = getStatusGlow();

    return (
        <>
            <div className={`group relative overflow-hidden bg-surface border-2 ${statusStyle.border} ${statusStyle.glow} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300`}>
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1.5 ${statusStyle.badge} border rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                    <span>{statusStyle.icon}</span>
                    <span>{statusStyle.label}</span>
                </div>

                {/* Product Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl border border-primary/20 mb-4">
                    📦
                </div>

                {/* Product Title */}
                <h3 className="text-foreground font-black text-lg uppercase tracking-tight leading-tight mb-2 line-clamp-2">
                    {displayTitle}
                </h3>

                {/* Customer Info */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-foreground/30 uppercase">Customer:</span>
                    <span className="text-xs font-black text-foreground">{order.student.name || 'Anonymous'}</span>
                </div>

                {/* Amount */}
                <div className="text-2xl font-black text-foreground mb-4">
                    ₵{order.amount.toFixed(2)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/vendor/orders/${order.id}`}
                        className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/80 text-primary-foreground text-[10px] font-black rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-center"
                    >
                        View Details
                    </Link>
                    {/* Stage 0 -> Stage 1: Mark Ready */}
                    {(order.status === 'PAID' || order.status === 'PREPARING') && (
                        <button
                            onClick={handleMarkReady}
                            disabled={isUpdating}
                            className="px-4 py-2.5 bg-foreground/5 hover:bg-foreground/10 border border-surface-border rounded-xl transition-all text-[10px] font-black uppercase disabled:opacity-50"
                        >
                            {isUpdating ? '...' : 'Mark Ready'}
                        </button>
                    )}
                    {/* Stage 1 -> Stage 2: Verify Runner Pickup */}
                    {order.status === 'READY' && (
                        <button
                            onClick={handleVerifyPickup}
                            disabled={isUpdating}
                            className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-600 rounded-xl transition-all text-[10px] font-black uppercase disabled:opacity-50 animate-pulse"
                        >
                            {isUpdating ? '...' : 'Verify Runner'}
                        </button>
                    )}
                </div>

                {/* Glow Effect Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-current opacity-5 pointer-events-none ${statusStyle.border}`}></div>
            </div>

            {/* VERIFICATION MODAL */}
            <AnimatePresence>
                {showVerifyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowVerifyModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-primary to-yellow-500"></div>
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setShowVerifyModal(false)}
                                    className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                                >
                                    <XIcon className="w-5 h-5 opacity-50" />
                                </button>
                            </div>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 mb-4 border border-yellow-500/20">
                                    <ZapIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Security Check</h3>
                                <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
                                    Ask Runner for their Key
                                </p>
                            </div>

                            <div className="space-y-6">
                                <input
                                    type="text"
                                    value={pickupCode}
                                    onChange={(e) => setPickupCode(e.target.value)}
                                    placeholder="000 000"
                                    maxLength={6}
                                    className="w-full bg-background border border-surface-border rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:border-yellow-500 transition-colors uppercase placeholder:opacity-20"
                                    autoFocus
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowVerifyModal(false)}
                                        className="flex-1 py-4 bg-foreground/5 hover:bg-foreground/10 text-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmVerification}
                                        disabled={isUpdating || pickupCode.length < 6}
                                        className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                                    >
                                        {isUpdating ? 'Verifying...' : 'Verify Now'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
