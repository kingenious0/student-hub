'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartCheckout } from '@/hooks/useCartCheckout';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CartItem } from '@/lib/store/cart';

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
        handleCheckout
    } = useCartCheckout();

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
                                className="p-2 hover:bg-surface rounded-full transition-colors border border-transparent hover:border-surface-border"
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
                                        className="px-6 py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-95 active:scale-95 transition-all shadow-md"
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
                                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2
                                                ${fulfillmentMethod === 'delivery' 
                                                    ? 'bg-background text-primary border border-surface-border shadow-sm' 
                                                    : 'text-foreground/50 hover:text-foreground'
                                                }`}
                                        >
                                            🚀 Delivery
                                        </button>
                                        <button
                                            onClick={() => setFulfillmentMethod('pickup')}
                                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2
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
                                                        {items.map((item) => (
                                                            <div key={item.id} className="p-4 flex gap-4 items-center">
                                                                {/* Image Placeholder */}
                                                                <div className="w-12 h-12 rounded-xl bg-surface border border-surface-border flex-shrink-0 flex items-center justify-center text-xl font-bold">
                                                                    📦
                                                                </div>
                                                                {/* Item details */}
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">{item.title}</h4>
                                                                    <p className="text-xs font-black text-primary mt-0.5">₵{item.price.toFixed(2)}</p>
                                                                </div>
                                                                {/* Quantity selectors */}
                                                                <div className="flex items-center gap-2 bg-surface border border-surface-border/60 rounded-xl p-1">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-background transition-colors text-foreground/60"
                                                                    >
                                                                        <Minus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-background transition-colors text-foreground/60"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                                {/* Remove */}
                                                                <button
                                                                    onClick={() => removeFromCart(item.id)}
                                                                    className="p-2 text-foreground/30 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
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
                                        onClick={handleCheckout}
                                        disabled={isCreatingOrder}
                                        className="w-full py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110"
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
                                        className="w-full py-3 bg-surface border border-surface-border text-foreground/60 hover:text-foreground font-black text-[10px] uppercase tracking-widest rounded-xl text-center transition-colors"
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
    );
}
