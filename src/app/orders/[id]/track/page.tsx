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
    pickupCode: string | null;
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
    };
    runner?: {
        name: string;
    };
    total: number;
}

const STEPS = [
    { id: 'PAID', label: 'Order Confirmed', icon: Package, description: 'We have received your order.' },
    { id: 'PREPARING', label: 'Preparing', icon: ChefHat, description: 'Vendor is preparing your items.' },
    { id: 'READY', label: 'Ready for Pickup', icon: MapPin, description: 'Your order is ready for pickup.' },
    { id: 'PICKED_UP', label: 'On the Way', icon: Truck, description: 'Runner has picked up your order.' },
    { id: 'COMPLETED', label: 'Delivered', icon: Home, description: 'Enjoy your purchase!' },
];

const STATUS_ORDER = ['PENDING', 'PAID', 'PREPARING', 'READY', 'PICKED_UP', 'COMPLETED'];

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
                                <span>Total</span>
                                <span>₵{order.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delivery Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Delivery Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Vendor</span>
                                <span className="font-medium">{order.vendor.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Runner</span>
                                <span className="font-medium">{order.runner ? order.runner.name : 'Searching...'}</span>
                            </div>
                            {order.pickupCode && (
                                <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pickup Code</p>
                                    <p className="text-2xl font-mono font-black tracking-widest">{order.pickupCode}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Show this to the runner upon delivery.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* PraiseTech Signature */}
            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>Designed by PraiseTech • github/praisetechzw</p>
            </div>
        </div>
    );
}
