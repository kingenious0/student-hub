'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/vendor/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Delete this product? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/vendor/products/${productId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Product deleted successfully!');
                fetchProducts();
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-surface border-b border-surface-border py-6 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">My Products</h1>
                        <p className="text-foreground/60 mt-1">Manage your product catalog</p>
                    </div>
                    <Link
                        href="/dashboard/vendor/products/new"
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform"
                    >
                        ➕ Add Product
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border-2 border-surface-border rounded-xl focus:outline-none focus:border-primary"
                    />
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">📦</div>
                        <h2 className="text-2xl font-black mb-2">No Products Yet</h2>
                        <p className="text-foreground/60 mb-6">Start by adding your first product</p>
                        <Link
                            href="/dashboard/vendor/products/new"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform"
                        >
                            Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-surface border-2 border-surface-border rounded-2xl overflow-hidden hover:border-primary transition-colors"
                            >
                                {/* Image */}
                                <div className="aspect-square bg-surface-hover flex items-center justify-center">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-6xl">📦</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-black text-lg line-clamp-2">{product.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${product.isInStock
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {product.isInStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>

                                    <p className="text-sm text-foreground/60 mb-3 line-clamp-2">
                                        {product.description || 'No description'}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-black text-primary">₵{product.price.toFixed(2)}</span>
                                        <span className="text-sm text-foreground/60">
                                            Stock: {product.stockQuantity || 0}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/vendor/products/${product.id}/edit`}
                                            className="flex-1 py-2 bg-blue-500/10 text-blue-500 rounded-lg font-bold text-sm text-center hover:bg-blue-500/20 transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500/20 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
