
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

    if (!userId) {
        redirect('/marketplace');
    }

    const clerkUser = await currentUser();
    // Safely extract email or use a placeholder (Paystack requires an email format)
    const studentEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkUser?.username || clerkUser?.id}@omni.user`;

    const [product, systemConfig] = await Promise.all([
        prisma.product.findUnique({
            where: { id },
            include: {
                vendor: true,
            },
        }),
        prisma.systemConfig.findUnique({
            where: { id: 'GLOBAL_CONFIG' }
        })
    ]);

    if (systemConfig?.maintenanceMode) {
        redirect('/marketplace');
    }

    if (!product) {
        redirect('/marketplace');
    }

    const deliveryFee = systemConfig?.deliveryFee ?? 5.0;

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 relative overflow-hidden transition-colors duration-300">
            {/* OMNI Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            {/* Paystack Script */}
            <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />

            <div className="max-w-4xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    {/* Left Side: Product Showcase */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
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
                            <p className="text-foreground/40 text-lg font-medium leading-relaxed uppercase tracking-tight">{product.description}</p>
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
                    <div className="animate-in fade-in slide-in-from-right duration-700">
                        <CheckoutForm
                            productId={product.id}
                            productTitle={product.title}
                            productPrice={product.price}
                            email={studentEmail}
                            vendorLandmark={product.hotspot || 'Main Campus'}
                            deliveryFee={deliveryFee}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
