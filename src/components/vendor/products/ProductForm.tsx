'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Save, Loader2, DollarSign } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { DescriptionEditor } from './DescriptionEditor';
import { Button } from '@/components/ui/button'; // Assuming existence
import { Card } from '@/components/ui/card'; // Assuming existence

// --- TYPES ---
interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
}

// --- SCHEMA ---
// We can make this dynamic later
const productSchema = z.object({
    title: z.string().min(3, "Title too short"),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    categoryId: z.string().min(1, "Category required"),
    description: z.string().min(10, "Description too short"),
    images: z.array(z.any()).min(1, "At least 1 image required"),
    details: z.record(z.any()).optional(), // For dynamic fields
    // Inventory
    stockQuantity: z.coerce.number().min(0),
});

export default function ProductForm() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: '',
            price: 0,
            categoryId: '',
            description: '',
            images: [],
            stockQuantity: 1,
            details: {}
        }
    });

    const categoryId = form.watch('categoryId');
    const selectedCategory = categories.find(c => c.id === categoryId);

    // FETCH CATEGORIES
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data.success) setCategories(data.categories);
            });
    }, []);

    // SUBMIT HANDLER
    const onSubmit = async (values: z.infer<typeof productSchema>) => {
        try {
            setLoading(true);
            setUploading(true);

            // 1. Upload Images
            const uploadedUrls: string[] = [];
            const filesToUpload = values.images.filter((f): f is File => f instanceof File);
            const existingUrls = values.images.filter((f): f is string => typeof f === 'string');

            uploadedUrls.push(...existingUrls);

            if (filesToUpload.length > 0) {
                // Get Signature
                const signRes = await fetch('/api/cloudinary-sign', {
                    method: 'POST',
                    body: JSON.stringify({ folder: 'omni-products' })
                });
                const signData = await signRes.json();

                if (!signData.signature) throw new Error('Failed to sign upload');

                // Upload each file
                for (const file of filesToUpload) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('api_key', signData.apiKey);
                    formData.append('timestamp', signData.timestamp);
                    formData.append('signature', signData.signature);
                    formData.append('folder', signData.folder); // Use the exact folder signed by server

                    const uploadRes = await fetch(
                        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
                        { method: 'POST', body: formData }
                    );
                    const uploadData = await uploadRes.json();
                    if (uploadData.secure_url) {
                        uploadedUrls.push(uploadData.secure_url);
                    }
                }
            }

            setUploading(false);

            // 2. Create Product
            const payload = {
                ...values,
                images: uploadedUrls,
                imageUrl: uploadedUrls[0] || null, // Compatibility
            };

            const res = await fetch('/api/vendor/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to create product');

            router.refresh();
            router.push('/dashboard/vendor/products');

        } catch (error) {
            console.error(error);
            alert('Something went wrong. Check console.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-24">

            {/* 1. IMAGES */}
            <div className="space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tight">Product Gallery</h3>
                <Controller
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <ImageUploader
                            value={field.value}
                            onChange={field.onChange}
                            disabled={loading}
                        />
                    )}
                />
                {form.formState.errors.images && (
                    <p className="text-red-500 text-sm">{String(form.formState.errors.images.message)}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* LEFT: Main Info */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Details */}
                    <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Product Title</label>
                            <input
                                {...form.register('title')}
                                className="w-full bg-background border border-surface-border rounded-xl p-4 font-bold text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="e.g. Vintage Nike Bomber Jacket"
                                disabled={loading}
                            />
                            {form.formState.errors.title && <p className="text-red-500 text-xs">{form.formState.errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Description</label>
                            <Controller
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <DescriptionEditor value={field.value} onChange={field.onChange} disabled={loading} />
                                )}
                            />
                            {form.formState.errors.description && <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>}
                        </div>
                    </div>

                    {/* Dynamic Details (Based on Category) */}
                    {selectedCategory && (
                        <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h4 className="font-black uppercase tracking-tight flex items-center gap-2">
                                <span>{selectedCategory.icon || '✨'}</span>
                                {selectedCategory.name} Specifics
                            </h4>

                            {/* Example: Food Specifics */}
                            {(selectedCategory.slug.includes('food')) && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Spicy Level</label>
                                        <select
                                            className="w-full bg-background border border-surface-border rounded-xl p-3 text-sm"
                                            onChange={(e) => {
                                                const current = form.getValues('details') || {};
                                                form.setValue('details', { ...current, spicyLevel: e.target.value });
                                            }}
                                        >
                                            <option value="None">None 😌</option>
                                            <option value="Mild">Mild 🌶️</option>
                                            <option value="Hot">Hot 🔥</option>
                                            <option value="Extra">Extra 🌋</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Preparation Time</label>
                                        <input
                                            placeholder="e.g. 15 mins"
                                            className="w-full bg-background border border-surface-border rounded-xl p-3 text-sm"
                                            onChange={(e) => {
                                                const current = form.getValues('details') || {};
                                                form.setValue('details', { ...current, prepTime: e.target.value });
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {/* Example: Tech Specifics */}
                            {(selectedCategory.slug.includes('tech')) && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Condition</label>
                                        <div className="flex gap-2">
                                            {['New', 'Used - Like New', 'Used - Good', 'For Parts'].map(cond => (
                                                <button
                                                    key={cond}
                                                    type="button"
                                                    className="px-3 py-2 rounded-lg border border-surface-border text-xs font-bold hover:bg-primary/5 focus:bg-primary/10 transition-colors"
                                                    onClick={() => {
                                                        const current = form.getValues('details') || {};
                                                        form.setValue('details', { ...current, condition: cond });
                                                    }}
                                                >
                                                    {cond}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: Settings */}
                <div className="space-y-8">
                    <div className="bg-surface border border-surface-border rounded-2xl p-6 space-y-6 sticky top-8">
                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Price (GHS)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                <input
                                    type="number"
                                    step="0.01"
                                    {...form.register('price')}
                                    className="w-full bg-background border border-surface-border rounded-xl p-4 pl-10 font-black text-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            {form.formState.errors.price && <p className="text-red-500 text-xs">{form.formState.errors.price.message}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Category</label>
                            <select
                                {...form.register('categoryId')}
                                className="w-full bg-background border border-surface-border rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Category...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {form.formState.errors.categoryId && <p className="text-red-500 text-xs">{form.formState.errors.categoryId.message}</p>}
                        </div>

                        <div className="h-px bg-surface-border" />

                        {/* Stock */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground/60">Inventory Stock</label>
                            <input
                                type="number"
                                {...form.register('stockQuantity')}
                                className="w-full bg-background border border-surface-border rounded-xl p-3 font-mono text-sm"
                            />
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={loading || uploading}
                            className="w-full py-6 text-base font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground shadow-xl omni-glow lg:text-lg"
                        >
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading Media...
                                </span>
                            ) : loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 justify-center">
                                    <Save className="w-5 h-5" /> Publish Product
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
