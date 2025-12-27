import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/context/ModalContext';

interface Order {
    id: string;
    status: string;
    escrowStatus: string;
    amount: number;
    createdAt: string;
    product: {
        title: string;
    };
    student: {
        name: string | null;
    };
}

interface BentoOrderCardProps {
    order: Order;
}

export default function BentoOrderCard({ order }: BentoOrderCardProps) {
    const router = useRouter();
    const modal = useModal();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleMarkReady = async () => {
        if (!await modal.confirm('Mark this order as READY for runner pickup?', 'Confirm Status Update')) return;

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

    const handleVerifyPickup = async () => {
        const code = await modal.prompt("Enter the 6-digit Runner Key:", "Verify Runner Code");
        if (!code) return;

        setIsUpdating(true);
        try {
            const res = await fetch('/api/vendor/verify-pickup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    pickupCode: code
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
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
                {order.product.title}
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
    );
}
