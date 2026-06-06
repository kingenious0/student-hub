'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SelectedModifier {
  groupName: string;
  optionName: string;
  priceDiff: number;
}

interface CheckoutFormProps {
    productId: string;
    productTitle: string;
    productPrice: number;
    email: string;
    isGuest?: boolean;
    vendorLandmark?: string;
    deliveryFee: number;
}

export default function CheckoutForm({
    productId,
    productTitle,
    productPrice,
    email,
    isGuest = false,
    vendorLandmark,
    deliveryFee
}: CheckoutFormProps) {
    const [fulfillment, setFulfillment] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
    const [fulfillmentNote, setFulfillmentNote] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [paystackPublicKey, setPaystackPublicKey] = useState(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    // Restore modifiers from sessionStorage (set by Instant Checkout on product page)
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem('omni_checkout_modifiers');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.productId === productId) {
                    setSelectedModifiers(data.selectedModifiers || []);
                    setQuantity(data.quantity || 1);
                }
                sessionStorage.removeItem('omni_checkout_modifiers');
            }
        } catch {}
    }, [productId]);

    const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + m.priceDiff, 0);
    const effectivePrice = productPrice + modifiersTotal;
    const subtotal = effectivePrice * quantity;
    const total = subtotal + (fulfillment === 'DELIVERY' ? deliveryFee : 0);

    useEffect(() => {
        const loadPaystackKey = async () => {
            try {
                const res = await fetch('/api/system/config');
                const data = await res.json();
                if (data.success && data.paystackPublicKey) {
                    setPaystackPublicKey(data.paystackPublicKey);
                }
            } catch (err) {
                console.error("Failed to load dynamic Paystack public key:", err);
            }
        };
        loadPaystackKey();
    }, []);

    const onSuccess = async (reference: { reference: string }) => {
        try {
            const res = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: reference.reference }),
            });
            const data = await res.json();
            if (data.success) {
                if ((window as any).ReactNativeWebView) {
                    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'PAYMENT_SUCCESS',
                        orderId: data.order.id
                    }));
                } else if (isGuest) {
                    window.location.href = `/order-success?ref=${reference.reference}&phone=${encodeURIComponent(guestPhone)}`;
                } else {
                    window.location.href = '/orders?success=true';
                }
            }
        } catch (error) {
            console.error('Final verification failed:', error);
            toast.error('Payment received but verification failed. Please contact support.');
        }
    };

    const onClose = () => {
        setIsCreatingOrder(false);
    };

    const handleCheckout = async () => {
        const PaystackPop = (window as unknown as {
            PaystackPop: {
                setup: (options: unknown) => { openIframe: () => void }
            }
        }).PaystackPop;

        if (!PaystackPop) {
            toast.error('Payment system (Paystack) not loaded yet. Please wait a moment or refresh.');
            return;
        }

        if (isGuest) {
            if (!guestName.trim()) {
                toast.error('Please enter your name');
                return;
            }
            if (!guestPhone.trim()) {
                toast.error('Please enter your phone number');
                return;
            }
        }

        setIsCreatingOrder(true);
        try {
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    quantity,
                    fulfillmentType: fulfillment,
                    fulfillmentNote: fulfillmentNote.trim() || null,
                    selectedModifiers,
                    ...(isGuest ? {
                        guestInfo: {
                            name: guestName.trim(),
                            phone: guestPhone.trim(),
                        }
                    } : {}),
                }),
            });
            const data = await res.json();

            if (data.success) {
                const handler = PaystackPop.setup({
                    key: paystackPublicKey,
                    email: data.email || email,
                    amount: total * 100,
                    currency: 'GHS',
                    ref: data.paystackRef,
                    metadata: {
                        custom_fields: [
                            {
                                display_name: "Order ID",
                                variable_name: "order_id",
                                value: data.paystackRef
                            }
                        ]
                    },
                    callback: function (response: { reference: string }) {
                        onSuccess(response);
                    },
                    onClose: function () {
                        onClose();
                    }
                });
                handler.openIframe();
            } else {
                toast.error(`Failed to initialize order: ${data.error}`);
                setIsCreatingOrder(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Checkout failed. Please try again.');
            setIsCreatingOrder(false);
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }} className="glass-strong rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border-2 border-surface-border/50 hover:border-primary/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full animate-pulse-glow"></div>

            {/* Guest Info Fields */}
            {isGuest && (
                <div className="space-y-4 mb-8">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4">
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Guest Checkout</p>
                        <p className="text-[10px] text-foreground/60">Enter your details to place the order. No account needed!</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full bg-background border border-surface-border rounded-2xl p-4 font-bold text-xs focus:border-primary focus:outline-none outline-none transition-all placeholder:text-foreground/20 text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="e.g. 054 XXX XXXX"
                            className="w-full bg-background border border-surface-border rounded-2xl p-4 font-bold text-xs focus:border-primary focus:outline-none outline-none transition-all placeholder:text-foreground/20 text-foreground"
                        />
                    </div>
                </div>
            )}

            {/* Fulfillment Protocol Tabs */}
            <div className="bg-background/40 border border-surface-border/50 rounded-2xl p-1 mb-8 flex gap-1 relative z-10">
                <button
                    type="button"
                    onClick={() => setFulfillment('PICKUP')}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${
                        fulfillment === 'PICKUP'
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                    }`}
                >
                    📍 Self-Pickup
                </button>
                <button
                    type="button"
                    onClick={() => setFulfillment('DELIVERY')}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${
                        fulfillment === 'DELIVERY'
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                    }`}
                >
                    🚚 Direct Delivery
                </button>
            </div>

            {/* Fulfillment Note */}
            <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 block">
                    {fulfillment === 'DELIVERY' ? '🚚 Delivery Coordinates' : '📍 Pickup Note'}
                </label>
                <textarea
                    value={fulfillmentNote}
                    onChange={(e) => setFulfillmentNote(e.target.value)}
                    placeholder={
                        fulfillment === 'DELIVERY'
                            ? 'e.g. "Wait under the tree at Atwima Gate. I\'m wearing a blue shirt. Room 203"'
                            : 'e.g. "Leaving class now, will pick up in 10 mins"'
                    }
                    className="w-full bg-background border border-surface-border rounded-2xl p-4 font-bold text-xs focus:border-primary focus:outline-none outline-none resize-none h-20 transition-all placeholder:text-foreground/20 text-foreground"
                    maxLength={200}
                />
            </div>

            {/* Selected Modifiers Summary */}
            {selectedModifiers.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Customizations</p>
                    <div className="space-y-1">
                        {selectedModifiers.map((m, i) => (
                            <div key={i} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{m.groupName}: <span className="font-bold text-foreground">{m.optionName}</span></span>
                                {m.priceDiff > 0 && <span className="font-bold text-emerald-500">+₵{m.priceDiff.toFixed(2)}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Summary */}
            <div className="space-y-6 mb-12">
                <div className="flex justify-between items-center pb-4 border-b border-surface-border">
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                        {effectivePrice !== productPrice ? 'Item (₵' + productPrice.toFixed(2) + ' + extras)' : 'Item Subtotal'}
                    </span>
                    <span className="text-foreground font-black text-lg">₵{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-surface-border">
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center bg-background rounded-xl p-1 border border-surface-border">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            aria-label="Decrease quantity"
                            className="w-11 h-11 rounded-lg bg-foreground/5 border border-surface-border flex items-center justify-center hover:bg-foreground/10 text-foreground font-black transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                        >-</button>
                        <span className="w-12 text-center text-foreground font-black">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-11 h-11 rounded-lg bg-foreground/5 border border-surface-border flex items-center justify-center hover:bg-foreground/10 text-foreground font-black transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                        >+</button>
                    </div>
                </div>

                {fulfillment === 'DELIVERY' && (
                    <div className="flex justify-between items-center pb-4 border-b border-surface-border text-primary">
                        <span className="text-[10px] font-black uppercase tracking-widest">Mission Delivery</span>
                        <span className="font-black">₵{deliveryFee.toFixed(2)}</span>
                    </div>
                )}

                {fulfillment === 'PICKUP' && vendorLandmark && (
                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                        <div className="flex items-center gap-2 text-primary text-[10px] mb-2 font-black uppercase tracking-[0.2em]">
                            <span className="text-lg">📍</span> Secure Handover
                        </div>
                        <p className="text-foreground/60 font-black text-xs uppercase tracking-tight leading-relaxed">{vendorLandmark}</p>
                    </div>
                )}
            </div>

            {/* Grand Total */}
            <div className="mb-8">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-2">Total Acquisition Cost</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-foreground tracking-tighter uppercase">₵{total.toFixed(2)}</span>
                    <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">GHS</span>
                </div>
            </div>

            {/* Pay Button */}
            <button
                type="submit"
                disabled={isCreatingOrder}
                className="w-full py-6 bg-primary hover:brightness-110 disabled:opacity-50 text-primary-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 omni-glow mb-6 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                {isCreatingOrder ? (
                    'TRANSMITTING PROTOCOL...'
                ) : (
                    'INITIALIZE PAYMENT'
                )}
            </button>

            <div className="text-center p-4 bg-foreground/5 rounded-2xl border border-surface-border">
                <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em]">
                    🔒 Protected by OMNI Escrow Shield
                </p>
            </div>
        </form>
    );
}
