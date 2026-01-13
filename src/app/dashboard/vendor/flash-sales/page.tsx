'use client';

import { useState, useEffect } from 'react';

export default function VendorFlashSalesPage() {
    const [flashSales, setFlashSales] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        productId: '',
        discountPercent: '',
        stockLimit: '',
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        fetchFlashSales();
        fetchProducts();
    }, []);

    const fetchFlashSales = async () => {
        try {
            const res = await fetch('/api/vendor/flash-sales');
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

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/vendor/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/vendor/flash-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('✅ Flash sale created!');
                setShowForm(false);
                fetchFlashSales();
                setFormData({
                    name: '',
                    productId: '',
                    discountPercent: '',
                    stockLimit: '',
                    startTime: '',
                    endTime: '',
                });
            } else {
                const error = await res.json();
                alert(`❌ ${error.error || 'Failed to create flash sale'}`);
            }
        } catch (error) {
            console.error('Create error:', error);
            alert('❌ Something went wrong');
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/vendor/flash-sales/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive }),
            });

            if (res.ok) {
                fetchFlashSales();
            }
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this flash sale?')) return;

        try {
            const res = await fetch(`/api/vendor/flash-sales/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('✅ Flash sale deleted!');
                fetchFlashSales();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-surface border-b border-surface-border py-6 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Flash Sales</h1>
                        <p className="text-foreground/60 mt-1">Create limited-time deals</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform"
                    >
                        ⚡ Create Flash Sale
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Flash Sales List */}
                {flashSales.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">⚡</div>
                        <h2 className="text-2xl font-black mb-2">No Flash Sales Yet</h2>
                        <p className="text-foreground/60 mb-6">Create your first flash sale to boost sales</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform"
                        >
                            Create Flash Sale
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {flashSales.map((sale) => (
                            <div
                                key={sale.id}
                                className="bg-surface border-2 border-surface-border rounded-2xl p-6"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-lg">{sale.name}</h3>
                                        <p className="text-sm text-foreground/60">{sale.product?.title}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black ${sale.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                                        }`}>
                                        {sale.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Discount</p>
                                        <p className="text-2xl font-black text-primary">-{sale.discountPercent}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground/40 uppercase tracking-wider mb-1">Stock</p>
                                        <p className="text-lg font-bold">{sale.stockSold}/{sale.stockLimit}</p>
                                    </div>
                                </div>

                                <div className="text-xs text-foreground/60 mb-4">
                                    <p>Start: {new Date(sale.startTime).toLocaleString()}</p>
                                    <p>End: {new Date(sale.endTime).toLocaleString()}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggle(sale.id, sale.isActive)}
                                        className={`flex-1 py-2 rounded-lg font-bold text-sm ${sale.isActive
                                                ? 'bg-yellow-500/10 text-yellow-500'
                                                : 'bg-green-500/10 text-green-500'
                                            }`}
                                    >
                                        {sale.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sale.id)}
                                        className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg font-bold text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-background border-2 border-surface-border rounded-3xl max-w-2xl w-full my-8">
                        <div className="p-8 border-b border-surface-border">
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Create Flash Sale</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                    Sale Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Weekend Tech Deals"
                                    className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                    Product *
                                </label>
                                <select
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                    required
                                >
                                    <option value="">Select a product</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.title} (₵{p.price})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                        Discount % *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discountPercent}
                                        onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                        placeholder="30"
                                        min="1"
                                        max="99"
                                        className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                        Stock Limit *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stockLimit}
                                        onChange={(e) => setFormData({ ...formData, stockLimit: e.target.value })}
                                        placeholder="10"
                                        min="1"
                                        className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                        Start Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                        End Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform"
                                >
                                    Create Flash Sale
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-4 bg-surface-hover text-foreground rounded-xl font-bold text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
