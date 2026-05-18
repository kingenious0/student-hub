'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/nextjs';
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
    const cartItems = useCartStore((state) => state.items);
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
            router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`);
            return;
        }

        addToCart({
            id: product.id,
            title: product.title,
            price: currentPrice,
            imageUrl: product.imageUrl || '',
            vendorId: product.vendorId,
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
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] transition-colors duration-500 pb-32">
            {/* Minimalist Sticky Header */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5"
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                        >
                            <span className="text-xl">←</span>
                        </Button>
                        <div className="h-6 w-px bg-black/10 dark:bg-white/10 hidden md:block"></div>
                        <span className="font-bold text-sm md:text-base tracking-tight opacity-0 md:opacity-100 transition-opacity">
                            {product.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/cart')}
                            className="relative"
                        >
                            <span className="mr-2">Cart</span>
                            <span className="bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {cartItems.length}
                            </span>
                        </Button>
                    </div>
                </div>
            </motion.div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 lg:gap-24 relative">

                    {/* LEFT COLUMN: Immersive Gallery */}
                    <div className="relative">
                        <div className="sticky top-32 space-y-8">
                            <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl shadow-black/5 dark:shadow-white/5 border border-black/5 dark:border-white/5 group">
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
                                    additionalClass="premium-gallery"
                                />
                                {isOutOfStock && (
                                    <div className="absolute top-6 right-6 z-20">
                                        <span className="px-4 py-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-500/20 backdrop-blur-md">
                                            Sold Out
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Premium Buy Box */}
                    <div className="flex flex-col pt-4">

                        {/* Breadcrumbs & Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <Link href={`/category/${product.categoryId}`} className="px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                                {product.category?.name || 'Collection'}
                            </Link>
                            {product.hotspot && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                    <MapPinIcon className="w-3 h-3" />
                                    {product.hotspot}
                                </div>
                            )}
                            {isOnSale && (
                                <div className="px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    Flash Sale
                                </div>
                            )}
                        </div>

                        {/* Product Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white tracking-tighter leading-[0.9] mb-6">
                            {product.title}
                        </h1>

                        {/* Ratings & Vendor */}
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="flex text-primary">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className="w-4 h-4" fill={i < Math.round(rating)} />
                                    ))}
                                </div>
                                <span className="text-sm font-bold opacity-60">({reviewCount} verified reviews)</span>
                            </div>
                            <div className="h-4 w-px bg-black/10 dark:bg-white/10"></div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="opacity-60">Sold by</span>
                                <Link
                                    href={`/vendor/${product.vendor.id}`}
                                    className="font-bold border-b border-primary hover:text-primary transition-colors"
                                >
                                    {product.vendor.shopName || product.vendor.name}
                                </Link>
                            </div>
                        </div>

                        {/* Price Block */}
                        <div className="mb-8">
                            <div className="flex items-baseline gap-4">
                                <span className="text-6xl font-black tracking-tighter text-black dark:text-white">
                                    ₵{currentPrice.toFixed(2)}
                                </span>
                                {isOnSale && originalPrice && (
                                    <span className="text-xl font-medium text-black/40 dark:text-white/40 line-through decoration-2 decoration-red-500/50">
                                        ₵{originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {isOnSale && (
                                <p className="mt-2 text-red-500 text-sm font-bold uppercase tracking-wide">
                                    You save <span className="underline decoration-wavy">₵{(originalPrice! - currentPrice).toFixed(2)}</span> ({discount}% off)
                                </p>
                            )}
                        </div>

                        {/* Action Module */}
                        <div className="p-1 rounded-[2rem] bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-black border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-white/5 mb-10">
                            <div className="p-6 md:p-8">
                                {/* Stock Status Text */}
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        {isOutOfStock ? (
                                            <p className="text-red-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                Unavailable
                                            </p>
                                        ) : (
                                            <p className="text-green-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                Ready for Dispatch
                                            </p>
                                        )}
                                    </div>
                                    {!isOutOfStock && product.stockQuantity && product.stockQuantity < 10 && (
                                        <span className="text-xs font-bold text-orange-500">
                                            Only {product.stockQuantity} left
                                        </span>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        {/* Quantity Pill */}
                                        <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/5 h-16 w-40">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={quantity <= 1 || isOutOfStock}
                                                className="w-12 h-full flex items-center justify-center text-xl font-medium hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all disabled:opacity-30"
                                            >
                                                −
                                            </button>
                                            <span className="flex-1 text-center font-black text-xl tabular-nums">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                disabled={isOutOfStock}
                                                className="w-12 h-full flex items-center justify-center text-xl font-medium hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all disabled:opacity-30"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Add To Cart */}
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={isOutOfStock || isGhostAdmin}
                                            className="flex-1 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-sm md:text-base uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 dark:shadow-white/20 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-current"></div>
                                            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                                        </button>
                                    </div>

                                    {/* Quick Buy Button */}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock || isGhostAdmin}
                                        className="w-full h-14 rounded-full border-2 border-black/10 dark:border-white/10 font-bold uppercase tracking-widest text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Instant Checkout
                                    </button>
                                </div>

                                {/* Trust Indicators */}
                                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-dashed border-black/10 dark:border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <ZapIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Guarantee</span>
                                            <span className="text-xs font-bold">Omni Secure™</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Verified</span>
                                            <span className="text-xs font-bold">Campus Partner</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Tabs */}
                        <div className="mt-8">
                            <Tabs defaultValue="details" className="w-full">
                                <TabsList className="w-full bg-transparent border-b border-black/5 dark:border-white/5 p-0 h-auto gap-8 justify-start rounded-none">
                                    {['details', 'specs', 'reviews'].map(tab => (
                                        <TabsTrigger
                                            key={tab}
                                            value={tab}
                                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-4 font-black text-xs uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors shadow-none"
                                        >
                                            {tab}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                <AnimatePresence mode="wait">
                                    <TabsContent key="details" value="details" className="mt-8 focus:outline-none">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="prose prose-lg prose-neutral dark:prose-invert max-w-none leading-relaxed font-light"
                                            dangerouslySetInnerHTML={{ __html: product.description || '<p class="opacity-50 italic">No description available.</p>' }}
                                        />
                                    </TabsContent>

                                    <TabsContent key="specs" value="specs" className="mt-8 focus:outline-none">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 flex justify-between items-center">
                                                <span className="font-bold text-xs uppercase tracking-widest opacity-50">Condition</span>
                                                <span className="font-medium">New</span>
                                            </div>
                                            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 flex justify-between items-center">
                                                <span className="font-bold text-xs uppercase tracking-widest opacity-50">Category</span>
                                                <span className="font-medium">{product.category?.name}</span>
                                            </div>
                                            {product.details && Object.entries(product.details).map(([key, value]) => (
                                                <div key={key} className="p-4 rounded-xl bg-black/5 dark:bg-white/5 flex justify-between items-center">
                                                    <span className="font-bold text-xs uppercase tracking-widest opacity-50 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="font-medium">{String(value)}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </TabsContent>

                                    <TabsContent key="reviews" value="reviews" className="mt-8 focus:outline-none">
                                        <div className="text-center py-24 border border-dashed border-black/10 dark:border-white/10 rounded-3xl">
                                            <div className="text-4xl mb-4 opacity-20">💬</div>
                                            <p className="font-black text-sm uppercase tracking-widest mb-4 opacity-50">No reviews yet</p>
                                            <Button variant="outline" className="rounded-full">Be the first to review</Button>
                                        </div>
                                    </TabsContent>
                                </AnimatePresence>
                            </Tabs>
                        </div>

                    </div>
                </div>
            </main>

            {/* Global Style overrides for Gallery */}
            <style jsx global>{`
                .premium-gallery .image-gallery-content .image-gallery-slide .image-gallery-image {
                    max-height: 600px;
                    object-fit: contain; /* or cover for cleaner look depending on aspect ratio */
                    padding: 2rem;
                    background: transparent;
                }
                .premium-gallery .image-gallery-thumbnail.active, .premium-gallery .image-gallery-thumbnail:hover {
                    border: 2px solid currentColor;
                    border-radius: 8px;
                    opacity: 1;
                }
                .premium-gallery .image-gallery-thumbnail {
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .premium-gallery .image-gallery-icon {
                    color: white;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                }
            `}</style>
        </div>
    );
}
