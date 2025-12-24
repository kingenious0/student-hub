'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Category {
    id: string;
    slug: string;
    name: string;
    icon: string;
    gradient: string;
    count: number;
    trending?: boolean;
}

const categoryConfig = [
    {
        id: 'food',
        slug: 'food-and-snacks',
        name: 'Food & Snacks',
        icon: '🍕',
        gradient: 'from-orange-500 to-red-500',
        trending: true
    },
    {
        id: 'tech',
        slug: 'tech-and-gadgets',
        name: 'Tech & Gadgets',
        icon: '💻',
        gradient: 'from-blue-500 to-purple-500'
    },
    {
        id: 'books',
        slug: 'books-and-notes',
        name: 'Books & Notes',
        icon: '📚',
        gradient: 'from-green-500 to-teal-500'
    },
    {
        id: 'fashion',
        slug: 'fashion',
        name: 'Fashion',
        icon: '👕',
        gradient: 'from-pink-500 to-purple-500'
    },
    {
        id: 'services',
        slug: 'services',
        name: 'Services',
        icon: '⚡',
        gradient: 'from-yellow-500 to-orange-500'
    },
    {
        id: 'misc',
        slug: 'everything-else',
        name: 'Everything Else',
        icon: '🎯',
        gradient: 'from-indigo-500 to-blue-500'
    }
];

export default function BentoCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategoryCounts();
    }, []);

    const fetchCategoryCounts = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();

            if (data.success) {
                // Map the API data to our category config
                const categoriesWithCounts = categoryConfig.map(config => {
                    const apiCategory = data.categories.find(
                        (cat: any) => cat.slug === config.slug
                    );
                    return {
                        ...config,
                        count: apiCategory?._count?.products || 0
                    };
                });
                setCategories(categoriesWithCounts);
            }
        } catch (error) {
            console.error('Failed to fetch category counts:', error);
            // Fallback to config without counts
            setCategories(categoryConfig.map(c => ({ ...c, count: 0 })));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mb-12">
                <div className="mb-6">
                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">
                        Explore Categories
                    </h2>
                    <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest">
                        Discover what's available on campus
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bento-card p-6 h-32 animate-pulse bg-surface/50"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-12">
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">
                    Explore Categories
                </h2>
                <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest">
                    Discover what's available on campus
                </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            href={`/category/${category.slug}`}
                            className="group block"
                        >
                            <div className="bento-card p-6 h-full flex flex-col items-center justify-center text-center relative">
                                {/* Trending Badge */}
                                {category.trending && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-[8px] font-black uppercase tracking-wider rounded-full animate-pulse">
                                        🔥 Hot
                                    </div>
                                )}

                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-[var(--bento-radius)]`}></div>

                                {/* Icon */}
                                <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300 animate-float">
                                    {category.icon}
                                </div>

                                {/* Category Name */}
                                <h3 className="text-sm font-black text-foreground uppercase tracking-tight mb-1 relative z-10">
                                    {category.name}
                                </h3>

                                {/* Real Item Count */}
                                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest relative z-10">
                                    {category.count} {category.count === 1 ? 'Item' : 'Items'}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
