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
                // Unwrap params (Next.js 15 requirement, though usually sync in client components but good practice)
                const { id } = await params; // Just to be safe if it's a promise in future
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
                        <CardDescription>Estimated delivery time depends on runner availability.</CardDescription>
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
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <a
                                        href={`tel:${order.vendor.phoneNumber}`}
                                        className="py-2.5 px-4 bg-background border border-surface-border rounded-xl text-[10px] font-black uppercase tracking-wider text-center text-foreground hover:bg-foreground/5 transition-all block"
                                    >
                                        📞 Call Vendor
                                    </a>
                                    <a
                                        href={`https://wa.me/${order.vendor.phoneNumber.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(order.vendor.shopName || 'Vendor')},%20I'm%20coordinating%20my%20order%20%23${order.id.slice(-6).toUpperCase()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all block shadow-md shadow-emerald-500/10 border border-transparent"
                                    >
                                        💬 WhatsApp
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
                </div>
            </div>

            {/* OMNI Signature */}
            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>© 2026 OMNI Student Marketplace • All Rights Reserved</p>
            </div>
        </div>
    );
}
