'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import ProtocolGuard from '@/components/admin/ProtocolGuard';
import { Trash2Icon, MinusIcon, PlusIcon, StoreIcon, ShieldIcon } from 'lucide-react'; // Using lucide-react for consistent icons if available, else stick to current

// Helper Icons (Inline to avoid missing dependency if lucide not installed, though standard in modern next stacks)
const DeleteIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>;

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const modal = useModal();
    const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery');
    const { user } = useUser();
    const router = useRouter();
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [manualEmail, setManualEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [tempEmailInput, setTempEmailInput] = useState('');
    const [isHybridAuth, setIsHybridAuth] = useState(false);
    const [hybridClerkId, setHybridClerkId] = useState<string | null>(null);

    useState(() => {
        if (typeof window !== 'undefined') {
            const isVerified = document.cookie.split('; ').some(c => c.startsWith('OMNI_IDENTITY_VERIFIED=TRUE'));
            const syncId = document.cookie.split('; ').find(c => c.trim().startsWith('OMNI_HYBRID_SYNCED='))?.split('=')[1];
            if (isVerified) {
                setIsHybridAuth(true);
                if (syncId) setHybridClerkId(syncId);
            }
        }
    });

    const itemsByVendor = items.reduce((acc, item) => {
        if (!acc[item.vendorId]) {
            acc[item.vendorId] = {
                vendorName: item.vendorName,
                items: []
            };
        }
        acc[item.vendorId].items.push(item);
        return acc;
    }, {} as Record<string, { vendorName: string; items: typeof items }>);

    const subtotal = getCartTotal();
    const deliveryFee = items.length > 0 ? (fulfillmentMethod === 'delivery' ? 15 : 0.10) : 0;
    const total = subtotal + deliveryFee;

    const handleCheckout = async () => {
        if (items.length === 0) return;

        // User Check (Hybrid Aware)
        if (!user && !isHybridAuth) {
            modal.alert('Please sign in to checkout.', 'Sign In Required');
            return;
        }

        // --- TEMPORARY SINGLE ITEM LIMIT ---
        if (items.length > 1) {
            modal.alert('⚠️ BETA NOTICE: Batch checkout coming soon.\n\nPlease purchase items individually for now to ensure secure escrow tracking.', 'Batch Checkout Limited');
            return;
        }

        const item = items[0];

        let userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || manualEmail;

        if (!userEmail && isHybridAuth && hybridClerkId) {
            try {
                const res = await fetch(`/api/users/me?clerkId=${hybridClerkId}`);
                const data = await res.json();
                if (data.success && data.user?.email) {
                    userEmail = data.user.email;
                    setManualEmail(userEmail);
                }
            } catch (e) {
                console.error('Hybrid Email Fetch Failed', e);
            }
        }

        if (!userEmail) {
            setShowEmailModal(true);
            return;
        }

        // Pre-check Paystack
        const PaystackPop = (window as unknown as { PaystackPop: { setup: (options: unknown) => { openIframe: () => void } } }).PaystackPop;
        if (!PaystackPop) {
            modal.alert('Payment system loading... Please wait or refresh.', 'Paystack Loading');
            return;
        }

        setIsCreatingOrder(true);

        try {
            // 1. Create Order
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: item.id,
                    quantity: item.quantity,
                    fulfillmentType: fulfillmentMethod === 'delivery' ? 'DELIVERY' : 'PICKUP'
                })
            });

            const data = await res.json();

            if (data.success) {
                // 2. Launch Payment
                const handler = PaystackPop.setup({
                    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                    email: userEmail,
                    amount: Math.ceil(total * 100),
                    currency: 'GHS',
                    ref: data.orderId,
                    metadata: {
                        custom_fields: [
                            { display_name: "Order ID", variable_name: "order_id", value: data.orderId }
                        ]
                    },
                    callback: function (response: { reference: string }) {
                        const verifyPayment = async () => {
                            try {
                                const vRes = await fetch('/api/payments/verify', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reference: response.reference })
                                });
                                const vData = await vRes.json();
                                if (vData.success) {
                                    clearCart();
                                    window.location.href = '/orders?success=true';
                                } else {
                                    modal.alert('Payment verification failed. Contact support.', 'Verification Error');
                                    setIsCreatingOrder(false);
                                }
                            } catch (e) {
                                console.error(e);
                                modal.alert('Payment verification error.', 'Error');
                                setIsCreatingOrder(false);
                            }
                        };
                        verifyPayment();
                    },
                    onClose: function () {
                        setIsCreatingOrder(false);
                        modal.alert('Payment cancelled.', 'Cancelled');
                    }
                });
                handler.openIframe();
            } else {
                modal.alert(`Order Error: ${data.error}`, 'Order Failed');
                setIsCreatingOrder(false);
            }

        } catch (error) {
            console.error('Checkout Error', error);
            modal.alert('System connection failed.', 'Error');
            setIsCreatingOrder(false);
        }
    };

    return (
        <ProtocolGuard protocol="MARKET_ACTIONS">
            <div className="min-h-screen bg-[#f5f5f5] dark:bg-background transition-colors duration-300 pb-32">
                {/* Header */}
                <div className="bg-white dark:bg-surface border-b border-gray-200 dark:border-surface-border sticky top-16 z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-foreground uppercase tracking-tighter">
                                Shopping Cart
                            </h1>
                            <p className="text-xs font-bold text-gray-500 dark:text-foreground/40 uppercase tracking-widest mt-1">
                                {items.length} Item(s) • Secure Checkout
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-surface rounded-3xl border border-gray-200 dark:border-surface-border shadow-sm">
                            <div className="w-32 h-32 bg-gray-100 dark:bg-surface-hover rounded-full flex items-center justify-center mb-6">
                                <span className="text-6xl opacity-20">🛒</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-foreground mb-4 uppercase tracking-tighter">
                                Your Cart is Empty
                            </h2>
                            <p className="text-gray-500 dark:text-foreground/40 text-base font-medium max-w-md mb-8 leading-relaxed">
                                Looks like you haven't added anything yet. The marketplace is full of student essentials waiting for you.
                            </p>
                            <Link
                                href="/"
                                className="px-12 py-5 bg-orange-600 text-white rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items List */}
                            <div className="flex-1 space-y-8">
                                {Object.entries(itemsByVendor).map(([vendorId, { vendorName, items: vendorItems }]) => (
                                    <div key={vendorId} className="bg-white dark:bg-surface border border-gray-200 dark:border-surface-border rounded-xl shadow-sm overflow-hidden">

                                        {/* Vendor Header */}
                                        <div className="px-6 py-4 bg-gray-50 dark:bg-surface-hover border-b border-gray-200 dark:border-surface-border flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white dark:bg-surface rounded-lg shadow-sm flex items-center justify-center text-orange-600 dark:text-primary">
                                                <StoreIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sold By</p>
                                                <h3 className="text-base font-black text-gray-900 dark:text-foreground uppercase tracking-tight">{vendorName}</h3>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="divide-y divide-gray-100 dark:divide-surface-border">
                                            <AnimatePresence>
                                                {vendorItems.map((item) => (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="p-6 md:p-8 flex flex-col md:flex-row gap-6 group hover:bg-gray-50 dark:hover:bg-surface-hover/50 transition-colors"
                                                    >
                                                        {/* Image */}
                                                        <Link href={`/products/${item.id}`} className="w-full md:w-32 h-32 bg-gray-100 dark:bg-background rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 dark:border-surface-border relative">
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                                            )}
                                                        </Link>

                                                        {/* Details */}
                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                                                                    <Link href={`/products/${item.id}`} className="text-lg md:text-xl font-bold text-gray-900 dark:text-foreground leading-tight hover:text-orange-600 transition-colors line-clamp-2">
                                                                        {item.title}
                                                                    </Link>
                                                                    <span className="text-xl md:text-2xl font-black text-orange-600 dark:text-primary tracking-tighter whitespace-nowrap">
                                                                        ₵{(item.price * item.quantity).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
                                                                    Unit Price: ₵{item.price.toFixed(2)}
                                                                </div>
                                                            </div>

                                                            {/* Controls */}
                                                            <div className="flex items-center justify-between mt-auto">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-surface-hover rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors font-bold text-lg"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <div className="w-12 text-center font-black text-lg text-gray-900 dark:text-foreground">
                                                                        {item.quantity}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-surface-hover rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors font-bold text-lg"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeFromCart(item.id)}
                                                                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
                                                                >
                                                                    <DeleteIcon className="w-4 h-4" />
                                                                    <span className="hidden md:inline">Remove</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="w-full lg:w-96 flex-shrink-0">
                                <div className="bg-white dark:bg-surface border border-gray-200 dark:border-surface-border rounded-xl p-6 sticky top-28 shadow-lg shadow-gray-200/50 dark:shadow-none">
                                    <h2 className="text-lg font-black text-gray-900 dark:text-foreground uppercase tracking-tight mb-6 pb-4 border-b border-gray-100 dark:border-surface-border">
                                        Order Summary
                                    </h2>

                                    <div className="space-y-4 mb-6">
                                        {/* Fulfillment Selector */}
                                        <div className="bg-gray-100 dark:bg-surface-hover rounded-xl p-1.5 flex mb-6">
                                            <button
                                                onClick={() => setFulfillmentMethod('delivery')}
                                                className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${fulfillmentMethod === 'delivery' ? 'bg-white dark:bg-surface text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Delivery
                                            </button>
                                            <button
                                                onClick={() => setFulfillmentMethod('pickup')}
                                                className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${fulfillmentMethod === 'pickup' ? 'bg-white dark:bg-surface text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                Pickup
                                            </button>
                                        </div>

                                        <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-foreground/70">
                                            <span>Subtotal</span>
                                            <span className="font-bold text-gray-900 dark:text-foreground">₵{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-foreground/70">
                                            <span>{fulfillmentMethod === 'delivery' ? 'Delivery Fee' : 'Pickup Fee'}</span>
                                            <span className={`font-bold ${fulfillmentMethod === 'pickup' ? 'text-green-600' : 'text-gray-900 dark:text-foreground'}`}>
                                                {items.length > 0 ? `₵${deliveryFee.toFixed(2)}` : '₵0.00'}
                                            </span>
                                        </div>
                                        <div className="pt-6 border-t border-gray-100 dark:border-surface-border flex justify-between items-end">
                                            <span className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-foreground">Total</span>
                                            <span className="text-4xl font-black text-orange-600 dark:text-primary tracking-tighter">
                                                ₵{total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={isCreatingOrder}
                                        className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-orange-500/20 mb-6 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isCreatingOrder ? 'Processing...' : `Pay ₵${total.toFixed(2)}`}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-surface-hover py-3 rounded-lg">
                                        <ShieldIcon className="w-3 h-3" />
                                        <span>OMNI Shield Protection</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Email Input Modal */}
                <AnimatePresence>
                    {showEmailModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-surface border border-gray-200 dark:border-surface-border p-8 rounded-3xl w-full max-w-sm shadow-2xl"
                            >
                                <h3 className="text-xl font-black uppercase mb-4 text-gray-900 dark:text-foreground">Receipt Email</h3>
                                <p className="text-sm text-gray-500 mb-6 font-medium">
                                    Where should we send your payment receipt?
                                </p>
                                <input
                                    type="email"
                                    placeholder="student@university.edu.gh"
                                    value={tempEmailInput}
                                    onChange={(e) => setTempEmailInput(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-background border border-gray-200 dark:border-surface-border mb-6 text-base font-bold outline-none ring-2 ring-transparent focus:ring-orange-500 transition-all"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowEmailModal(false)}
                                        className="flex-1 py-4 rounded-xl bg-gray-100 dark:bg-surface-hover font-black text-xs uppercase hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (tempEmailInput.includes('@')) {
                                                setManualEmail(tempEmailInput);
                                                setShowEmailModal(false);
                                                await modal.alert('Email saved. Please click "Proceed to Checkout" again.', 'Saved');
                                            } else {
                                                modal.alert('Please enter a valid email.', 'Invalid Email');
                                            }
                                        }}
                                        className="flex-1 py-4 rounded-xl bg-orange-600 text-white font-black text-xs uppercase hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ProtocolGuard>
    );
}
