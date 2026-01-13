'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
        if (!confirm('Are you sure you want to delete this flash sale?')) return;

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

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/dashboard/admin" className="text-sm text-foreground/60 hover:text-foreground mb-2 inline-block">
                            ← Back to Admin Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">
                            ⚡ Flash Sales CMS
                        </h1>
                        <p className="text-foreground/60 mt-2">Manage flash sales like Jumia</p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-lg"
                    >
                        + Create Flash Sale
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Total Sales"
                        value={flashSales.length}
                        icon="⚡"
                        color="from-orange-500 to-red-500"
                    />
                    <StatCard
                        label="Active Now"
                        value={flashSales.filter(s => s.isActive).length}
                        icon="🔥"
                        color="from-green-500 to-emerald-500"
                    />
                    <StatCard
                        label="Scheduled"
                        value={flashSales.filter(s => new Date(s.startTime) > new Date()).length}
                        icon="📅"
                        color="from-blue-500 to-indigo-500"
                    />
                    <StatCard
                        label="Expired"
                        value={flashSales.filter(s => new Date(s.endTime) < new Date()).length}
                        icon="⏰"
                        color="from-gray-500 to-gray-600"
                    />
                </div>

                {/* Flash Sales List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-foreground/60 mt-4">Loading flash sales...</p>
                    </div>
                ) : flashSales.length === 0 ? (
                    <div className="text-center py-12 bg-surface border border-surface-border rounded-3xl">
                        <div className="text-6xl mb-4">⚡</div>
                        <h2 className="text-2xl font-black text-foreground mb-2">No Flash Sales Yet</h2>
                        <p className="text-foreground/60 mb-6">Create your first flash sale to get started!</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform"
                        >
                            Create Flash Sale
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {flashSales.map((sale) => (
                            <FlashSaleCard
                                key={sale.id}
                                sale={sale}
                                onToggle={() => toggleSaleStatus(sale.id, sale.isActive)}
                                onDelete={() => deleteSale(sale.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {showCreateModal && (
                    <CreateFlashSaleModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchFlashSales();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white`}>
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-3xl font-black">{value}</div>
            <div className="text-sm font-bold opacity-90">{label}</div>
        </div>
    );
}

function FlashSaleCard({ sale, onToggle, onDelete }: any) {
    const isActive = sale.isActive && new Date(sale.endTime) > new Date();
    const isExpired = new Date(sale.endTime) < new Date();
    const isScheduled = new Date(sale.startTime) > new Date();

    const stockRemaining = sale.stockLimit - sale.stockSold;
    const stockPercent = (stockRemaining / sale.stockLimit) * 100;

    return (
        <div className="bg-surface border border-surface-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-6">
                {/* Product Image */}
                <div className="w-24 h-24 bg-surface-hover rounded-xl overflow-hidden flex-shrink-0">
                    {sale.product.imageUrl ? (
                        <img src={sale.product.imageUrl} alt={sale.product.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                    )}
                </div>

                {/* Sale Info */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-xl font-black text-foreground">{sale.name}</h3>
                            <p className="text-sm text-foreground/60">{sale.product.title}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            {isActive && !isExpired && (
                                <span className="px-3 py-1 bg-green-500 text-white text-xs font-black uppercase rounded-full">
                                    🔥 Live
                                </span>
                            )}
                            {isScheduled && (
                                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-black uppercase rounded-full">
                                    📅 Scheduled
                                </span>
                            )}
                            {isExpired && (
                                <span className="px-3 py-1 bg-gray-500 text-white text-xs font-black uppercase rounded-full">
                                    ⏰ Expired
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-3xl font-black text-primary">₵{sale.salePrice}</span>
                        <span className="text-lg text-foreground/40 line-through">₵{sale.originalPrice}</span>
                        <span className="px-2 py-1 bg-red-500 text-white text-sm font-black rounded">
                            -{sale.discountPercent}%
                        </span>
                    </div>

                    {/* Stock Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground/60">Stock</span>
                            <span className="font-bold text-foreground">
                                {stockRemaining} / {sale.stockLimit} left
                            </span>
                        </div>
                        <div className="w-full bg-surface-hover rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${stockPercent > 50 ? 'bg-green-500' : stockPercent > 20 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${stockPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="flex items-center gap-4 text-sm text-foreground/60 mb-4">
                        <div>
                            <span className="font-bold">Start:</span> {new Date(sale.startTime).toLocaleString()}
                        </div>
                        <div>
                            <span className="font-bold">End:</span> {new Date(sale.endTime).toLocaleString()}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onToggle}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${sale.isActive
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-surface-hover text-foreground hover:bg-surface-border'
                                }`}
                        >
                            {sale.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                            onClick={onDelete}
                            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500/20 transition-all"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreateFlashSaleModal({ onClose, onSuccess }: any) {
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
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to create flash sale');
            }
        } catch (error) {
            console.error('Failed to create flash sale:', error);
            alert('Failed to create flash sale');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-surface-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-surface-border">
                    <h2 className="text-2xl font-black text-foreground">Create Flash Sale</h2>
                    <p className="text-foreground/60 text-sm mt-1">Set up a new flash sale campaign</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Campaign Name */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Campaign Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Weekend Tech Deals"
                            className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    {/* Select Product */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Select Product</label>
                        {loading ? (
                            <div className="text-foreground/60">Loading products...</div>
                        ) : (
                            <select
                                value={formData.productId}
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                required
                            >
                                <option value="">Choose a product...</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.title} - ₵{product.price}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Discount Percent */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">
                            Discount Percentage ({formData.discountPercent}%)
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="70"
                            step="5"
                            value={formData.discountPercent}
                            onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-foreground/60 mt-1">
                            <span>10%</span>
                            <span>70%</span>
                        </div>
                    </div>

                    {/* Stock Limit */}
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Stock Limit</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.stockLimit}
                            onChange={(e) => setFormData({ ...formData, stockLimit: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">Start Time</label>
                            <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">End Time</label>
                            <input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating...' : 'Create Flash Sale'}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-surface-hover text-foreground rounded-xl font-bold text-sm hover:bg-surface-border transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
