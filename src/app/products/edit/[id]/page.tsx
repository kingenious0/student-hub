'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getHotspotsForUniversity } from '@/lib/geo/distance';
import ImageUpload from '@/components/products/ImageUpload';
import ProtocolGuard from '@/components/admin/ProtocolGuard';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userUniversity, setUserUniversity] = useState<string | null>(null);

    interface FormData {
        title: string;
        description: string;
        price: string;
        categoryId: string;
        hotspot: string;
        imageUrl: string;
    }

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        hotspot: '',
        imageUrl: '',
    });

    const hotspots = Object.values(getHotspotsForUniversity(userUniversity)) as string[];

    useEffect(() => {
        const init = async () => {
            // User
            try {
                const uRes = await fetch('/api/users/me');
                const uData = await uRes.json();
                if (uData.university) setUserUniversity(uData.university);

                // Product
                const pRes = await fetch(`/api/products/${productId}`);
                const pData = await pRes.json();
                if (pData.success && pData.product) {
                    const p = pData.product;
                    setFormData({
                        title: p.title || '',
                        description: p.description || '',
                        price: p.price ? p.price.toString() : '0',
                        categoryId: p.categoryId || '',
                        hotspot: p.hotspot || '',
                        imageUrl: p.imageUrl || '',
                    });
                } else {
                    alert('Product not found');
                    router.push('/dashboard/vendor/products');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [productId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/dashboard/vendor/products');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            alert('Failed to update product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/dashboard/vendor/products');
            } else {
                alert('Failed to delete');
            }
        } catch (e) {
            alert('Error deleting');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-xs text-foreground/40">Loading Editor...</div>;

    return (
        <ProtocolGuard protocol="VENDOR">
            <div className="min-h-screen bg-background pt-32 pb-12 transition-colors duration-300">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-foreground mb-2 uppercase tracking-tighter">
                                ✏️ Edit Product
                            </h1>
                            <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                                Update your listing details
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="text-red-500 font-bold text-xs uppercase hover:underline py-2"
                        >
                            Delete Product
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-surface border border-surface-border rounded-[2.5rem] p-8 space-y-8 shadow-xl">
                        {/* Title */}
                        <div>
                            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-4 bg-background border border-surface-border rounded-xl text-foreground font-bold focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                                Description *
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-4 bg-background border border-surface-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                        </div>

                        {/* Price & Hotspot */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                                    Price (₵) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-4 bg-background border border-surface-border rounded-xl text-foreground font-black text-xl focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                                    Location
                                </label>
                                <select
                                    value={hotspots.includes(formData.hotspot) ? formData.hotspot : 'Other (Custom)'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, hotspot: val === 'Other (Custom)' ? 'Other (Custom)' : val });
                                    }}
                                    className="w-full px-4 py-4 bg-background border border-surface-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    <option value="">Select...</option>
                                    {hotspots.map(h => <option key={h} value={h}>{h}</option>)}
                                    <option value="Other (Custom)">Custom Location</option>
                                </select>
                                {(formData.hotspot === 'Other (Custom)' || (!hotspots.includes(formData.hotspot) && formData.hotspot)) && (
                                    <input
                                        type="text"
                                        value={formData.hotspot === 'Other (Custom)' ? '' : formData.hotspot}
                                        onChange={(e) => setFormData({ ...formData, hotspot: e.target.value })}
                                        className="w-full mt-2 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs font-bold focus:outline-none"
                                        placeholder="Enter specific location..."
                                    />
                                )}
                            </div>
                        </div>

                        {/* Image */}
                        <div>
                            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                                Product Image
                            </label>
                            <div className="bg-background rounded-xl p-4 border border-surface-border">
                                <ImageUpload
                                    value={formData.imageUrl}
                                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-4 bg-foreground/5 border border-surface-border hover:bg-foreground/10 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 omni-glow shadow-lg shadow-primary/20"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtocolGuard>
    );
}
