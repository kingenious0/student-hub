'use client';

import { useState, useEffect } from 'react';
import { 
    SearchIcon, 
    FilterIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    PackageIcon, 
    TruckIcon, 
    CheckCircleIcon, 
    ClockIcon,
    MoreHorizontal,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Order {
    id: string;
    amount: number;
    status: string;
    items: Array<{
        product: {
            title: string;
            imageUrl: string | null;
        };
    }>;
    student: {
        name: string;
        email: string;
    };
    vendorId: string;
    runnerId: string | null;
    pickupCode: string | null;
    createdAt: string;
}

// Helper (Shared with Student Page logic basically)
const getOrderDisplay = (order: Order) => {
    const primaryItem = order.items?.[0];
    const itemTitle = primaryItem ? primaryItem.product.title : 'Unknown Item';
    const displayTitle = order.items?.length > 1 ? `${itemTitle} + ${order.items.length - 1} more` : itemTitle;
    const imageUrl = primaryItem?.product.imageUrl;
    return { displayTitle, imageUrl, primaryItem };
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'ACTIVE' | 'HISTORY'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [releaseKeyInput, setReleaseKeyInput] = useState<{ [key: string]: string }>({});
    const itemsPerPage = 10;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/vendor/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReady = async (orderId: string) => {
        try {
            const res = await fetch(`/api/vendor/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'READY' }),
            });
            if (res.ok) { fetchOrders(); }
            else { alert('Update failed'); }
        } catch (error) { console.error('Update error:', error); }
    };

    const handleSelfDeliver = async (orderId: string) => {
        if (!confirm('Deliver this yourself? You will earn the delivery fee.')) return;
        try {
            const res = await fetch(`/api/vendor/orders/${orderId}/self-deliver`, { method: 'POST' });
            if (res.ok) { fetchOrders(); }
            else { const data = await res.json(); alert(`Error: ${data.error}`); }
        } catch (error) { console.error(error); }
    };

    const handleCompleteDelivery = async (orderId: string) => {
        const key = releaseKeyInput[orderId];
        if (!key || key.length !== 6) { alert('Please enter 6-digit Release Key'); return; }
        try {
            const res = await fetch(`/api/vendor/orders/${orderId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ releaseKey: key })
            });
            if (res.ok) { alert('Order Completed!'); fetchOrders(); }
            else { const data = await res.json(); alert(`${data.error}`); }
        } catch (e) { console.error(e); }
    };

    // Filter Logic
    const getFilteredOrders = () => {
        let filtered = orders;
        
        // Tab Filter
        if (activeTab === 'NEW') filtered = filtered.filter(o => o.status === 'PAID');
        else if (activeTab === 'ACTIVE') filtered = filtered.filter(o => ['PREPARING', 'READY', 'PICKED_UP'].includes(o.status));
        else if (activeTab === 'HISTORY') filtered = filtered.filter(o => ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status));

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(o => 
                o.id.toLowerCase().includes(lowerQuery) ||
                o.student.name.toLowerCase().includes(lowerQuery) ||
                getOrderDisplay(o).displayTitle.toLowerCase().includes(lowerQuery)
            );
        }

        return filtered;
    };

    const filtered = getFilteredOrders();
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const getCount = (statuses: string[]) => orders.filter(o => statuses.includes(o.status)).length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">New Order</Badge>;
            case 'PREPARING': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Preparing</Badge>;
            case 'READY': return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">Ready for Pickup</Badge>;
            case 'PICKED_UP': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">On the Way</Badge>;
            case 'COMPLETED': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Completed</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground text-sm">Manage and track your customer orders.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            className="pl-9 w-[250px] bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
                    {[
                        { id: 'ALL', label: 'All Orders' },
                        { id: 'NEW', label: 'New', count: getCount(['PAID']) },
                        { id: 'ACTIVE', label: 'Processing', count: getCount(['PREPARING', 'READY', 'PICKED_UP']) },
                        { id: 'HISTORY', label: 'History', count: getCount(['COMPLETED', 'CANCELLED', 'REFUNDED']) },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
                            className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
                                activeTab === tab.id 
                                    ? 'text-primary' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-2 bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((order) => {
                                    const { displayTitle, imageUrl } = getOrderDisplay(order);
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono text-xs font-medium">#{order.id.slice(0, 8)}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{formatDate(order.createdAt)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{order.student.name}</span>
                                                    <span className="text-xs text-muted-foreground">{order.student.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {imageUrl && (
                                                        <div className="w-8 h-8 rounded-md bg-muted overflow-hidden flex-shrink-0">
                                                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm truncate max-w-[200px]" title={displayTitle}>{displayTitle}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                                            <TableCell className="text-right font-medium">₵{(order.amount * 0.95).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {order.status === 'PAID' && (
                                                        <Button size="sm" onClick={() => handleMarkReady(order.id)}>
                                                            Accept
                                                        </Button>
                                                    )}
                                                    {order.status === 'PREPARING' && (
                                                        <Button size="sm" onClick={() => handleMarkReady(order.id)}>
                                                            Mark Ready
                                                        </Button>
                                                    )}
                                                    {order.status === 'READY' && !order.runnerId && (
                                                        <Button size="sm" variant="outline" onClick={() => handleSelfDeliver(order.id)}>
                                                            Self-Deliver
                                                        </Button>
                                                    )}
                                                    {order.status === 'PICKED_UP' && (
                                                        <div className="flex items-center gap-2">
                                                            <Input 
                                                                className="w-20 h-8 text-center text-xs" 
                                                                placeholder="Key" 
                                                                maxLength={6}
                                                                value={releaseKeyInput[order.id] || ''}
                                                                onChange={(e) => setReleaseKeyInput({ ...releaseKeyInput, [order.id]: e.target.value })}
                                                            />
                                                            <Button size="sm" size-icon className="h-8 w-8 p-0" onClick={() => handleCompleteDelivery(order.id)}>
                                                                <CheckCircleIcon className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                                            <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">Report Issue</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-4">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
            
            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>Designed by PraiseTech • github/praisetechzw</p>
            </div>
        </div>
    );
}
