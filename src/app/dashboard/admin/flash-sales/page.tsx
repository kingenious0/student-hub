'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Zap, 
  Flame, 
  Calendar, 
  Clock, 
  Trash2, 
  Check, 
  Plus, 
  X,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashSale {
    id: string;
    name: string;
    product: {
        id: string;
        title: string;
        imageUrl: string | null;
    };
    originalPrice: number;
    salePrice: number;
    discountPercent: number;
    startTime: string;
    endTime: string;
    stockLimit: number;
    stockSold: number;
    isActive: boolean;
}

export default function FlashSalesAdminPage() {
    const router = useRouter();
    const modal = useModal();
    const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchFlashSales();
    }, []);

    const fetchFlashSales = async () => {
        try {
            const res = await fetch('/api/admin/flash-sales');
            if (res.ok) {
                const data = await res.json();
                setFlashSales(data.flashSales || []);
            }
        } catch (error) {
            console.error('Failed to fetch flash sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSaleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/flash-sales/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (res.ok) {
                fetchFlashSales();
            }
        } catch (error) {
            console.error('Failed to toggle sale status:', error);
        }
    };

    const deleteSale = async (id: string) => {
        const confirmed = await modal.confirm('Are you sure you want to delete this flash sale? This will immediately remove it from the pulse feed.', 'Delete Flash Sale');
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/flash-sales/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchFlashSales();
            }
        } catch (error) {
            console.error('Failed to delete sale:', error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 } 
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:p-8">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-12"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Link href="/dashboard/admin" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 block hover:opacity-70 transition-all flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
                        </Link>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter flex items-center gap-3">
                            <Zap className="w-10 h-10 text-primary" /> Flash Sales CMS
                        </h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Manage flash sales campaign operations</p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3.5 bg-primary text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10 self-start md:self-auto flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        <span>Create Flash Sale</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { 
                            label: 'Total Sales', 
                            value: flashSales.length, 
                            icon: <Zap className="w-6 h-6 text-primary" />,
                            gradient: "from-primary via-orange-500 to-red-500",
                            shadow: "shadow-primary/5"
                        },
                        { 
                            label: 'Active Now', 
                            value: flashSales.filter(s => s.isActive && new Date(s.endTime) > new Date() && new Date(s.startTime) < new Date()).length, 
                            icon: <Flame className="w-6 h-6 text-emerald-500" />,
                            gradient: "from-green-500 to-emerald-500",
                            shadow: "shadow-emerald-500/5"
                        },
                        { 
                            label: 'Scheduled', 
                            value: flashSales.filter(s => new Date(s.startTime) > new Date()).length, 
                            icon: <Calendar className="w-6 h-6 text-blue-500" />,
                            gradient: "from-blue-500 to-indigo-500",
                            shadow: "shadow-blue-500/5"
                        },
                        { 
                            label: 'Expired', 
                            value: flashSales.filter(s => new Date(s.endTime) < new Date()).length, 
                            icon: <Clock className="w-6 h-6 text-foreground/40" />,
                            gradient: "from-gray-500 to-gray-600",
                            shadow: "shadow-gray-500/5"
                        },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i} 
                            variants={cardVariants}
                            className={cn(
                                "relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-5 shadow-lg",
                                stat.shadow
                            )}
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r          ", stat.gradient)} />
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] block">
                                        {stat.label}
                                    </span>
                                    <span className="text-2xl font-black font-mono tracking-tighter text-foreground block mt-1">
                                        {stat.value}
                                    </span>
                                </div>
                                <div className="p-2.5 bg-foreground/[0.03] rounded-xl border border-surface-border">
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Flash Sales List */}
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : flashSales.length === 0 ? (
                    <motion.div 
                        variants={cardVariants}
                        className="bg-surface border border-surface-border rounded-[2.5rem] p-16 sm:p-24 text-center shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/50 to-primary/10" />
                        <div className="text-6xl mb-6 opacity-30">⚡</div>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">No Active campaigns</h2>
                        <p className="text-foreground/40 font-black uppercase tracking-widest text-[9px] mb-6">Create your first flash sale campaign parameters to launch.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3.5 bg-primary text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-transform"
                        >
                            Create Campaign
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence>
                            {flashSales.map((sale) => (
                                <motion.div 
                                    layout
                                    key={sale.id}
                                    variants={cardVariants}
                                    className="bg-surface border border-surface-border rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group shadow-2xl"
                                >
                                    <FlashSaleCardInner
                                        sale={sale}
                                        onToggle={() => toggleSaleStatus(sale.id, sale.isActive)}
                                        onDelete={() => deleteSale(sale.id)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <CreateFlashSaleModal
                        onClose={() => setShowCreateModal(false)}
                        modal={modal}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchFlashSales();
                        }}
                    />
                )}
            </motion.div>
        </div>
    );
}

function FlashSaleCardInner({ sale, onToggle, onDelete }: any) {
    const isActive = sale.isActive && new Date(sale.endTime) > new Date();
    const isExpired = new Date(sale.endTime) < new Date();
    const isScheduled = new Date(sale.startTime) > new Date();

    const stockRemaining = sale.stockLimit - sale.stockSold;
    const stockPercent = (stockRemaining / sale.stockLimit) * 100;

    return (
        <>
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-orange-500 to-red-500" />
            <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 pt-2">
                {/* Product Image */}
                <div className="w-24 h-24 bg-foreground/[0.03] border border-surface-border rounded-2xl overflow-hidden flex-shrink-0 relative">
                    {sale.product.imageUrl ? (
                        <img src={sale.product.imageUrl} alt={sale.product.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                    )}
                </div>

                {/* Sale Info */}
                <div className="flex-1 min-w-0 space-y-4 w-full">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter truncate">{sale.name}</h3>
                            <p className="text-xs font-bold text-foreground/50 uppercase tracking-wide truncate">{sale.product.title}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 shrink-0">
                            {isActive && !isExpired && (
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-xl">
                                    🔥 Live
                                </span>
                            )}
                            {isScheduled && (
                                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-xl">
                                    📅 Scheduled
                                </span>
                            )}
                            {isExpired && (
                                <span className="px-3 py-1 bg-foreground/[0.06] border border-surface-border text-foreground/40 text-[9px] font-black uppercase tracking-widest rounded-xl">
                                    ⏰ Expired
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Receipt breakdown wrapper style */}
                    <div className="bg-foreground/[0.02] border border-surface-border rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-foreground/60 w-full">
                        <div className="space-y-2.5">
                            <div className="flex justify-between border-b border-dashed border-surface-border/60 pb-2">
                                <span className="text-foreground/30 text-[9px] font-black tracking-widest">Pricing Strategy</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-base font-black font-mono text-primary">₵{sale.salePrice}</span>
                                    <span className="text-foreground/30 line-through font-mono">₵{sale.originalPrice}</span>
                                    <span className="text-red-500 font-black text-[10px]">(-{sale.discountPercent}%)</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-foreground/30 text-[9px] font-black tracking-widest">Time Window</span>
                                <span className="text-foreground font-black font-mono text-[10px]">
                                    {new Date(sale.startTime).toLocaleDateString()} - {new Date(sale.endTime).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="text-foreground/30 text-[9px] font-black tracking-widest">Campaign Stock</span>
                                <span className="font-black text-foreground font-mono">
                                    {stockRemaining} / {sale.stockLimit} Left
                                </span>
                            </div>
                            <div className="w-full bg-background border border-surface-border rounded-full h-2">
                                <div
                                    className={cn(
                                        "h-1.5 rounded-full transition-all m-[1px]",
                                        stockPercent > 50 ? 'bg-emerald-500' : stockPercent > 20 ? 'bg-orange-500' : 'bg-red-500'
                                    )}
                                    style={{ width: `calc(${stockPercent}% - 2px)` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={onToggle}
                            className={cn(
                                "px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border",
                                sale.isActive
                                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white'
                                    : 'bg-foreground/[0.04] border-surface-border text-foreground hover:bg-foreground/[0.08]'
                            )}
                        >
                            {sale.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                            onClick={onDelete}
                            className="px-5 py-3 bg-red-500/10 border border-red-500/25 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function CreateFlashSaleModal({ onClose, onSuccess, modal }: any) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        productId: '',
        discountPercent: 30,
        stockLimit: 10,
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/flash-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success('Flash sale campaign initialized! ⚡');
                onSuccess();
            } else {
                const data = await res.json();
                modal.alert(data.error || 'The system rejected the campaign parameters.', 'Protocol Error', 'error');
            }
        } catch (error) {
            console.error('Failed to create flash sale:', error);
            modal.alert('A link failure prevented the campaign from going live.', 'Transmission Error', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-surface-border rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-orange-500" />
                <div className="absolute top-1.5 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />
                
                <div className="p-6 sm:p-8 border-b border-dashed border-surface-border/60 flex justify-between items-start pt-8">
                    <div>
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Create Flash Sale</h2>
                        <p className="text-foreground/40 text-[9px] font-black uppercase tracking-widest mt-1">Set up a new flash sale campaign</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-foreground/[0.04] border border-surface-border rounded-xl text-foreground/40 hover:text-foreground transition-all cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                    {/* Campaign Name */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Campaign Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Weekend Tech Deals"
                            className="w-full bg-background border-2 border-surface-border rounded-xl p-3.5 font-bold text-sm outline-none focus:border-primary text-foreground"
                            required
                        />
                    </div>

                    {/* Select Product */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Select Product</label>
                        {loading ? (
                            <div className="text-foreground/40 font-black uppercase tracking-widest text-[9px]">Loading products...</div>
                        ) : (
                            <select
                                value={formData.productId}
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                className="w-full bg-background border-2 border-surface-border rounded-xl p-3.5 font-bold text-sm outline-none focus:border-primary text-foreground appearance-none"
                                required
                            >
                                <option value="" className="bg-surface">Choose a product...</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id} className="bg-surface font-sans">
                                        {product.title} - ₵{product.price}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Discount Percent */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">
                            Discount Percentage ({formData.discountPercent}%)
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="70"
                            step="5"
                            value={formData.discountPercent}
                            onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) })}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-foreground/30 mt-1">
                            <span>10%</span>
                            <span>70%</span>
                        </div>
                    </div>

                    {/* Stock Limit */}
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Stock Limit</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.stockLimit}
                            onChange={(e) => setFormData({ ...formData, stockLimit: parseInt(e.target.value) })}
                            className="w-full bg-background border-2 border-surface-border rounded-xl p-3.5 font-bold text-sm outline-none focus:border-primary text-foreground"
                            required
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">Start Time</label>
                            <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full bg-background border-2 border-surface-border rounded-xl p-3.5 font-bold text-sm outline-none focus:border-primary text-foreground"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-foreground/40 tracking-wider">End Time</label>
                            <input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full bg-background border-2 border-surface-border rounded-xl p-3.5 font-bold text-sm outline-none focus:border-primary text-foreground"
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-6 border-t border-dashed border-surface-border/60">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-4 bg-primary text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/10 cursor-pointer"
                        >
                            {submitting ? 'Creating...' : 'Launch Campaign'}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 bg-foreground/[0.04] border border-surface-border text-foreground rounded-xl font-black uppercase text-xs tracking-widest hover:bg-foreground/[0.08] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
