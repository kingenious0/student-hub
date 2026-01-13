'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        stockQuantity: '',
    });

    useEffect(() => {
        fetchProduct();
        fetchCategories();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/vendor/products/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                const product = data.product;
                setFormData({
                    title: product.title,
                    description: product.description || '',
                    price: product.price.toString(),
                    categoryId: product.categoryId,
                    imageUrl: product.imageUrl || '',
                    stockQuantity: product.stockQuantity?.toString() || '0',
                });
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/vendor/products/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('✅ Product updated successfully!');
                router.push('/dashboard/vendor/products');
            } else {
                const error = await res.json();
                alert(`❌ ${error.error || 'Failed to update product'}`);
            }
        } catch (error) {
            console.error('Update product error:', error);
            alert('❌ Something went wrong');
        } finally {
            setSaving(false);
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
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Edit Product</h1>
                    <p className="text-foreground/60 mt-1">Update product details</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="bg-surface border-2 border-surface-border rounded-3xl p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                            Product Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-background border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-background border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary h-32 resize-none"
                        />
                    </div>

                    {/* Price & Stock */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                Price (₵) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 bg-background border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                Stock Quantity *
                            </label>
                            <input
                                type="number"
                                value={formData.stockQuantity}
                                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                className="w-full px-4 py-3 bg-background border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                            Category *
                        </label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-4 py-3 bg-background border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                            Image URL
                        </label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-4 py-3 bg-background border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Preview */}
                    {formData.imageUrl && (
                        <div>
                            <label className="block text-sm font-black uppercase tracking-widest text-foreground/60 mb-2">
                                Preview
                            </label>
                            <div className="aspect-square max-w-xs bg-surface-hover rounded-xl overflow-hidden">
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-4 bg-surface-hover text-foreground rounded-xl font-bold text-sm hover:bg-surface-border transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
