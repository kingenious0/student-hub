'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import * as React from 'react';

export default function FlashSalesSection() {
    const [timeLeft, setTimeLeft] = React.useState({ hours: 0, minutes: 0, seconds: 0 });
    const [flashSales, setFlashSales] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [endTime, setEndTime] = React.useState<Date | null>(null);

    const trending = ["Iphone 16", "Fried Rice", "Macbook Air", "Sneakers", "T-Shirts", "Hostels", "Laptops"];

    React.useEffect(() => {
        fetch('/api/flash-sales')
            .then(res => res.json())
            .then(data => {
                setFlashSales(data.flashSales || []);
                if (data.endTime) {
                    setEndTime(new Date(data.endTime));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    React.useEffect(() => {
        if (!endTime) {
            const fallbackEndTime = new Date();
            fallbackEndTime.setDate(fallbackEndTime.getDate() + 1);
            fallbackEndTime.setHours(0, 0, 0, 0);
            setEndTime(fallbackEndTime);
            return;
        }

        const calculateTimeLeft = () => {
            const difference = endTime.getTime() - new Date().getTime();
            if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };
            return {
                hours: Math.floor(difference / (1000 * 60 * 60)),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    if (!loading && flashSales.length === 0) return null;

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="bg-surface border-y border-surface-border py-4 overflow-hidden -mx-4" />
                <div className="bg-surface rounded-[3rem] p-8 md:p-12 border border-surface-border">
                    <div className="flex items-center gap-5 mb-12">
                        <div className="w-14 h-14 bg-foreground/10 rounded-2xl animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-foreground/10 rounded-lg animate-pulse" />
                            <div className="h-4 w-32 bg-foreground/10 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-foreground/5 rounded-2xl p-4">
                                <div className="aspect-square bg-foreground/10 rounded-xl mb-3 animate-pulse" />
                                <div className="h-4 bg-foreground/10 rounded mb-2 animate-pulse" />
                                <div className="h-6 w-20 bg-foreground/10 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-surface border-y border-surface-border py-4 overflow-hidden -mx-4">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex whitespace-nowrap gap-12"
                >
                    {[...trending, ...trending, ...trending].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Trending</span>
                            <span className="text-sm font-black italic">{item}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="bg-surface rounded-[3rem] p-8 md:p-12 text-foreground relative overflow-hidden border border-surface-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-3xl animate-pulse shadow-[0_0_30px_var(--primary-glow)]">
                            ⚡
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none mb-2">
                                Flash <span className="text-primary">Sales</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                                </span>
                                <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">Live Promotions</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-foreground/5 backdrop-blur-xl rounded-3xl p-4 border border-surface-border">
                        <div className="flex items-center gap-3">
                            {[
                                { val: timeLeft.hours, label: 'h' },
                                { val: timeLeft.minutes, label: 'm' },
                                { val: timeLeft.seconds, label: 's' }
                            ].map((t, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="flex flex-col items-center min-w-[3.5rem]">
                                        <span className="text-3xl font-black tabular-nums leading-none mb-1">
                                            {String(t.val).padStart(2, '0')}
                                        </span>
                                        <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">{t.label}</span>
                                    </div>
                                    {idx < 2 && <span className="text-2xl font-black opacity-20">:</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {flashSales.slice(0, 4).map((sale) => (
                        <Link
                            key={sale.id}
                            href={`/products/${sale.product.id}`}
                            className="bg-surface rounded-2xl p-4 hover:scale-105 transition-transform cursor-pointer border border-surface-border"
                        >
                            <div className="relative aspect-square bg-background rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-black z-10">
                                    -{sale.discountPercent}%
                                </div>
                                {sale.product.imageUrl ? (
                                    <Image
                                        src={sale.product.imageUrl}
                                        alt={sale.product.title}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                        className="object-cover rounded-xl"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="text-5xl">📦</div>
                                )}
                            </div>
                            <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-2">
                                {sale.product.title}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-xl font-black text-primary">
                                    ₵{sale.salePrice.toFixed(2)}
                                </span>
                                <span className="text-xs text-foreground/30 line-through font-bold">
                                    ₵{sale.originalPrice.toFixed(2)}
                                </span>
                            </div>
                            {sale.stockRemaining <= 5 && sale.stockRemaining > 0 && (
                                <div className="text-xs font-bold text-primary animate-pulse">Only {sale.stockRemaining} left!</div>
                            )}
                            {sale.stockRemaining > 5 && (
                                <div className="text-xs text-foreground/50 font-bold">In Stock</div>
                            )}
                            {sale.stockRemaining === 0 && (
                                <div className="text-xs text-destructive font-bold">Sold Out</div>
                            )}
                        </Link>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/deals"
                        className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-lg"
                    >
                        See All Flash Deals →
                    </Link>
                </div>
            </div>
        </div>
    );
}
