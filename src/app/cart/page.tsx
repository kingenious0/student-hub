'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import ProtocolGuard from '@/components/admin/ProtocolGuard';

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
    const deliveryFee = items.length > 0 ? (fulfillmentMethod === 'delivery' ? 15 : 2) : 0;
    const total = subtotal + deliveryFee;

    const handleCheckout = async () => {
        if (items.length === 0) return;

        // User Check
        if (!user) {
            modal.alert('Please sign in to checkout.', 'Sign In Required');
            return;
        }

        // --- TEMPORARY SINGLE ITEM LIMIT ---
        // To ensure payment reliability without complex bulk logic in V1
        if (items.length > 1) {
            modal.alert('⚠️ BETA NOTICE: Batch checkout coming soon.\n\nPlease purchase items individually for now to ensure secure escrow tracking.', 'Batch Checkout Limited');
            return;
        }

        const item = items[0]; // Get the single item

        const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || manualEmail;

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
                    amount: Math.ceil(total * 100), // Ensure integer
                    currency: 'GHS',
                    ref: data.orderId,
                    metadata: {
                        custom_fields: [
                            { display_name: "Order ID", variable_name: "order_id", value: data.orderId }
                        ]
                    },
                    callback: function (response: { reference: string }) {
                        // verify payment
                        const verifyPayment = async () => {
                            try {
                                const vRes = await fetch('/api/payments/verify', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reference: response.reference })
                                });
                                const vData = await vRes.json();
                                if (vData.success) {
                                    clearCart(); // Success!
                                    window.location.href = '/orders?success=true';
                                } else {
                                    modal.alert('Payment verification failed. Contact support.', 'Verification Error');
                                    setIsCreatingOrder(false); // Reset state if failed
                                }
                            } catch (e) {
                                console.error(e);
                                modal.alert('Payment verification error.', 'Error');
                                setIsCreatingOrder(false); // Reset state if error
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
            <div className="min-h-screen bg-background transition-colors duration-300 pb-24">
                {/* Header */}
                <div className="bg-surface border-b border-surface-border sticky top-16 z-20 backdrop-blur-md bg-opacity-90">
                    <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                                Shopping Cart
                            </h1>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                                {items.length} Item(s) • GHS {subtotal.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    {items.length === 0 ? (
                        // ... Empty State ...
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-32 h-32 bg-surface rounded-full flex items-center justify-center mb-6">
                                <span className="text-6xl opacity-20">🛒</span>
                            </div>
                            <h2 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tight">
                                Your OMNI Cart is Empty
                            </h2>
                            <p className="text-foreground/40 text-sm font-bold max-w-md mb-8">
                                Looks like you haven't initiated any acquisitions yet. The marketplace is full of student essentials.
                            </p>
                            <Link
                                href="/marketplace"
                                className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all omni-glow"
                            >
                                Explore Marketplace
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items List */}
                            <div className="flex-1 space-y-6">
                                {Object.entries(itemsByVendor).map(([vendorId, { vendorName, items: vendorItems }]) => (
                                    <div key={vendorId} className="bg-surface border border-surface-border rounded-[2rem] overflow-hidden">

                                        {/* Vendor Header */}
                                        <div className="px-6 py-4 bg-foreground/5 border-b border-surface-border flex items-center gap-3">
                                            <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center font-black text-primary border border-surface-border">
                                                {vendorName[0]}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Vendor</p>
                                                <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{vendorName}</h3>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="divide-y divide-surface-border">
                                            <AnimatePresence>
                                                {vendorItems.map((item) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="p-6 flex gap-4 md:gap-6 group"
                                                    >
                                                        {/* Image */}
                                                        <Link href={`/products/${item.id}`} className="w-24 h-24 bg-background rounded-xl flex-shrink-0 overflow-hidden border border-surface-border group-hover:border-primary/50 transition-colors">
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                                            )}
                                                        </Link>

                                                        {/* Details */}
                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <Link href={`/products/${item.id}`} className="text-base font-black text-foreground uppercase tracking-tight line-clamp-2 hover:text-primary transition-colors">
                                                                        {item.title}
                                                                    </Link>
                                                                    <span className="text-lg font-black text-foreground tracking-tighter ml-4">
                                                                        ₵{(item.price * item.quantity).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-wide mb-2 line-through">
                                                                    {item.quantity > 1 ? `₵${item.price.toFixed(2)} each` : ''}
                                                                </div>
                                                            </div>

                                                            {/* Controls */}
                                                            <div className="flex items-center justify-between mt-auto">
                                                                <div className="flex items-center gap-4 bg-background border border-surface-border rounded-lg px-2 py-1">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                        className="w-6 h-6 flex items-center justify-center hover:bg-surface rounded text-foreground/60 hover:text-foreground font-black"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                        className="w-6 h-6 flex items-center justify-center hover:bg-primary hover:text-primary-foreground rounded text-foreground/60 font-black transition-colors"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeFromCart(item.id)}
                                                                    className="text-[10px] font-black uppercase text-red-400 hover:text-red-500 hover:underline tracking-widest"
                                                                >
                                                                    Remove
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

                            {/* Order Summary (Sidebar) */}
                            <div className="w-full lg:w-96 flex-shrink-0">
                                <div className="bg-surface border border-surface-border rounded-[2rem] p-6 sticky top-36">
                                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight mb-6">
                                        Order Summary
                                    </h2>

                                    <div className="space-y-4 mb-6">
                                        {/* Fulfillment Selector */}
                                        <div className="bg-background rounded-xl p-1 flex mb-6 border border-surface-border">
                                            <button
                                                onClick={() => setFulfillmentMethod('delivery')}
                                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${fulfillmentMethod === 'delivery' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/60 hover:bg-surface'}`}
                                            >
                                                Delivery
                                            </button>
                                            <button
                                                onClick={() => setFulfillmentMethod('pickup')}
                                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${fulfillmentMethod === 'pickup' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground/60 hover:bg-surface'}`}
                                            >
                                                Pickup
                                            </button>
                                        </div>

                                        <div className="flex justify-between text-sm font-bold text-foreground/60">
                                            <span>Subtotal ({items.length} items)</span>
                                            <span>₵{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-foreground/60">
                                            <span>{fulfillmentMethod === 'delivery' ? 'Delivery Fee' : 'Pickup Fee'}</span>
                                            <span className={fulfillmentMethod === 'pickup' ? 'text-green-500' : 'text-foreground'}>
                                                {items.length > 0 ? `₵${deliveryFee.toFixed(2)}` : '₵0.00'}
                                            </span>
                                        </div>
                                        <div className="pt-4 border-t border-surface-border flex justify-between items-end">
                                            <span className="text-sm font-black uppercase tracking-widest text-foreground">Total</span>
                                            <span className="text-3xl font-black text-primary tracking-tighter">
                                                ₵{total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={isCreatingOrder}
                                        className="w-full py-5 bg-[#39FF14] text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20 mb-4 disabled:opacity-50"
                                    >
                                        {isCreatingOrder ? 'Processing...' : 'Proceed to Checkout'}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                                        <span>🛡️ Shield Escrow Protected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Email Input Modal */}
                <AnimatePresence>
                    {showEmailModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-surface border border-surface-border p-6 rounded-2xl w-full max-w-sm shadow-2xl"
                            >
                                <h3 className="text-lg font-black uppercase mb-4 text-foreground">Receipt Email Required</h3>
                                <p className="text-xs text-foreground/60 mb-4 font-bold">
                                    Please provide an email address to receive your payment receipt.
                                </p>
                                <input
                                    type="email"
                                    placeholder="name@student.edu.gh"
                                    value={tempEmailInput}
                                    onChange={(e) => setTempEmailInput(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-background border border-surface-border mb-4 text-sm font-bold focus:border-primary outline-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowEmailModal(false)}
                                        className="flex-1 py-3 rounded-xl bg-surface border border-surface-border font-black text-xs uppercase hover:bg-surface/80"
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
                                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase hover:bg-primary/90"
                                    >
                                        Save
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
