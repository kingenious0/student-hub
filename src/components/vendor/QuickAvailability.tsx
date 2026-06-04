'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Package, Search } from 'lucide-react';

interface ProductItem {
  id: string;
  title: string;
  price: number;
  isInStock: boolean;
  stockQuantity: number;
  salesCount: number;
}

export default function QuickAvailability() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/vendor/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch { /* noop */ } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleToggle = async (productId: string, currentStatus: boolean) => {
    setToggling(productId);
    try {
      const token = await getToken();
      const res = await fetch('/api/vendor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, isInStock: !currentStatus }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p =>
          p.id === productId ? { ...p, isInStock: !currentStatus } : p
        ));
        toast.success(!currentStatus ? 'Item is now available' : 'Item marked as sold out');
      }
    } catch { toast.error('Failed to toggle'); } finally {
      setToggling(null);
    }
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const outOfStock = products.filter(p => !p.isInStock).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-4 h-4" /> Quick Availability
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {products.length - outOfStock} available · {outOfStock} sold out
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9 w-48 h-8 text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No products found.</p>
        ) : (
          <div className="space-y-1">
            {filtered.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Switch
                    checked={product.isInStock}
                    disabled={toggling === product.id}
                    onCheckedChange={() => handleToggle(product.id, product.isInStock)}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      ₵{product.price.toFixed(2)} · Stock: {product.stockQuantity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    product.isInStock
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {product.isInStock ? 'Available' : 'Sold Out'}
                  </span>
                  {product.salesCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">{product.salesCount} sold</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
