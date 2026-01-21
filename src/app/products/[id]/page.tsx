'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from '@clerk/nextjs';
import { useCartStore } from '@/lib/store/cart';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css'; // Ensure CSS is imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZapIcon, MapPinIcon, CheckCircleIcon, ClockIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Custom Star Icon
const StarIcon = ({ className, fill }: { className?: string, fill?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const addToCart = useCartStore((state) => state.addToCart);
    const [quantity, setQuantity] = useState(1);
    const [isGhostAdmin, setIsGhostAdmin] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        setIsGhostAdmin(localStorage.getItem('OMNI_GOD_MODE_UNLOCKED') === 'true');
    }, []);

    // TanStack Query for caching and instant load
    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', params.id],
        queryFn: async () => {
            const res = await fetch(`/api/products/${params.id}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.product;
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
    });

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-foreground/60 font-medium animate-pulse">Loading Product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Product Not Found</h1>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // Prepare Layout Data
    const isOnSale = !!product.flashSale?.isActive;
    const currentPrice = isOnSale ? product.flashSale.salePrice : product.price;
    const originalPrice = isOnSale ? product.flashSale.originalPrice : null;
    const discount = isOnSale ? product.flashSale.discountPercent : 0;
    const isOutOfStock = product.isInStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
    const rating = product.averageRating || 0;
    const reviewCount = product.totalReviews || 0;

    // Image Gallery Setup
    // If 'images' array exists, map it. fallback to single imageUrl.
    const galleryImages = product.images && product.images.length > 0
        ? product.images.map((url: string) => ({ original: url, thumbnail: url }))
        : [{ original: product.imageUrl, thumbnail: product.imageUrl }];

    // If main image isn't in array (legacy), add it to front
    if (product.imageUrl && !product.images?.includes(product.imageUrl) && product.images?.length > 0) {
        galleryImages.unshift({ original: product.imageUrl, thumbnail: product.imageUrl });
    }

    const handleAddToCart = () => {
        if (!user) {
            openSignIn();
            return;
        }

        addToCart({
            id: product.id,
            title: product.title,
            price: currentPrice,
            imageUrl: product.imageUrl || '',
            vendorName: product.vendor.shopName || product.vendor.name,
            flashSaleId: product.flashSale?.isActive ? 'active' : undefined
        }, quantity);

        toast.success(`${product.title} added to cart`, {
            description: "Keep shopping or proceed to checkout.",
            action: {
                label: "View Cart",
                onClick: () => router.push('/cart')
            }
        });
    };

    return (
        <div className="min-h-screen bg-background pb-32 md:pb-12">
            {/* Navbar Placeholder / Back Button */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <span className="text-xl">←</span>
                    </Button>
                    <span className="font-bold text-sm md:text-lg truncate opacity-80">{product.title}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">

                    {/* LEFT COLUMN: Image Gallery */}
                    <div className="w-full">
                        <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-card [&_.image-gallery-content_.image-gallery-slide_.image-gallery-image]:object-contain [&_.image-gallery-content_.image-gallery-slide_.image-gallery-image]:h-[400px] md:[&_.image-gallery-content_.image-gallery-slide_.image-gallery-image]:h-[500px] [&_.image-gallery-thumbnail.active]:border-primary">
                            <ImageGallery
                                items={galleryImages}
                                showPlayButton={false}
                                showFullscreenButton={true}
                                showNav={true}
                                autoPlay={false}
                                infinite={true}
                                showThumbnails={galleryImages.length > 1}
                                isRTL={false}
                                thumbnailPosition="bottom"
                            />
                        </div>
                        {isOutOfStock && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600">
                                <ClockIcon className="w-6 h-6" />
                                <span className="font-bold uppercase tracking-wide">Currently Out of Stock</span>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Product Details (Buy Box) */}
                    <div className="flex flex-col gap-6">

                        {/* Header Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Link href={`/category/${product.categoryId}`} className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">
                                    {product.category?.name || 'Item'}
                                </Link>
                                {product.hotspot && (
                                    <Badge variant="outline" className="text-[10px] h-5 gap-1 border-primary/20 bg-primary/5 text-primary">
                                        <MapPinIcon className="w-3 h-3" />
                                        {product.hotspot}
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-foreground leading-tight mb-2">
                                {product.title}
                            </h1>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center text-yellow-400 gap-0.5">
                                    <StarIcon className="w-4 h-4" fill={rating >= 1} />
                                    <StarIcon className="w-4 h-4" fill={rating >= 2} />
                                    <StarIcon className="w-4 h-4" fill={rating >= 3} />
                                    <StarIcon className="w-4 h-4" fill={rating >= 4} />
                                    <StarIcon className="w-4 h-4" fill={rating >= 5} />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium underline decoration-dotted">
                                    {reviewCount} ratings
                                </span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-sm font-medium text-red-500">-{discount}%</span>
                                <span className="text-4xl font-black text-foreground">₵{currentPrice.toFixed(2)}</span>
                            </div>
                            {isOnSale && (
                                <p className="text-sm text-muted-foreground">
                                    List Price: <span className="line-through">₵{originalPrice?.toFixed(2)}</span>
                                </p>
                            )}

                            {/* Stock Status */}
                            <div className="mt-4 mb-6">
                                {isOutOfStock ? (
                                    <p className="text-red-500 font-bold text-lg">Currently Unavailable</p>
                                ) : (
                                    <p className="text-green-600 font-bold text-lg">In Stock</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-muted/50 p-2 rounded-xl border border-border">
                                    <span className="pl-4 font-bold text-sm uppercase">Qty:</span>
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1 || isOutOfStock}>-</Button>
                                        <span className="font-bold w-4 text-center">{quantity}</span>
                                        <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} disabled={isOutOfStock}>+</Button>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full text-lg h-14 font-black uppercase tracking-widest bg-yellow-400 hover:bg-yellow-500 text-black shadow-none border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock || isGhostAdmin}
                                >
                                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="w-full h-12 font-bold uppercase tracking-wider"
                                    onClick={handleAddToCart} // Technically standard buy now is immediate checkout, but cart strict for now
                                    disabled={isOutOfStock || isGhostAdmin}
                                >
                                    Buy Now
                                </Button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><ZapIcon className="w-3 h-3" /> Secure Transaction</span>
                                <span>Sold by <strong className="text-foreground">{product.vendor.shopName || product.vendor.name}</strong></span>
                            </div>
                        </div>

                        {/* Tabs: Details, Specs, Reviews */}
                        <div className="mt-8">
                            <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="specs">Specs</TabsTrigger>
                                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                                </TabsList>
                                <TabsContent value="details" className="mt-6">
                                    <div
                                        className="prose prose-invert max-w-none text-foreground/80 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
                                    />
                                </TabsContent>
                                <TabsContent value="specs" className="mt-6">
                                    <div className="border border-border rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {/* Fallback Specs if 'details' JSON is missing */}
                                                <tr className="border-b border-border bg-muted/50">
                                                    <td className="p-3 font-bold text-muted-foreground w-1/3">Condition</td>
                                                    <td className="p-3 font-medium">New</td>
                                                </tr>
                                                <tr className="border-b border-border">
                                                    <td className="p-3 font-bold text-muted-foreground w-1/3">Category</td>
                                                    <td className="p-3 font-medium">{product.category?.name}</td>
                                                </tr>
                                                {/* Dynamic Specs (Example mapping) */}
                                                {product.details && Object.entries(product.details).map(([key, value]) => (
                                                    <tr key={key} className="border-b border-border last:border-0 odd:bg-muted/30">
                                                        <td className="p-3 font-bold text-muted-foreground w-1/3 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                                                        <td className="p-3 font-medium">{String(value)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>
                                <TabsContent value="reviews" className="mt-6">
                                    {reviewCount > 0 ? (
                                        <div className="space-y-4">
                                            {/* Here you would map real reviews. Placeholder for data structure */}
                                            <div className="p-4 border border-border rounded-xl bg-card">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-sm">Verified Student</span>
                                                    <div className="flex text-yellow-400 text-xs">★★★★★</div>
                                                </div>
                                                <p className="text-sm text-foreground/80">Great product, exactly as described! Delivery was super fast to the JCR.</p>
                                                <span className="text-xs text-muted-foreground mt-2 block">2 days ago</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                                            <p className="font-medium text-muted-foreground mb-4">No reviews yet</p>
                                            <Button variant="outline" size="sm">Write a Review</Button>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
