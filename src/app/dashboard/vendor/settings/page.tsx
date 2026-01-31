'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Store, Phone, Clock, ArrowLeft } from "lucide-react";

export default function VendorSettingsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Placeholder state - in reality we would fetch this via React Query!
    const [shopName, setShopName] = useState("");
    const [phone, setPhone] = useState("");
    const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Settings saved successfully!");
            router.push('/dashboard/vendor');
        }, 1000);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shop Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your store identity and operational preferences.</p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>

            <div className="grid gap-6 max-w-4xl mx-auto">
                {/* Global Identity Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-primary" />
                            Global Identity
                        </CardTitle>
                        <CardDescription>This is how students see your shop on the marketplace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="shopName">Shop Name</Label>
                            <Input
                                id="shopName"
                                placeholder={user?.firstName ? `${user.firstName}'s Shop` : "My Shop"}
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                This is the public name of your store.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Contact Phone (Mobile Money)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="054XXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Used for payouts and urgent order updates.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Operations Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Delivery & Operations
                        </CardTitle>
                        <CardDescription>Configure your availability and fulfillment settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Accepting Orders</Label>
                                <p className="text-sm text-muted-foreground">
                                    Turn this off if you are closed or too busy.
                                </p>
                            </div>
                            <div 
                                onClick={() => setIsAcceptingOrders(!isAcceptingOrders)}
                                className={`
                                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                                    ${isAcceptingOrders ? 'bg-primary' : 'bg-input'}
                                `}
                            >
                                <span
                                    className={`
                                        pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform
                                        ${isAcceptingOrders ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 px-6 py-4">
                        <p className="text-xs text-muted-foreground">
                            Changes to your availability status take effect immediately.
                        </p>
                    </CardFooter>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="font-bold min-w-[120px]">
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>Designed by PraiseTech • github/praisetechzw</p>
            </div>
        </div>
    );
}
