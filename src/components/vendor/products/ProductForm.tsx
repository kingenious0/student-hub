'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Save, Loader2, DollarSign, Package, Layers, Image as ImageIcon } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { DescriptionEditor } from './DescriptionEditor';
import { Button } from '@/components/ui/button';
import { useModal } from '@/context/ModalContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// --- TYPES ---
interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
}

interface ProductFormProps {
    initialData?: any; // Using any for simplicity as Zod handles validation, but ideally strict type
    showTitle?: boolean;
}

// --- SCHEMA ---
const productSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    price: z.coerce.number().min(1, "Price must be at least 1 GHS"),
    categoryId: z.string().min(1, "Please select a category"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    images: z.array(z.any()).min(1, "At least 1 image is required"),
    details: z.record(z.any()).optional(),
    stockQuantity: z.coerce.number().min(0, "Stock cannot be negative").default(1),
    isReadyMade: z.boolean().default(true),
});

// --- IMAGE COMPRESSOR (95% weight reduction for instant uploads) ---
const compressImage = (file: File, maxWidth = 1000, quality = 0.75): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
        };
        reader.onerror = () => resolve(file);
    });
};

export default function ProductForm({ initialData, showTitle = true }: ProductFormProps) {
    const router = useRouter();
    const modal = useModal();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: initialData?.title || '',
            price: initialData?.price || 0,
            categoryId: initialData?.categoryId || '',
            description: initialData?.description || '',
            images: initialData?.images || (initialData?.imageUrl ? [initialData.imageUrl] : []),
            stockQuantity: initialData?.stockQuantity || 1,
            details: initialData?.details || {},
            isReadyMade: initialData?.isReadyMade !== undefined ? initialData.isReadyMade : true,
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

            // 1. Compress & Upload Images
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
                    // Compress image on the fly (95% weight reduction)
                    const compressedFile = await compressImage(file);

                    const formData = new FormData();
                    formData.append('file', compressedFile);
                    formData.append('api_key', signData.apiKey);
                    formData.append('timestamp', signData.timestamp);
                    formData.append('signature', signData.signature);
                    formData.append('folder', signData.folder);

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

            // 2. Create or Update Product
            const payload = {
                ...values,
                images: uploadedUrls,
                imageUrl: uploadedUrls[0] || null,
            };

            const url = initialData 
                ? `/api/vendor/products/${initialData.id}` 
                : '/api/vendor/products';
            
            const method = initialData ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(initialData ? 'Failed to update product' : 'Failed to create product');

            toast.success(initialData ? 'Product specifications updated successfully' : 'New product listed on marketplace');
            router.refresh();
            router.push('/dashboard/vendor/products');

        } catch (error: any) {
            console.error(error);
            modal.alert(error.message || 'The system could not synchronize your product data.', 'Uplink Error', 'error');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-6xl mx-auto pb-24 space-y-8">
            
            {/* Header Actions */}
            {showTitle && (
                <div className="flex flex-col gap-1 pb-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {initialData ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {initialData ? 'Update your product details below.' : 'Fill in the details to list your item on the marketplace.'}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Basic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                            <CardDescription>The main information your customers will see.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Product Title</Label>
                                <Input
                                    id="title"
                                    {...form.register('title')}
                                    placeholder="e.g. Vintage Nike Bomber Jacket"
                                    disabled={loading}
                                />
                                {form.formState.errors.title && (
                                    <p className="text-destructive text-xs font-medium">{form.formState.errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Controller
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <DescriptionEditor value={field.value} onChange={field.onChange} disabled={loading} />
                                    )}
                                />
                                {form.formState.errors.description && (
                                    <p className="text-destructive text-xs font-medium">{form.formState.errors.description.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" /> Media
                            </CardTitle>
                            <CardDescription>Upload high-quality images to showcase your product.</CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                <p className="text-destructive text-sm mt-2">{String(form.formState.errors.images.message)}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dynamic Details */}
                    {selectedCategory && ['food-and-snacks', 'tech-and-gadgets', 'books-and-notes', 'fashion', 'services'].includes(selectedCategory.slug) && (
                        <Card className="animate-in fade-in slide-in-from-bottom-4 bg-surface border-surface-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    {selectedCategory.icon || '✨'} {selectedCategory.name} Specifics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCategory.slug === 'food-and-snacks' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Spicy Level</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                value={(form.watch('details') as any)?.spicyLevel || 'None'}
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
                                            <Label className="text-foreground">Preparation Time</Label>
                                            <Input
                                                placeholder="e.g. 15 mins"
                                                value={(form.watch('details') as any)?.prepTime || ''}
                                                onChange={(e) => {
                                                    const current = form.getValues('details') || {};
                                                    form.setValue('details', { ...current, prepTime: e.target.value });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedCategory.slug === 'tech-and-gadgets' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Condition</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['New', 'Used - Like New', 'Used - Good', 'For Parts'].map(cond => {
                                                    const isSelected = (form.watch('details') as any)?.condition === cond;
                                                    return (
                                                        <button
                                                            key={cond}
                                                            type="button"
                                                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                                                isSelected 
                                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                                                                : 'border-input hover:bg-emerald-600/10 text-foreground/80'
                                                            }`}
                                                            onClick={() => {
                                                                const current = form.getValues('details') || {};
                                                                form.setValue('details', { ...current, condition: cond });
                                                            }}
                                                        >
                                                            {cond}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Brand / Model</Label>
                                            <Input
                                                placeholder="e.g. Apple iPhone 13 Pro"
                                                value={(form.watch('details') as any)?.brand || ''}
                                                onChange={(e) => {
                                                    const current = form.getValues('details') || {};
                                                    form.setValue('details', { ...current, brand: e.target.value });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedCategory.slug === 'books-and-notes' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Book/Notes Condition</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['New', 'Like New', 'Good', 'Fair'].map(cond => {
                                                    const isSelected = (form.watch('details') as any)?.condition === cond;
                                                    return (
                                                        <button
                                                            key={cond}
                                                            type="button"
                                                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                                                isSelected 
                                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                                                                : 'border-input hover:bg-emerald-600/10 text-foreground/80'
                                                            }`}
                                                            onClick={() => {
                                                                const current = form.getValues('details') || {};
                                                                form.setValue('details', { ...current, condition: cond });
                                                            }}
                                                        >
                                                            {cond}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-foreground">Author / Publisher</Label>
                                                <Input
                                                    placeholder="e.g. Robert Kiyosaki"
                                                    value={(form.watch('details') as any)?.author || ''}
                                                    onChange={(e) => {
                                                        const current = form.getValues('details') || {};
                                                        form.setValue('details', { ...current, author: e.target.value });
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground">Course Code / Dept (Optional)</Label>
                                                <Input
                                                    placeholder="e.g. INF 101"
                                                    value={(form.watch('details') as any)?.course || ''}
                                                    onChange={(e) => {
                                                        const current = form.getValues('details') || {};
                                                        form.setValue('details', { ...current, course: e.target.value });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedCategory.slug === 'fashion' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Size</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['S', 'M', 'L', 'XL', 'XXL', 'Unisex'].map(sz => {
                                                    const isSelected = (form.watch('details') as any)?.size === sz;
                                                    return (
                                                        <button
                                                            key={sz}
                                                            type="button"
                                                            className={`w-12 h-10 rounded-xl border text-sm font-black transition-all ${
                                                                isSelected 
                                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                                                                : 'border-input hover:bg-emerald-600/10 text-foreground/80'
                                                            }`}
                                                            onClick={() => {
                                                                const current = form.getValues('details') || {};
                                                                form.setValue('details', { ...current, size: sz });
                                                            }}
                                                        >
                                                            {sz}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-foreground">Color</Label>
                                                <Input
                                                    placeholder="e.g. Black / Crimson Red"
                                                    value={(form.watch('details') as any)?.color || ''}
                                                    onChange={(e) => {
                                                        const current = form.getValues('details') || {};
                                                        form.setValue('details', { ...current, color: e.target.value });
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground">Style / Fit</Label>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    value={(form.watch('details') as any)?.fit || 'Unisex'}
                                                    onChange={(e) => {
                                                        const current = form.getValues('details') || {};
                                                        form.setValue('details', { ...current, fit: e.target.value });
                                                    }}
                                                >
                                                    <option value="Unisex">Unisex 👕</option>
                                                    <option value="Men">Men 🤵</option>
                                                    <option value="Women">Women 👩</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedCategory.slug === 'services' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Pricing Basis</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                value={(form.watch('details') as any)?.duration || 'One-Time Flat'}
                                                onChange={(e) => {
                                                    const current = form.getValues('details') || {};
                                                    form.setValue('details', { ...current, duration: e.target.value });
                                                }}
                                            >
                                                <option value="One-Time Flat">One-Time Flat Fee</option>
                                                <option value="Per Hour">Per Hour rate</option>
                                                <option value="Per Session">Per Session</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-foreground">Availability</Label>
                                            <Input
                                                placeholder="e.g. Weekends, 2pm - 8pm"
                                                value={(form.watch('details') as any)?.timing || ''}
                                                onChange={(e) => {
                                                    const current = form.getValues('details') || {};
                                                    form.setValue('details', { ...current, timing: e.target.value });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT COLUMN: Settings */}
                <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                    
                    {/* Organization */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="w-5 h-5" /> Organization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Price */}
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (GHS)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        {...form.register('price')}
                                        className="pl-9 font-semibold text-lg"
                                        placeholder="0.00"
                                    />
                                </div>
                                {form.formState.errors.price && (
                                    <p className="text-destructive text-xs font-medium">{form.formState.errors.price.message}</p>
                                )}
                            </div>

                            <Separator />

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    {...form.register('categoryId')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {form.formState.errors.categoryId && (
                                    <p className="text-destructive text-xs font-medium">{form.formState.errors.categoryId.message}</p>
                                )}
                            </div>

                            {/* Stock */}
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="stock"
                                        type="number"
                                        {...form.register('stockQuantity')}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Ready-Made Toggle */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold flex items-center gap-2">Fulfillment Mode</Label>
                                <div className="flex items-center justify-between p-4 bg-background border border-surface-border rounded-2xl hover:border-primary/20 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-wider text-foreground">Instantly Ready</p>
                                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight leading-relaxed">Ready-made items (canned drinks, snacks, books, gadgets) skip preparation upon payment.</p>
                                    </div>
                                    <Controller
                                        control={form.control}
                                        name="isReadyMade"
                                        render={({ field }) => (
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(!field.value)}
                                                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none border border-surface-border/50 ${
                                                    field.value ? 'bg-primary' : 'bg-foreground/10'
                                                }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-md transition-transform duration-200 ${
                                                        field.value ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`}
                                                />
                                            </button>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        disabled={loading || uploading}
                        size="lg"
                        className="w-full font-semibold shadow-md"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading Media...
                            </>
                        ) : loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Publish Product
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* OMNI Signature */}
            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>© 2026 OMNI Student Marketplace • All Rights Reserved</p>
            </div>
        </form>
    );
}
