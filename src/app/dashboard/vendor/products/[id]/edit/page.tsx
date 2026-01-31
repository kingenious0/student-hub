'use client';

import { useState, useEffect } from 'react';
import ProductForm from '@/components/vendor/products/ProductForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
    const params = useParams();
    const id = params?.id as string;
    
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/vendor/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data.product);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!product) {
        return (
             <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Product not found</h1>
                <Link href="/dashboard/vendor/products" className="text-primary hover:underline">
                    Go back to products
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
             {/* Header */}
            <div className="bg-surface/50 backdrop-blur-xl border-b border-surface-border py-10 px-4 mb-10 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto flex items-start gap-6">
                    <Link href="/dashboard/vendor/products" className="mt-2 p-2 rounded-full hover:bg-foreground/5 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
                            Edit Product
                        </h1>
                        <p className="text-foreground/60 mt-2 font-medium text-lg">Update your listing details.</p>
                    </div>
                </div>
            </div>

            <div className="px-4">
                <ProductForm initialData={product} showTitle={false} />
            </div>

            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>Designed by PraiseTech • github/praisetechzw</p>
            </div>
        </div>
    );
}
