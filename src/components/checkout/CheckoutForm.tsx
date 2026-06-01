'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface CheckoutFormProps {
    productId: string;
    productTitle: string;
    productPrice: number;
    email: string;
    vendorLandmark?: string;
    deliveryFee: number;
}

export default function CheckoutForm({
    productId,
    productTitle,
    productPrice,
    email,
    vendorLandmark,
    deliveryFee
}: CheckoutFormProps) {
    const [fulfillment, setFulfillment] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
    const [quantity, setQuantity] = useState(1);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const subtotal = productPrice * quantity;
    const total = subtotal + (fulfillment === 'DELIVERY' ? deliveryFee : 0);

    const onSuccess = async (reference: { reference: string }) => {
        // After Paystack success, verify on our backend
        try {
            const res = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: reference.reference,
                }),
            });
            const data = await res.json();
            if (data.success) {
                // Check for Mobile WebView
                if ((window as any).ReactNativeWebView) {
                    (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'PAYMENT_SUCCESS',
                        orderId: data.order.id
                    }));
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
        // Pre-check for Paystack (Avoid orphan orders)
        const PaystackPop = (window as unknown as {
            PaystackPop: {
                setup: (options: unknown) => { openIframe: () => void }
            }
        }).PaystackPop;

        if (!PaystackPop) {
            toast.error('Payment system (Paystack) not loaded yet. Please wait a moment or refresh.');
            return;
        }

        setIsCreatingOrder(true);
        try {
            // 1. Create the order in our database first
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    quantity,
                    fulfillmentType: fulfillment
                }),
            });
            const data = await res.json();

            if (data.success) {
                // 2. Launch Paystack using the Inline script
                const handler = PaystackPop.setup({
                    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                    email: email,
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
        <div className="glass-strong rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border-2 border-surface-border/50 hover:border-primary/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full animate-pulse-glow"></div>

            {/* Fulfillment: Locked to Pick-up for MVP */}
            <div className="bg-background rounded-2xl p-4 mb-8 border border-surface-border text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    📍 FULFILLMENT PROTOCOL: SELF-PICKUP (CAMPUS HANDOVER)
                </p>
                <p className="text-[8px] text-foreground/40 uppercase tracking-[0.15em] mt-1 font-bold">
                    Collect physically at the vendor drop-off hotspot
                </p>
            </div>

            {/* Order Summary */}
            <div className="space-y-6 mb-12">
                <div className="flex justify-between items-center pb-4 border-b border-surface-border">
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Item Subtotal</span>
                    <span className="text-foreground font-black text-lg">₵{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-surface-border">
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center bg-background rounded-xl p-1 border border-surface-border">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-lg bg-foreground/5 border border-surface-border flex items-center justify-center hover:bg-foreground/10 text-foreground font-black transition-colors"
                        >-</button>
                        <span className="w-12 text-center text-foreground font-black">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-foreground/5 border border-surface-border flex items-center justify-center hover:bg-foreground/10 text-foreground font-black transition-colors"
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
                onClick={handleCheckout}
                disabled={isCreatingOrder}
                className="w-full py-6 bg-primary hover:brightness-110 disabled:opacity-50 text-primary-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 omni-glow mb-6"
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
        </div>
    );
}
