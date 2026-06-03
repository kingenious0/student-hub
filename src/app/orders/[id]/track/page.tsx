'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, 
    Circle, 
    Package, 
    ChefHat, 
    Truck, 
    Home, 
    ArrowLeft,
    Clock,
    MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Order {
    id: string;
    status: string;
    createdAt: string;
    releaseKey: string | null;
    fulfillmentType: 'PICKUP' | 'DELIVERY';
    fulfillmentNote: string | null;
    items: Array<{
        product: {
            id: string;
            title: string;
            imageUrl: string | null;
            price: number;
        };
        quantity: number;
    }>;
    vendor: {
        name: string;
        shopName: string | null;
        phoneNumber: string | null;
    };
    amount: number;
}

const STEPS = [
    { id: 'PAID', label: 'Order Confirmed', icon: Package, description: 'Payment received.' },
    { id: 'PREPARING', label: 'Preparing', icon: ChefHat, description: 'Vendor is preparing your items.' },
    { id: 'READY', label: 'Ready for Handoff', icon: MapPin, description: 'Awaiting pickup or direct vendor drop-off.' },
    { id: 'COMPLETED', label: 'Completed', icon: Home, description: 'Handoff confirmed. Enjoy!' },
];

const STATUS_ORDER = ['PENDING', 'PAID', 'PREPARING', 'READY', 'COMPLETED'];

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { id } = await params;
                const res = await fetch(`/api/orders/${id}`);
                if (!res.ok) throw new Error('Failed to load order');
                const data = await res.json();
                setOrder(data.order);
            } catch (err) {
                setError('Could not load tracking information');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        const interval = setInterval(fetchOrder, 10000);

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') fetchOrder();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [params]);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <p className="text-destructive mb-4">{error || 'Order not found'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
        </div>
    );

    const currentStepIndex = STATUS_ORDER.indexOf(order.status);
    const isCancelled = order.status === 'CANCELLED';

    const getStepStatus = (stepId: string) => {
        if (isCancelled) return 'cancelled';
        const stepIndex = STATUS_ORDER.indexOf(stepId);
        if (currentStepIndex > stepIndex) return 'completed';
        if (currentStepIndex === stepIndex) return 'current';
        return 'pending';
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold">Track Order</h1>
                        <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                    </div>
                    <div className="ml-auto">
                        <Badge variant={isCancelled ? "destructive" : "outline"}>
                            {order.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-6">
                {/* Timeline Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Estimated delivery time depends on vendor preparation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isCancelled ? (
                            <div className="text-center py-8 text-destructive">
                                <p className="font-bold text-lg">Order Cancelled</p>
                                <p className="text-sm opacity-80">This order has been cancelled.</p>
                            </div>
                        ) : (
                            <div className="relative space-y-8 pl-2">
                                {/* Vertical Line */}
                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border -z-10" />

                                {STEPS.map((step) => {
                                    const status = getStepStatus(step.id);
                                    const Icon = step.icon;
                                    
                                    return (
                                        <div key={step.id} className="flex items-start gap-4 bg-background">
                                            <div className={`
                                                relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                                                ${status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 
                                                  status === 'current' ? 'bg-background border-primary text-primary ring-4 ring-primary/20' : 
                                                  'bg-background border-muted text-muted-foreground'}
                                            `}>
                                                {status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                            </div>
                                            <div className={`flex-1 pt-1 ${status === 'pending' ? 'opacity-50' : ''}`}>
                                                <h3 className="font-semibold leading-none">{step.label}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Order Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Order Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{item.quantity}x {item.product.title}</span>
                                        <span className="font-medium">₵{(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                                <span>Total Paid</span>
                                <span>₵{order.amount.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Handoff Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Vendor Shop</span>
                                <span className="font-medium">{order.vendor.shopName || order.vendor.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Fulfillment</span>
                                <span className="font-bold text-xs uppercase tracking-wider text-primary animate-pulse-glow">
                                    {order.fulfillmentType === 'DELIVERY' ? '🚚 Direct Delivery' : '📍 Self-Pickup'}
                                </span>
                            </div>

                            {order.fulfillmentNote && (
                                <div className="p-3 bg-foreground/5 rounded-xl border border-surface-border/50 text-xs">
                                    <span className="font-bold text-[9px] uppercase tracking-wider text-foreground/45 block mb-1">Fulfillment Note</span>
                                    <p className="font-semibold text-foreground/75 leading-relaxed">{order.fulfillmentNote}</p>
                                </div>
                            )}

                            {order.vendor.phoneNumber && (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <a
                                        href={`tel:${order.vendor.phoneNumber}`}
                                        className="py-3 px-4 bg-background border border-surface-border rounded-2xl text-[10px] font-black uppercase tracking-wider text-foreground hover:bg-foreground/5 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-3.5 h-3.5 fill-current text-primary" viewBox="0 0 24 24">
                                            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.57a1 1 0 00-1.01.24l-2.2 2.2a15.09 15.09 0 01-6.59-6.59l2.2-2.2a1 1 0 00.24-1.01 11.4 11.4 0 01-.57-3.53A1 1 0 0011 3H4a1 1 0 00-1 1 17 17 0 0017 17 1 1 0 001 -1v-7a1 1 0 00-1-1z" />
                                        </svg>
                                        Call Vendor
                                    </a>
                                    <a
                                        href={`https://wa.me/${order.vendor.phoneNumber.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(order.vendor.shopName || 'Vendor')},%20I'm%20coordinating%20my%20order%20%23${order.id.slice(-6).toUpperCase()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 border border-transparent"
                                    >
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.588 1.971 14.12 .947 11.5 1.946c-5.438 0-9.862 4.371-9.866 9.8.001 1.716.463 3.39 1.337 4.866L1.93 21.054l4.717-1.727zM16.86 14.85c-.262-.13-1.552-.765-1.792-.852-.24-.087-.415-.13-.59.13-.175.26-.677.852-.83.1 .027-.152.152-.305.24-.567.13-.262.065-.492-.033-.622-.097-.13-.787-1.897-1.077-2.593-.282-.676-.572-.587-.788-.597-.203-.01-.437-.01-.67-.01-.233 0-.612.087-.932.437-.32.35-1.222 1.197-1.222 2.91 0 1.712 1.25 3.367 1.425 3.6.175.233 2.46 3.757 5.96 5.27.832.36 1.482.575 1.99.736.837.266 1.598.228 2.2.138.672-.1 2.072-.847 2.362-1.666.29-.82.29-1.522.203-1.666-.088-.145-.32-.233-.582-.363z" />
                                        </svg>
                                        WhatsApp
                                    </a>
                                </div>
                            )}

                            {order.releaseKey && order.status !== 'COMPLETED' && (
                                <div className="mt-4 p-5 bg-primary/5 rounded-2xl text-center border border-primary/10 relative overflow-hidden animate-pulse-glow">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-2">Secure Release Key</p>
                                    <p className="text-3xl font-mono font-black tracking-[0.3em] text-foreground pl-2">{order.releaseKey}</p>
                                    <p className="text-[9px] text-foreground/40 mt-3 font-bold uppercase tracking-wider leading-relaxed">
                                        Give this 6-digit key to the vendor when you receive your package.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {order.status === 'COMPLETED' && order.items.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Rate Your Experience</CardTitle>
                                <CardDescription>Let others know what you think about these items.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {order.items.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/products/${item.product.id}`}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-surface overflow-hidden flex-shrink-0">
                                                {item.product.imageUrl ? (
                                                    <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-foreground/20 text-xs font-black">?</div>
                                                )}
                                            </div>
                                            <span className="text-sm font-bold text-foreground/80">{item.product.title} ×{item.quantity}</span>
                                        </div>
                                        <span className="text-xs font-black text-primary uppercase tracking-wider group-hover:underline">Write Review →</span>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* OMNI Signature */}
            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>© 2026 OMNI Student Marketplace • All Rights Reserved</p>
            </div>
        </div>
    );
}
