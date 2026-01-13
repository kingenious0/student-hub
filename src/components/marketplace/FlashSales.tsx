// Flash Sales Section - Jumia Style
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EnhancedProductCard from './EnhancedProductCard';

interface FlashSaleProduct {
    id: string;
    title: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    imageUrl: string | null;
    stockRemaining: number;
    category?: { name: string };
    vendor?: { name: string };
}

interface FlashSalesProps {
    endTime: Date;
    products: FlashSaleProduct[];
}

export default function FlashSales({ endTime, products }: FlashSalesProps) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = new Date(endTime).getTime() - new Date().getTime();

        if (difference <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            hours: Math.floor(difference / (1000 * 60 * 60)),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (products.length === 0) return null;

    return (
        <section className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 md:p-8 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">⚡</div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                            Flash Sales
                        </h2>
                        <p className="text-white/80 text-sm font-bold">
                            Limited time offers • Hurry up!
                        </p>
                    </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-wide">Time Left</span>
                    <div className="flex items-center gap-1">
                        <TimeBox value={timeLeft.hours} label="h" />
                        <span className="text-xl font-black">:</span>
                        <TimeBox value={timeLeft.minutes} label="m" />
                        <span className="text-xl font-black">:</span>
                        <TimeBox value={timeLeft.seconds} label="s" />
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {products.map((product) => (
                    <EnhancedProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        discountPercent={product.discountPercent}
                        imageUrl={product.imageUrl}
                        category={product.category?.name}
                        vendorName={product.vendor?.name}
                        stockQuantity={product.stockRemaining}
                        isFlashSale={true}
                    />
                ))}
            </div>

            {/* View All Link */}
            <div className="mt-6 text-center">
                <Link
                    href="/deals"
                    className="inline-block bg-white text-orange-600 px-8 py-3 rounded-full font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-lg"
                >
                    See All Deals →
                </Link>
            </div>
        </section>
    );
}

function TimeBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center bg-white/30 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[3rem]">
            <span className="text-2xl font-black leading-none">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold uppercase opacity-80">
                {label}
            </span>
        </div>
    );
}
