
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getHotspotsForUniversity, UNIVERSITY_REGISTRY } from '@/lib/geo/distance';
import ImageUpload from '@/components/products/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
}

import ProtocolGuard from '@/components/admin/ProtocolGuard';

export default function NewProductPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [userUniversity, setUserUniversity] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        hotspot: '',
        imageUrl: '',
        details: {} as Record<string, any>,
    });

    const hotspots = Object.values(getHotspotsForUniversity(userUniversity)) as string[];

    useEffect(() => {
        // Fetch Categories
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCategories(data.categories);
                }
            });

        // Fetch User Profile for Default Location and University
        fetch('/api/users/me')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    if (data.university) setUserUniversity(data.university);

                    if (data.shopLandmark) {
                        setFormData(prev => ({
                            ...prev,
                            hotspot: prev.hotspot || data.shopLandmark
                        }));
                    }
                }
            });
    }, []);

    const selectedCategory = categories.find(c => c.id === formData.categoryId);

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
                // alert('Product created successfully! 🎉'); // Replaced with toast-like UX later if needed
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

    const updateDetail = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            details: {
                ...prev.details,
                [key]: value
            }
        }));
    };

    return (
        <ProtocolGuard protocol="VENDOR">
            <div className="min-h-screen bg-background pt-48 pb-12 transition-colors duration-300">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-foreground mb-2 uppercase tracking-tighter">
                            ➕ Add New Product
                        </h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                            List your item on the campus marketplace
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-surface border border-surface-border rounded-[2.5rem] p-8 space-y-8 shadow-xl">

                        {/* Basic Info Section */}
                        <div className="space-y-6">
                            {/* Category Selection - First because it drives the form */}
                            <div>
                                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">
                                    Select Category *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, categoryId: cat.id, details: {} })}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.categoryId === cat.id
                                                ? 'bg-primary/20 border-primary shadow-lg scale-[1.02]'
                                                : 'bg-background border-surface-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="text-2xl">{cat.icon || '📦'}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-center">{cat.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

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
                                    placeholder="e.g., Spicy Indomie & Egg"
                                    className="w-full px-4 py-4 bg-background border border-surface-border rounded-xl text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
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
                                    placeholder="Describe what makes this item great..."
                                    rows={3}
                                    className="w-full px-4 py-4 bg-background border border-surface-border rounded-xl text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Price */}
                                <div>
                                    <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                                        Price (₵) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-4 bg-background border border-surface-border rounded-xl text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-black text-xl"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                                        Pickup Location
                                    </label>
                                    <select
                                        value={hotspots.includes(formData.hotspot) ? formData.hotspot : 'Other (Custom)'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'Other (Custom)') {
                                                // Keep 'Other (Custom)' temporarily to show input
                                                setFormData({ ...formData, hotspot: 'Other (Custom)' });
                                            } else {
                                                setFormData({ ...formData, hotspot: val });
                                            }
                                        }}
                                        className="w-full px-4 py-4 bg-background border border-surface-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold uppercase text-xs"
                                    >
                                        <option value="">Select Hotspot...</option>
                                        {hotspots.map((hotspot) => (
                                            <option key={hotspot} value={hotspot}>📍 {hotspot}</option>
                                        ))}
                                        {!hotspots.includes('Other (Custom)') &&
                                            <option value="Other (Custom)">✏️ Other (Type Custom)</option>
                                        }
                                    </select>

                                    {/* Custom Location Input for Global Support */}
                                    {(formData.hotspot === 'Other (Custom)' || !hotspots.includes(formData.hotspot) && formData.hotspot !== '') && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2"
                                        >
                                            <input
                                                type="text"
                                                placeholder="Enter specific location (e.g. Pentagon Block B)..."
                                                value={formData.hotspot === 'Other (Custom)' ? '' : formData.hotspot}
                                                onChange={(e) => setFormData({ ...formData, hotspot: e.target.value })}
                                                className="w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold text-sm"
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* DYNAMIC CATEGORY FIELDS */}
                        <AnimatePresence mode="wait">
                            {selectedCategory && (
                                <motion.div
                                    key={selectedCategory.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-primary/5 rounded-2xl p-6 border border-primary/10 overflow-hidden"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xl">{selectedCategory.icon}</span>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                                            {selectedCategory.name} Specifics
                                        </h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Food Fields */}
                                        {selectedCategory.slug === 'food-and-snacks' && (
                                            <>
                                                <div>
                                                    <label className="text-[9px] uppercase font-bold text-foreground/60 mb-1 block">Preparation Time</label>
                                                    <select
                                                        className="w-full p-3 bg-background rounded-lg border border-surface-border text-sm"
                                                        onChange={(e) => updateDetail('prepTime', e.target.value)}
                                                    >
                                                        <option value="Instant">Instant</option>
                                                        <option value="5-10 mins">5-10 mins</option>
                                                        <option value="15-20 mins">15-20 mins</option>
                                                        <option value="30+ mins">30+ mins</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] uppercase font-bold text-foreground/60 mb-1 block">Spicy Level</label>
                                                    <div className="flex bg-background rounded-lg border border-surface-border p-1">
                                                        {['Mild', 'Medium', 'Hot', 'Fire'].map((level) => (
                                                            <button
                                                                key={level}
                                                                type="button"
                                                                onClick={() => updateDetail('spicyLevel', level)}
                                                                className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase transition-colors ${formData.details.spicyLevel === level ? 'bg-red-500 text-white' : 'hover:bg-foreground/5'}`}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Tech Fields */}
                                        {selectedCategory.slug === 'tech-and-gadgets' && (
                                            <>
                                                <div>
                                                    <label className="text-[9px] uppercase font-bold text-foreground/60 mb-1 block">Condition</label>
                                                    <select
                                                        className="w-full p-3 bg-background rounded-lg border border-surface-border text-sm"
                                                        onChange={(e) => updateDetail('condition', e.target.value)}
                                                    >
                                                        <option value="New">New (Sealed)</option>
                                                        <option value="Like New">Like New (Open Box)</option>
                                                        <option value="Used">Used (Good)</option>
                                                        <option value="Refurbished">Refurbished</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] uppercase font-bold text-foreground/60 mb-1 block">Model / Brand</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. iPhone 13 Pro"
                                                        className="w-full p-3 bg-background rounded-lg border border-surface-border text-sm"
                                                        onChange={(e) => updateDetail('model', e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Books Fields */}
                                        {selectedCategory.slug === 'books-and-notes' && (
                                            <>
                                                <div>
                                                    <label className="text-[9px] uppercase font-bold text-foreground/60 mb-1 block">Course Code</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. MATH 123"
                                                        className="w-full p-3 bg-background rounded-lg border border-surface-border text-sm uppercase"
                                                        onChange={(e) => updateDetail('courseCode', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] uppercase font-bold text-foreground/60 mb-1 block">Author / Edition</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. James Stewart, 8th Ed"
                                                        className="w-full p-3 bg-background rounded-lg border border-surface-border text-sm"
                                                        onChange={(e) => updateDetail('author', e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Fashion Fields */}
                                        {selectedCategory.slug === 'fashion' && (
                                            <>
                                                <div>
                                                    <label className="text-[9px] uppercase font-bold text-foreground/60 mb-1 block">Size</label>
                                                    <div className="flex gap-2">
                                                        {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                                            <button
                                                                key={size}
                                                                type="button"
                                                                onClick={() => updateDetail('size', size)}
                                                                className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-xs transition-all ${formData.details.size === size ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-surface-border'}`}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] uppercase font-bold text-foreground/60 mb-1 block">Gender</label>
                                                    <select
                                                        className="w-full p-3 bg-background rounded-lg border border-surface-border text-sm"
                                                        onChange={(e) => updateDetail('gender', e.target.value)}
                                                    >
                                                        <option value="Unisex">Unisex</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Product Image */}
                        <div>
                            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
                                Product Image
                            </label>
                            <ImageUpload
                                value={formData.imageUrl}
                                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                            />
                        </div>

                        {/* Submit */}
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
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 omni-glow active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Validating...' : '🚀 Launch Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtocolGuard>
    );
}
