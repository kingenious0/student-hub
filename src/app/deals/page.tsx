'use client';

import Link from 'next/link';
import * as React from 'react';

export default function DealsPage() {
    const [timeLeft, setTimeLeft] = React.useState({ hours: 0, minutes: 0, seconds: 0 });
    const [flashSales, setFlashSales] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [endTime, setEndTime] = React.useState<Date | null>(null);

    // Fetch flash sales from API
    React.useEffect(() => {
        fetch('/api/flash-sales')
            .then(res => res.json())
            .then(data => {
                setFlashSales(data.flashSales || []);
                if (data.endTime) {
                    setEndTime(new Date(data.endTime));
                } else {
                    // Fallback to tomorrow midnight
                    const fallback = new Date();
                    fallback.setDate(fallback.getDate() + 1);
                    fallback.setHours(0, 0, 0, 0);
                    setEndTime(fallback);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch flash sales:', error);
                setLoading(false);
            });
    }, []);

    React.useEffect(() => {
        if (!endTime) return;

        const calculateTimeLeft = () => {
            const difference = endTime.getTime() - new Date().getTime();

            if (difference <= 0) {
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                hours: Math.floor(difference / (1000 * 60 * 60)),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-4">
                    <span>←</span> Back to Home
                </Link>

                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-2">
                                ⚡ Flash Deals
                            </h1>
                            <p className="text-white/80 text-lg font-bold">
                                Limited time offers • Save up to 60%!
                            </p>
                        </div>

                        {/* Countdown */}
                        <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                            <span className="text-sm font-bold uppercase tracking-wide">Ends in</span>
                            <div className="flex items-center gap-1">
                                <div className="flex flex-col items-center bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[4rem]">
                                    <span className="text-3xl font-black leading-none tabular-nums">
                                        {String(timeLeft.hours).padStart(2, '0')}
                                    </span>
                                    <span className="text-xs font-bold uppercase opacity-80">hours</span>
                                </div>
                                <span className="text-2xl font-black">:</span>
                                <div className="flex flex-col items-center bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[4rem]">
                                    <span className="text-3xl font-black leading-none tabular-nums">
                                        {String(timeLeft.minutes).padStart(2, '0')}
                                    </span>
                                    <span className="text-xs font-bold uppercase opacity-80">mins</span>
                                </div>
                                <span className="text-2xl font-black">:</span>
                                <div className="flex flex-col items-center bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[4rem]">
                                    <span className="text-3xl font-black leading-none tabular-nums">
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </span>
                                    <span className="text-xs font-bold uppercase opacity-80">secs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deals Grid */}
            <div className="max-w-7xl mx-auto px-4">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-surface border border-surface-border rounded-2xl overflow-hidden animate-pulse">
                                <div className="aspect-square bg-surface-hover"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-surface-hover rounded"></div>
                                    <div className="h-6 bg-surface-hover rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : flashSales.length === 0 ? (
                    <div className="text-center bg-surface border border-surface-border rounded-3xl p-12">
                        <div className="text-6xl mb-4">⚡</div>
                        <h2 className="text-2xl font-black text-foreground mb-2">No Flash Sales Right Now</h2>
                        <p className="text-foreground/60 mb-6">Check back soon for amazing deals!</p>
                        <Link href="/" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform">
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {flashSales.map((sale) => (
                                <Link
                                    key={sale.id}
                                    href={`/products/${sale.product.id}`}
                                    className="group bg-surface border border-surface-border rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:scale-105"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-square bg-surface-hover flex items-center justify-center overflow-hidden">
                                        <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-black z-10">
                                            -{sale.discountPercent}%
                                        </div>
                                        {sale.product.imageUrl ? (
                                            <img
                                                src={sale.product.imageUrl}
                                                alt={sale.product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-7xl">📦</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-foreground mb-2 line-clamp-2">{sale.product.title}</h3>

                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-2xl font-black text-primary">₵{sale.salePrice.toFixed(2)}</span>
                                            <span className="text-sm text-foreground/40 line-through">₵{sale.originalPrice.toFixed(2)}</span>
                                        </div>

                                        {sale.stockRemaining <= 5 && sale.stockRemaining > 0 && (
                                            <div className="text-xs font-bold text-orange-600 animate-pulse">
                                                Only {sale.stockRemaining} left!
                                            </div>
                                        )}

                                        {sale.stockRemaining > 5 && (
                                            <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                In Stock
                                            </div>
                                        )}

                                        {sale.stockRemaining === 0 && (
                                            <div className="text-xs text-red-600 font-bold">
                                                Sold Out
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Coming Soon */}
                        {flashSales.length > 0 && (
                            <div className="mt-12 text-center bg-surface border border-surface-border rounded-3xl p-12">
                                <div className="text-6xl mb-4">🚀</div>
                                <h2 className="text-2xl font-black text-foreground mb-2">More Deals Coming Soon!</h2>
                                <p className="text-foreground/60">Check back daily for new flash sales and exclusive student discounts.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
