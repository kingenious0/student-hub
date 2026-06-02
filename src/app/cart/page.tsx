'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useModal } from '@/context/ModalContext';
import ProtocolGuard from '@/components/admin/ProtocolGuard';
import { Trash2Icon, MinusIcon, PlusIcon, StoreIcon, ShieldIcon, ShoppingBag, ArrowLeft, ChevronRight, Lock } from 'lucide-react'; 
import GoBack from '@/components/navigation/GoBack';
import { useCartCheckout } from '@/hooks/useCartCheckout';

export default function CartPage() {
    const {
        items,
        removeFromCart,
        updateQuantity,
        fulfillmentMethod,
        setFulfillmentMethod,
        isCreatingOrder,
        setManualEmail,
        showEmailModal,
        setShowEmailModal,
        tempEmailInput,
        setTempEmailInput,
        deliveryFeeConfig,
        platformFeeConfig,
        subtotal,
        deliveryFee,
        platformFee,
        total,
        handleCheckout
    } = useCartCheckout();

    const modal = useModal();

    const itemsByVendor = items.reduce((acc, item) => {
        const vId = item.vendorId || 'unknown';
        if (!acc[vId]) {
            acc[vId] = {
                vendorName: item.vendorName,
                items: []
            };
        }
        acc[vId].items.push(item);
        return acc;
    }, {} as Record<string, { vendorName: string; items: typeof items }>);


    return (
        <ProtocolGuard protocol="MARKET_ACTIONS">
            <div className="min-h-screen bg-background transition-colors duration-300 pb-32">
                {/* Header Section */}
                <div className="bg-surface/50 backdrop-blur-md border-b border-surface-border sticky top-16 z-20">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <GoBack fallback="/" />
                                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter">
                                    Shopping <span className="text-primary italic">Vault</span>
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{items.length} Secure Slots Active</span>
                                    <div className="w-1 h-1 bg-surface-border rounded-full" />
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-[#39FF14] uppercase tracking-widest">
                                        <Lock className="w-3 h-3" />
                                        Locked
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 mt-12 md:mt-16">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-surface rounded-3xl border border-dashed border-gray-300 dark:border-surface-border">
                            <div className="w-32 h-32 bg-gray-50 dark:bg-surface-hover rounded-full flex items-center justify-center mb-6">
                                <span className="text-6xl opacity-20">🛒</span>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-foreground mb-4 uppercase tracking-tighter">
                                Your Cart is Empty
                            </h2>
                            <p className="text-gray-500 dark:text-foreground/40 text-base font-medium max-w-md mb-8 leading-relaxed">
                                Looks like you haven't added anything yet.
                            </p>
                            <Link
                                href="/"
                                className="px-12 py-5 bg-primary text-primary-foreground rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items List */}
                            <div className="flex-1 space-y-6">
                                {Object.entries(itemsByVendor).map(([vendorId, { vendorName, items: vendorItems }]) => (
                                    <div key={vendorId} className="bg-white dark:bg-surface border border-gray-200 dark:border-surface-border rounded-xl shadow-sm overflow-hidden">
                                        {/* Vendor Header */}
                                        <div className="px-6 py-4 bg-gray-50 dark:bg-surface-hover border-b border-gray-200 dark:border-surface-border flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white dark:bg-surface rounded-lg shadow-sm flex items-center justify-center text-primary">
                                                <StoreIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sold By</p>
                                                <h3 className="text-sm font-black text-gray-900 dark:text-foreground uppercase tracking-tight">{vendorName}</h3>
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
                                                        className="p-6 flex flex-col md:flex-row gap-6 group hover:bg-gray-50 dark:hover:bg-surface-hover/50 transition-colors"
                                                    >
                                                        {/* Image */}
                                                        <Link href={`/products/${item.id}`} className="w-full md:w-24 h-24 bg-gray-100 dark:bg-background rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 dark:border-surface-border relative">
                                                            {item.imageUrl ? (
                                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                                            )}
                                                        </Link>

                                                        {/* Details */}
                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <div className="flex justify-between items-start gap-4">
                                                                <div>
                                                                    <Link href={`/products/${item.id}`} className="text-base font-bold text-gray-900 dark:text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">
                                                                        {item.title}
                                                                    </Link>
                                                                    <div className="text-xs font-medium text-gray-400 mt-1">
                                                                        Unit Price: ₵{item.price.toFixed(2)}
                                                                    </div>
                                                                </div>
                                                                <span className="text-lg font-black text-gray-900 dark:text-foreground tracking-tight whitespace-nowrap">
                                                                    ₵{(item.price * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>

                                                            {/* Controls */}
                                                            <div className="flex items-center justify-between mt-4">
                                                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-surface-hover rounded-lg p-1">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, Number(item.quantity) - 1)}
                                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-surface rounded-md shadow-sm hover:text-primary transition-colors font-bold"
                                                                    >
                                                                        <MinusIcon className="w-3 h-3" />
                                                                    </button>
                                                                    <div className="w-8 text-center font-bold text-sm text-gray-900 dark:text-foreground">
                                                                        {item.quantity}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, Number(item.quantity) + 1)}
                                                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-surface rounded-md shadow-sm hover:text-primary transition-colors font-bold"
                                                                    >
                                                                        <PlusIcon className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeFromCart(item.id)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                                    title="Remove Item"
                                                                >
                                                                    <Trash2Icon className="w-4 h-4" />
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

                            {/* Order Summary Sidebar */}
                            <div className="w-full lg:w-[380px] flex-shrink-0">
                                <div className="bg-white dark:bg-surface border border-gray-200 dark:border-surface-border rounded-xl p-6 sticky top-32 shadow-lg shadow-gray-200/50 dark:shadow-none">
                                    <h2 className="text-lg font-black text-gray-900 dark:text-foreground uppercase tracking-tight mb-6 pb-4 border-b border-gray-100 dark:border-surface-border">
                                        Order Summary
                                    </h2>

                                    {/* Fulfillment Selector */}
                                    <div className="space-y-3 mb-6">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery Method</label>
                                        {/* Custom Toggle Group Implementation using standard buttons for reliability */}
                                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-surface-hover rounded-lg">
                                            <button
                                                onClick={() => setFulfillmentMethod('delivery')}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-md text-xs font-black uppercase tracking-wider transition-all ${fulfillmentMethod === 'delivery'
                                                    ? 'bg-white dark:bg-surface text-primary shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                            >
                                                <span>Delivery</span>
                                            </button>
                                            <button
                                                onClick={() => setFulfillmentMethod('pickup')}
                                                className={`flex items-center justify-center gap-2 py-3 rounded-md text-xs font-black uppercase tracking-wider transition-all ${fulfillmentMethod === 'pickup'
                                                    ? 'bg-white dark:bg-surface text-primary shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                            >
                                                <span>Pickup</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-foreground/70">
                                            <span>Subtotal</span>
                                            <span className="font-bold text-gray-900 dark:text-foreground">₵{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-foreground/70">
                                            <span>
                                                {fulfillmentMethod === 'delivery' ? 'Delivery Fee' : 'Pickup Handling'}
                                            </span>
                                            <span className={`font-bold ${fulfillmentMethod === 'pickup' ? 'text-green-600' : 'text-gray-900 dark:text-foreground'}`}>
                                                {items.length > 0 ? (fulfillmentMethod === 'delivery' ? `₵${deliveryFeeConfig.toFixed(2)}` : `Free`) : '₵0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-foreground/70">
                                            <span>Access Royalty</span>
                                            <span className="font-bold text-gray-900 dark:text-foreground">
                                                ₵{items.length > 0 ? platformFeeConfig.toFixed(2) : '0.00'}
                                            </span>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 dark:border-surface-border flex justify-between items-end mt-4">
                                            <span className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-foreground">Total</span>
                                            <span className="text-3xl font-black text-primary tracking-tighter">
                                                ₵{total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={isCreatingOrder}
                                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 mb-6 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isCreatingOrder ? 'Processing...' : `Pay Now`}
                                    </button>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-surface-hover py-2 rounded-lg">
                                            <ShieldIcon className="w-3 h-3" />
                                            <span>Secure</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-surface-hover py-2 rounded-lg">
                                            <span>Verified</span>
                                        </div>
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
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-background border border-gray-200 dark:border-surface-border mb-6 text-base font-bold outline-none ring-2 ring-transparent focus:ring-primary transition-all"
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
                                                await modal.alert('Email saved. Please click "Pay Now" again.', 'Saved');
                                            } else {
                                                modal.alert('Please enter a valid email.', 'Invalid Email');
                                            }
                                        }}
                                        className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase hover:brightness-110 transition-colors shadow-lg shadow-primary/20"
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
