// src/app/products/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CAMPUS_HOTSPOTS } from '@/lib/geo/distance';
import ImageUpload from '@/components/products/ImageUpload';

const categories = ['FOOD', 'BOOK', 'LESSON', 'SERVICE'];

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'FOOD',
        hotspot: '',
        imageUrl: '',
    });

    const hotspots = Object.values(CAMPUS_HOTSPOTS);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                alert('Product created successfully! 🎉');
                router.push('/dashboard/vendor');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to create product:', error);
            alert('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        ➕ Add New Product
                    </h1>
                    <p className="text-purple-200">
                        List your product on the marketplace
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                            Product Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Indomie Noodles"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                            Description *
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your product..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                            Price (GH₵) *
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="5.00"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                            Category *
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Hotspot */}
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                            Location (Hotspot)
                        </label>
                        <select
                            value={formData.hotspot}
                            onChange={(e) => setFormData({ ...formData, hotspot: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select location...</option>
                            {hotspots.map((hotspot) => (
                                <option key={hotspot} value={hotspot}>
                                    📍 {hotspot}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Product Image */}
                    <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                            Product Image
                        </label>
                        <ImageUpload
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3 bg-white/5 border border-white/20 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
