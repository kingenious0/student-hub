'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartCheckout } from '@/hooks/useCartCheckout';
import { useModal } from '@/context/ModalContext';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CartItem } from '@/lib/store/cart';
import { sanitizeImageUrl } from '@/lib/utils';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const {
        items,
        removeFromCart,
        updateQuantity,
        fulfillmentMethod,
        setFulfillmentMethod,
        isCreatingOrder,
        subtotal,
        deliveryFee,
        platformFee,
        total,
        handleCheckout,
        showGuestModal,
        setShowGuestModal,
        guestName,
        setGuestName,
        guestPhone,
        setGuestPhone
    } = useCartCheckout();

    const modal = useModal();

    const [isMobile, setIsMobile] = useState(false);

    // Responsive screen width detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Group items by vendor
    const itemsByVendor = items.reduce((acc, item) => {
        const vId = item.vendorId || 'unknown';
        const vName = item.vendorName || 'Campus Vendor';
        if (!acc[vId]) {
            acc[vId] = { vendorName: vName, items: [] };
        }
        acc[vId].items.push(item);
        return acc;
    }, {} as Record<string, { vendorName: string; items: CartItem[] }>);

    // Variants for animation
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const drawerVariants = {
        hidden: isMobile ? { y: '100%' } : { x: '100%' },
        visible: isMobile ? { y: 0 } : { x: 0 }
    };

    return (
        <>
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={backdropVariants}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-opacity"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={drawerVariants}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className={`fixed bg-background border-surface-border z-[1000] flex flex-col shadow-2xl transition-all duration-300
                            ${isMobile 
                                ? 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[2.5rem] border-t' 
                                : 'top-0 right-0 h-full w-[450px] border-l'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-surface-border">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <ShoppingBag className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-tight text-foreground">Shopping Cart</h2>
                                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                                        {items.length} {items.length === 1 ? 'Item' : 'Items'} Selected
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-surface rounded-full transition-colors border border-transparent hover:border-surface-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                aria-label="Close cart"
                            >
                                <X className="w-5 h-5 text-foreground/60" />
                            </button>
                        </div>

                        {/* Cart Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                                    <div className="w-16 h-16 bg-surface border border-surface-border rounded-full flex items-center justify-center text-foreground/20 text-3xl">
                                        🛒
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground/60 uppercase text-xs tracking-wider">Your cart is empty</p>
                                        <p className="text-[10px] text-foreground/40 font-semibold mt-1">Add items from the marketplace to get started.</p>
                                    </div>
                                    <button 
                                        onClick={onClose}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-95 active:scale-95 transition-all shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                    >
                                        Start Browsing
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Fulfillment Method Selector */}
                                    <div className="bg-surface p-1 rounded-2xl border border-surface-border flex gap-1">
                                        <button
                                            onClick={() => setFulfillmentMethod('delivery')}
                                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none
                                                ${fulfillmentMethod === 'delivery' 
                                                    ? 'bg-background text-primary border border-surface-border shadow-sm' 
                                                    : 'text-foreground/50 hover:text-foreground'
                                                }`}
                                        >
                                            🚀 Delivery
                                        </button>
                                        <button
                                            onClick={() => setFulfillmentMethod('pickup')}
                                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none
                                                ${fulfillmentMethod === 'pickup' 
                                                    ? 'bg-background text-primary border border-surface-border shadow-sm' 
                                                    : 'text-foreground/50 hover:text-foreground'
                                                }`}
                                        >
                                            🎒 Pickup
                                        </button>
                                    </div>

                                    {/* Grouped Vendor Items */}
                                    <div className="space-y-6">
                                        {Object.entries(itemsByVendor).map(([vendorId, group]) => {
                                            const { vendorName, items } = group as { vendorName: string; items: CartItem[] }
                                            return (
                                                <div key={vendorId} className="border border-surface-border/60 rounded-2xl overflow-hidden bg-surface/30">
                                                    <div className="bg-surface px-4 py-2 border-b border-surface-border/50 flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                            🏪 {vendorName}
                                                        </span>
                                                    </div>
                                                    <div className="divide-y divide-surface-border/40">
                                                        {items.map((item) => {
                                                            const modifiersTotal = (item.selectedModifiers || []).reduce((s, m) => s + m.priceDiff, 0);
                                                            const effectiveUnitPrice = item.price + modifiersTotal;
                                                            const effectiveLineTotal = effectiveUnitPrice * item.quantity;
                                                            return (
                                                                <div key={item.cartItemId} className="p-4 flex gap-4 items-start">
                                                                    {/* Product Image */}
                                                                    {item.imageUrl ? (
                                                                        <img 
                                                                            src={sanitizeImageUrl(item.imageUrl)} 
                                                                            alt={item.title} 
                                                                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-surface-border"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-16 h-16 rounded-xl bg-surface border border-surface-border flex-shrink-0 flex items-center justify-center text-2xl">
                                                                            📦
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Product Info & Actions */}
                                                                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                                                                        <div className="flex justify-between items-start gap-2">
                                                                            <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">
                                                                                {item.title}
                                                                            </h4>
                                                                            {/* Remove Button */}
                                                                            <button
                                                                                onClick={() => removeFromCart(item.cartItemId)}
                                                                                className="text-foreground/30 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                                                                aria-label="Remove item"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>

                                                                        {/* Modifier Selections */}
                                                                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {item.selectedModifiers.map((m, i) => (
                                                                                    <span key={i} className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                                                                        {m.groupName}: {m.optionName}{m.priceDiff > 0 ? ` (+₵${m.priceDiff.toFixed(2)})` : ''}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            <div>
                                                                                <p className="text-xs font-black text-primary">₵{effectiveUnitPrice.toFixed(2)}</p>
                                                                                {modifiersTotal > 0 && (
                                                                                    <p className="text-[10px] text-foreground/40 font-bold">
                                                                                        Base: ₵{item.price.toFixed(2)} + ₵{modifiersTotal.toFixed(2)} mods
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Quantity Selector */}
                                                                            <div className="flex items-center bg-surface border border-surface-border/60 rounded-xl p-0.5">
                                                                                <button
                                                                                    onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors text-foreground/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                                                                    aria-label="Decrease quantity"
                                                                                >
                                                                                    <Minus className="w-3 h-3" />
                                                                                </button>
                                                                                <span className="text-xs font-black w-6 text-center tabular-nums">{item.quantity}</span>
                                                                                <button
                                                                                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors text-foreground/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                                                                    aria-label="Increase quantity"
                                                                                >
                                                                                    <Plus className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Totals / Checkout */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-surface-border bg-surface/30 space-y-4">
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-foreground/60 font-semibold uppercase tracking-wider">
                                        <span>Subtotal</span>
                                        <span className="font-black text-foreground">₵{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-foreground/60 font-semibold uppercase tracking-wider">
                                        <span>Delivery Fee</span>
                                        <span className="font-black text-foreground">
                                            {deliveryFee === 0 ? 'FREE' : `₵${deliveryFee.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-foreground/60 font-semibold uppercase tracking-wider">
                                        <span>Platform Safety Fee</span>
                                        <span className="font-black text-foreground">₵{platformFee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-surface-border/50 my-2 pt-2 flex justify-between text-sm font-black uppercase tracking-widest text-foreground">
                                        <span>Grand Total</span>
                                        <span className="text-primary font-black text-base">₵{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleCheckout()}
                                        disabled={isCreatingOrder}
                                        className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                    >
                                        {isCreatingOrder ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing Order...
                                            </>
                                        ) : (
                                            <>
                                                💳 Secure Paystack Checkout
                                            </>
                                        )}
                                    </button>
                                    
                                    <Link
                                        href="/cart"
                                        onClick={onClose}
                                        className="w-full py-3 bg-surface border border-surface-border text-foreground/60 hover:text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl text-center transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                    >
                                        Open Detailed Cart Page
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
            {/* Guest Checkout Modal — rendered outside the drawer panel so it overlays everything */}
            <AnimatePresence>
                {showGuestModal && (
                    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="bg-surface border border-surface-border p-8 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
                            <h3 className="text-xl font-black uppercase mb-2 text-foreground">Guest Details</h3>
                            <p className="text-xs text-foreground/50 font-bold mb-6">
                                Enter your details to proceed to secure Paystack checkout. No password required!
                            </p>

                            <div className="space-y-4 mb-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-background border border-surface-border text-base font-bold outline-none ring-2 ring-transparent focus:ring-primary transition-all text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 054 XXX XXXX"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-background border border-surface-border text-base font-bold outline-none ring-2 ring-transparent focus:ring-primary transition-all text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowGuestModal(false)}
                                    className="flex-1 py-4 rounded-xl bg-foreground/5 font-black text-xs uppercase hover:bg-foreground/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!guestName.trim()) {
                                            modal.alert("Please enter your name.", "Input Required", "warning");
                                            return;
                                        }
                                        if (!guestPhone.trim()) {
                                            modal.alert("Please enter your phone number.", "Input Required", "warning");
                                            return;
                                        }
                                        setShowGuestModal(false);
                                        handleCheckout({ name: guestName.trim(), phone: guestPhone.trim() });
                                    }}
                                    className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase hover:brightness-110 transition-colors shadow-lg shadow-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                >
                                    Proceed
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
