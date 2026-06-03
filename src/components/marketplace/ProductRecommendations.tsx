'use client';

import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';

export default function ProductRecommendations({ productId, type, title }: {
    productId: string;
    type: 'category' | 'vendor' | 'bought-together';
    title: string;
}) {
    const { data, isLoading } = useQuery({
        queryKey: ['recommendations', productId, type],
        queryFn: async () => {
            const res = await fetch(`/api/recommendations?productId=${productId}&type=${type}&limit=6`);
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.recommendations;
        },
        staleTime: 1000 * 60 * 10,
        enabled: !!productId,
    });

    if (isLoading) {
        return (
            <section className="mt-16">
                <h2 className="text-2xl font-black tracking-tighter mb-8 text-foreground">{title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-foreground/5 animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    if (!data || data.length === 0) return null;

    return (
        <section className="mt-16">
            <h2 className="text-2xl font-black tracking-tighter mb-8 text-foreground">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {data.map((product: Record<string, unknown>) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <ProductCard key={product.id as string} product={product as any} compact />
                ))}
            </div>
        </section>
    );
}
