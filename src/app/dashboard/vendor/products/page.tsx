'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit, 
    Trash, 
    Package,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
                    <p className="text-muted-foreground text-sm">Manage your product catalog and inventory.</p>
                </div>
                <Link href="/dashboard/vendor/products/new">
                    <Button className="font-bold">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                        <Package className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No products found</h2>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        {searchTerm 
                            ? "Try adjusting your search terms." 
                            : "Get started by adding your first product to the marketplace."}
                    </p>
                    {!searchTerm && (
                        <Link href="/dashboard/vendor/products/new">
                            <Button variant="outline">Create Listing</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                            {/* Image Aspect Ratio */}
                            <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <Package className="h-12 w-12 text-muted-foreground/50" />
                                )}
                                
                                {/* Stock Badge Overlay */}
                                <div className="absolute top-2 right-2">
                                    <Badge 
                                        variant={product.stockQuantity > 0 ? "secondary" : "destructive"}
                                        className={product.stockQuantity > 0 ? "bg-background/80 backdrop-blur-sm text-foreground" : ""}
                                    >
                                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of Stock"}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="p-4">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h3 className="font-semibold truncate" title={product.title}>{product.title}</h3>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1 text-muted-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/vendor/products/${product.id}/edit`)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
                                    {product.description || 'No description provided.'}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="font-bold text-lg">₵{product.price.toFixed(2)}</span>
                                    {product.category && (
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                            {product.category.name}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            <div className="text-center text-xs text-muted-foreground pt-8 pb-4 opacity-50">
                <p>Designed by PraiseTech • github/praisetechzw</p>
            </div>
        </div>
    );
}
