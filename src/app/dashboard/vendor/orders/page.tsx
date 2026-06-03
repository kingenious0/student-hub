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
    Eye,
    ArrowLeft,
    Phone,
    Mail,
    MessageSquare,
    X,
    AlertTriangle
} from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { toast } from 'sonner';
import GoBack from '@/components/navigation/GoBack';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
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
        phoneNumber: string | null;
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

// Synthesize cash register / success double-chime using native AudioContext (zero static file dependency)
const playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Chime 1
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc1.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.6);

        // Chime 2
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5
        gain2.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
        osc2.start(audioCtx.currentTime + 0.1);
        osc2.stop(audioCtx.currentTime + 0.7);
    } catch (e) {
        console.error('Failed to play synthesized sound:', e);
    }
};

export default function VendorOrdersPage() {
    const modal = useModal();
    const router = useRouter();
    const { getToken } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ALL' | 'NEW' | 'ACTIVE' | 'HISTORY'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [releaseKeyInput, setReleaseKeyInput] = useState<{ [key: string]: string }>({});
    const [contactOrder, setContactOrder] = useState<Order | null>(null);
    const [reportOrder, setReportOrder] = useState<Order | null>(null);
    const [reportDetails, setReportDetails] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 8000); // 8s polling for fast real-time updates
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/vendor/orders', { headers });
            if (res.ok) {
                const data = await res.json();
                const newOrders = data.orders || [];

                setOrders((prevOrders) => {
                    if (prevOrders.length > 0) {
                        const oldIds = prevOrders.map(o => o.id);
                        const hasNewOrder = newOrders.some((o: any) => !oldIds.includes(o.id) && (o.status === 'PAID' || o.status === 'READY'));
                        if (hasNewOrder) {
                            playNotificationSound();
                            toast.success('🔔 NEW ORDER RECEIVED!', {
                                description: 'A customer has purchased items from your shop. Check the New tab!',
                                duration: 8000
                            });
                        }
                    }
                    return newOrders;
                });
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReady = async (orderId: string) => {
        try {
            const token = await getToken();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/vendor/orders/${orderId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status: 'READY' }),
            });
            if (res.ok) { 
                toast.success('Order status updated to READY');
                fetchOrders(); 
            }
            else { modal.alert('Failed to update order status. Please try again.', 'Update Error', 'error'); }
        } catch (error) { 
            console.error('Update error:', error); 
            modal.alert('Communication error with the server.', 'Network Error', 'error');
        }
    };

    const handleSelfDeliver = async (orderId: string) => {
        const confirmed = await modal.confirm('Deliver this yourself? You will earn the delivery fee and be responsible for the fulfillment.', 'Self-Delivery Protocol', false);
        if (!confirmed) return;
        try {
            const token = await getToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/vendor/orders/${orderId}/self-deliver`, { 
                method: 'POST',
                headers
            });
            if (res.ok) { 
                toast.success('Assigned to self-delivery');
                fetchOrders(); 
            }
            else { 
                const data = await res.json(); 
                modal.alert(`Protocol Error: ${data.error}`, 'Submission Failed', 'error'); 
            }
        } catch (error) { 
            console.error(error); 
            modal.alert('A network error occurred.', 'Link Lost', 'error');
        }
    };

    const handleCompleteDelivery = async (orderId: string) => {
        const key = releaseKeyInput[orderId];
        if (!key || key.length !== 6) { 
            toast.error('Please enter a valid 6-digit Release Key'); 
            return; 
        }
        try {
            const token = await getToken();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/vendor/orders/${orderId}/complete`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ releaseKey: key })
            });
            if (res.ok) { 
                modal.alert('✅ Order successfully completed and funds released from escrow.', 'Mission Success', 'success'); 
                fetchOrders(); 
            }
            else { 
                const data = await res.json(); 
                modal.alert(data.error || 'Verification failed.', 'Invalid Shield Key', 'error'); 
            }
        } catch (e) { 
            console.error(e); 
            modal.alert('Connection to security vault failed.', 'Network Error', 'error');
        }
    };

    const handleContactCustomer = (order: Order) => {
        setContactOrder(order);
    };

    const handleReportIssue = (order: Order) => {
        setReportOrder(order);
        setReportDetails('');
    };

    const submitReportIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportOrder || !reportDetails.trim()) return;
        setSubmittingReport(true);
        try {
            const token = await getToken();
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/support/report-issue', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    orderId: reportOrder.id,
                    details: reportDetails
                })
            });
            if (res.ok) {
                toast.success('Escrow flagged. Administrator has been alerted.');
                setReportOrder(null);
                fetchOrders();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to submit report.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error while reporting issue.');
        } finally {
            setSubmittingReport(false);
        }
    };

    // Filter Logic
    const getFilteredOrders = () => {
        let filtered = orders;
        
        // Tab Filter
        if (activeTab === 'NEW') filtered = filtered.filter(o => o.status === 'PAID');
        else if (activeTab === 'ACTIVE') filtered = filtered.filter(o => ['PREPARING', 'READY'].includes(o.status));
        else if (activeTab === 'HISTORY') filtered = filtered.filter(o => ['COMPLETED', 'CANCELLED', 'REFUNDED', 'PICKED_UP'].includes(o.status));

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
                <div className="space-y-2">
                    <GoBack fallback="/dashboard/vendor" />
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
                        { id: 'ACTIVE', label: 'Processing', count: getCount(['PREPARING', 'READY']) },
                        { id: 'HISTORY', label: 'History', count: getCount(['COMPLETED', 'CANCELLED', 'REFUNDED', 'PICKED_UP']) },
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

                <Card className="overflow-visible">
                    <div className="min-h-[350px]">
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
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-sm">₵{order.amount.toFixed(2)}</span>
                                                        <span className="text-[10px] text-emerald-400 font-medium">(Payout: ₵{(order.amount * 0.95).toFixed(2)})</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {order.status === 'PAID' && (
                                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={() => handleMarkReady(order.id)}>
                                                                Accept
                                                            </Button>
                                                        )}
                                                        {order.status === 'PREPARING' && (
                                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={() => handleMarkReady(order.id)}>
                                                                Mark Ready
                                                            </Button>
                                                        )}
                                                        {order.status === 'READY' && (
                                                            <div className="flex items-center gap-2">
                                                                <Input 
                                                                    className="w-24 h-8 text-center text-xs bg-slate-900 border-emerald-500/30 text-white placeholder-slate-500 focus-visible:ring-emerald-500" 
                                                                    placeholder="Release PIN" 
                                                                    maxLength={6}
                                                                    value={releaseKeyInput[order.id] || ''}
                                                                    onChange={(e) => setReleaseKeyInput({ ...releaseKeyInput, [order.id]: e.target.value })}
                                                                 />
                                                                 <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 animate-pulse" onClick={() => handleCompleteDelivery(order.id)}>
                                                                     Verify PIN
                                                                 </Button>
                                                             </div>
                                                         )}
                                                         {order.status === 'PICKED_UP' && (
                                                             <div className="flex items-center gap-2">
                                                                 <Input 
                                                                     className="w-24 h-8 text-center text-xs bg-slate-900 border-emerald-500/30 text-white placeholder-slate-500 focus-visible:ring-emerald-500" 
                                                                     placeholder="Release PIN" 
                                                                     maxLength={6}
                                                                     value={releaseKeyInput[order.id] || ''}
                                                                     onChange={(e) => setReleaseKeyInput({ ...releaseKeyInput, [order.id]: e.target.value })}
                                                                 />
                                                                 <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 animate-pulse" onClick={() => handleCompleteDelivery(order.id)}>
                                                                     Verify PIN
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
                                                                 <DropdownMenuItem onClick={() => router.push(`/dashboard/vendor/orders/${order.id}`)}>
                                                                     View Details
                                                                 </DropdownMenuItem>
                                                                 <DropdownMenuItem onClick={() => handleContactCustomer(order)}>
                                                                     Contact Customer
                                                                 </DropdownMenuItem>
                                                                 <DropdownMenuSeparator />
                                                                 <DropdownMenuItem className="text-destructive" onClick={() => handleReportIssue(order)}>
                                                                     Report Issue
                                                                 </DropdownMenuItem>
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
                    </div>
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

            {/* Contact Customer Modal */}
            <AnimatePresence>
                {contactOrder && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface border border-surface-border rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 relative overflow-hidden shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setContactOrder(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all focus:outline-none"
                            >
                                <X className="w-4 h-4" />
                            </button>
 
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-1 flex items-center gap-2">
                                    <Phone className="w-6 h-6 text-primary" /> Contact Customer
                                </h2>
                                <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">Choose a channel to coordinate delivery.</p>
                            </div>
 
                            {/* Customer Info Card */}
                            <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Customer</p>
                                <p className="text-lg font-bold text-foreground leading-none mb-1">{contactOrder.student.name}</p>
                                <p className="text-xs text-foreground/60">{contactOrder.student.email}</p>
                                {contactOrder.student.phoneNumber && (
                                    <p className="text-xs text-foreground/60 mt-1 font-mono">{contactOrder.student.phoneNumber}</p>
                                )}
                            </div>
 
                            {/* Action channels */}
                            <div className="space-y-3">
                                {contactOrder.student.phoneNumber ? (
                                    <>
                                        <a
                                            href={`tel:${contactOrder.student.phoneNumber}`}
                                            className="w-full py-4 bg-background border border-surface-border hover:bg-foreground/5 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <Phone className="w-4 h-4 text-primary" /> Call Phone
                                        </a>
                                        <a
                                            href={`https://wa.me/${contactOrder.student.phoneNumber.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 animate-pulse-glow"
                                        >
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M12.031 2c-5.514 0-10 4.486-10 10 0 1.968.57 3.805 1.558 5.359l-1.558 5.641 5.812-1.523c1.472.859 3.178 1.354 4.99 1.354 5.514 0 10-4.486 10-10s-4.486-10-10-10zm0 18c-1.621 0-3.134-.482-4.421-1.298l-.317-.197-3.277.859.882-3.189-.228-.363c-.888-1.421-1.401-3.109-1.401-4.912 0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm4.646-6.425c-.254-.127-1.503-.742-1.737-.825-.233-.085-.403-.127-.573.127-.17.254-.658.825-.807.994-.148.17-.297.191-.551.064-.254-.127-1.071-.395-2.04-1.26-.754-.672-1.263-1.502-1.411-1.756-.148-.254-.016-.392.111-.518.114-.114.254-.297.381-.446.127-.148.17-.254.254-.424.085-.17.042-.318-.021-.446-.064-.127-.573-1.379-.785-1.887-.207-.5-.435-.433-.594-.442-.154-.008-.33-.008-.507-.008-.178 0-.467.067-.711.332-.244.265-.933.912-.933 2.226 0 1.314.954 2.585 1.087 2.76.133.175 1.879 2.87 4.55 4.024.636.275 1.132.439 1.52.562.639.203 1.22.175 1.679.106.512-.076 1.503-.615 1.716-1.21.213-.595.213-1.104.148-1.21-.063-.105-.233-.148-.487-.275z" />
                                            </svg>
                                            Open WhatsApp
                                        </a>
                                    </>
                                ) : (
                                    <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-[10px] font-black uppercase tracking-wide">
                                        ⚠️ Phone contact not available
                                    </div>
                                )}
                                <a
                                    href={`mailto:${contactOrder.student.email}`}
                                    className="w-full py-4 bg-background border border-surface-border hover:bg-foreground/5 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Mail className="w-4 h-4 text-primary" /> Send Email
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Report Issue Modal */}
            <AnimatePresence>
                {reportOrder && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface border border-surface-border rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 relative overflow-hidden shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setReportOrder(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all focus:outline-none"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-1 flex items-center gap-2 text-rose-500">
                                    <AlertTriangle className="w-6 h-6" /> Flag Escrow Issue
                                </h2>
                                <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">Freeze the escrow and request admin vetting.</p>
                            </div>

                            <form onSubmit={submitReportIssue} className="space-y-4">
                                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-[11px] leading-relaxed text-rose-400 font-bold uppercase tracking-wide">
                                    CAUTION: Reporting an issue will temporarily freeze payout for Order #{reportOrder.id.slice(0, 8)} and notify the support administrators to resolve the conflict.
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-foreground/40">Provide issue details</label>
                                    <textarea
                                        value={reportDetails}
                                        onChange={(e) => setReportDetails(e.target.value)}
                                        rows={4}
                                        className="w-full bg-background/50 border border-surface-border rounded-xl p-4 font-bold text-xs focus:border-primary outline-none transition-all placeholder:text-foreground/20 text-foreground resize-none"
                                        placeholder="Explain the problem (e.g. customer refused to share release key, item rejected, incorrect address, etc.)"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingReport || !reportDetails.trim()}
                                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-600/20 flex items-center justify-center"
                                >
                                    {submittingReport ? 'TRANSMITTING ALERTS...' : 'ALERT ADMINISTRATOR'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>© 2026 OMNI Student Marketplace • All Rights Reserved</p>
            </div>
        </div>
    );
}
