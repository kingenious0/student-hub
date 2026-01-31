'use client';

import ProductForm from '@/components/vendor/products/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewProductPage() {
    return (
        <div className="min-h-screen bg-background pb-24 transition-colors duration-300">
            {/* Header */}
            <div className="bg-surface/50 backdrop-blur-xl border-b border-surface-border py-10 px-4 mb-10 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto flex items-start gap-6">
                    <Link href="/dashboard/vendor/products" className="mt-2 p-2 rounded-full hover:bg-foreground/5 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
                            Add New Product
                            <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full tracking-widest border border-primary/20">BETA</span>
                        </h1>
                        <p className="text-foreground/60 mt-2 font-medium text-lg">Create a "God Tier" listing with rich media and details.</p>
                    </div>
                </div>
            </div>

            <div className="px-4">
                <ProductForm showTitle={false} />
            </div>

            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>Designed by PraiseTech • github/praisetechzw</p>
            </div>
        </div>
    );
}
