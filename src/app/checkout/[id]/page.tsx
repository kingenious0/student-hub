import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { redirect } from 'next/navigation';
import Script from 'next/script';

export default async function CheckoutPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { userId } = await auth();
    const { id } = await params;

    let studentEmail = '';
    let isGuest = true;

    if (userId) {
        const clerkUser = await currentUser();
        const rawEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkUser?.username || clerkUser?.id || 'guest'}@LaHustle-marketplace.com`;
        studentEmail = rawEmail.trim().toLowerCase();
        isGuest = false;
    }

    const [product, systemSettings] = await Promise.all([
        prisma.product.findUnique({
            where: { id },
            include: {
                vendor: true,
                flashSale: {
                    where: { isActive: true }
                }
            },
        }),
        prisma.systemSettings.findUnique({
            where: { id: 'GLOBAL_CONFIG' }
        })
    ]);

    if (systemSettings?.maintenanceMode) {
        redirect('/');
    }

    if (!product) {
        redirect('/');
    }

    // Determine active price
    let activePrice = Number(product.price);
    const flashSale = product.flashSale;
    const isFlashSaleActive = !!(
        flashSale &&
        flashSale.isActive &&
        new Date() >= new Date(flashSale.startTime) &&
        new Date() <= new Date(flashSale.endTime) &&
        flashSale.stockSold < flashSale.stockLimit
    );

    if (isFlashSaleActive) {
        activePrice = Number(flashSale.salePrice);
    }

    const deliveryFee = 5.0;
    const cleanDesc = product.description ? product.description.replace(/<[^>]*>/g, '').substring(0, 180) + (product.description.length > 180 ? '...' : '') : '';

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 relative overflow-hidden transition-colors duration-300">
            {/* LaHustle Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            {/* Paystack Script */}
            <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />

            <div className="max-w-4xl mx-auto px-4">
                {/* Mobile Compact View (Visible only below md) */}
                <div className="md:hidden mb-6 bg-surface border border-surface-border rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-background shrink-0 border border-surface-border">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-primary font-black uppercase tracking-wider block mb-0.5">Purchasing</span>
                        <h2 className="text-lg font-black text-foreground uppercase tracking-tight truncate">{product.title}</h2>
                        <p className="text-xs text-foreground/45 truncate">by {product.vendor.shopName || product.vendor.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-foreground">₵{activePrice.toFixed(2)}</span>
                            {isFlashSaleActive && (
                                <>
                                    <span className="text-xs text-foreground/40 line-through">₵{Number(product.price).toFixed(2)}</span>
                                    <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Sale</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-start">
                    {/* Left Side: Product Showcase (Hidden on mobile) */}
                    <div className="hidden md:block space-y-8 animate-in fade-in slide-in-from-left duration-700">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface border border-surface-border">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-8xl bg-surface">📦</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h1 className="text-4xl font-black text-foreground mb-2 uppercase tracking-tighter">{product.title}</h1>
                            <p className="text-foreground/40 text-sm font-medium leading-relaxed uppercase tracking-tight">{cleanDesc}</p>
                            
                            {isFlashSaleActive && (
                                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] text-red-500 uppercase tracking-widest font-black">Active Flash Sale</p>
                                        <p className="text-foreground font-black uppercase text-xs">Dynamic pricing applied</p>
                                    </div>
                                    <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded">
                                        -{flashSale.discountPercent}% Off
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="bg-surface border border-surface-border rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-black text-primary-foreground">
                                    {product.vendor.name?.[0] || 'V'}
                                </div>
                                <div>
                                    <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black">Trusted Vendor</p>
                                    <p className="text-foreground font-black uppercase tracking-tight">{product.vendor.name || 'Anonymous Vendor'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Verified Hot-Vendor
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Checkout Form */}
                    <div className="animate-in fade-in slide-in-from-right duration-700 w-full">
                        <CheckoutForm
                            productId={product.id}
                            productTitle={product.title}
                            productPrice={activePrice}
                            email={studentEmail}
                            isGuest={isGuest}
                            vendorLandmark={product.hotspot || 'Main Campus'}
                            deliveryFee={deliveryFee}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
