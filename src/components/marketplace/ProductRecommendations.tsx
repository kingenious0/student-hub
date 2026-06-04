'use client';

import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/lib/store/cart';
import EnhancedProductCard from './EnhancedProductCard';

export default function ProductRecommendations({ productId, type, title }: {
  productId: string;
  type: 'category' | 'vendor' | 'bought-together';
  title: string;
}) {
  const addToCart = useCartStore((s) => s.addToCart);
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
        {data.map((product: any) => (
          <EnhancedProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            imageUrl={product.imageUrl}
            category={product.category?.name}
            vendorName={product.vendor?.name || product.vendorName || 'Vendor'}
            stockQuantity={product.stockQuantity}
            averageRating={product.averageRating || undefined}
            totalReviews={product.totalReviews}
            hotspot={product.hotspot || product.vendor?.currentHotspot}
            deliveryTime="15m"
            categoryIcon={product.category?.icon || '📦'}
            showShield={true}
            onAddToCart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({
                id: product.id,
                title: product.title,
                price: product.price,
                imageUrl: product.imageUrl,
                vendor: product.vendor,
              });
            }}
          />
        ))}
      </div>
    </section>
  );
}
