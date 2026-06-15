'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  { slug: 'food-and-snacks', name: 'Food & Snacks', icon: '🍕' },
  { slug: 'tech-and-gadgets', name: 'Tech & Gadgets', icon: '💻' },
  { slug: 'fashion', name: 'Fashion', icon: '👕' },
  { slug: 'books-and-notes', name: 'Books & Notes', icon: '📚' },
  { slug: 'services', name: 'Services', icon: '⚡' },
  { slug: 'everything-else', name: 'Everything Else', icon: '🎯' }
];

export default function CategoriesMarquee() {
  const router = useRouter();

  const handleCategoryClick = (slug: string) => {
    router.push(`/marketplace?category=${slug}`);
  };

  // Duplicate items to ensure a seamless infinite scroll loop
  const marqueeItems = React.useMemo(() => {
    return [...categories, ...categories, ...categories, ...categories];
  }, []);

  return (
    <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group my-8 sm:my-16">
      {/* Soft gradient edge fade that matches dark/minimalist background */}
      <div className="absolute left-0 top-0 h-full w-16 md:w-32 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
      
      <div className="flex min-w-[200%] animate-[marquee_15s_linear_infinite] sm:animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused] gap-4">
        {marqueeItems.map((cat, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(cat.slug)}
            className="flex items-center gap-2 px-6 py-3.5 bg-surface/40 hover:bg-surface border border-surface-border hover:border-primary/50 text-foreground/75 hover:text-foreground text-xs sm:text-sm font-black uppercase tracking-wider rounded-2xl active:scale-95 transition-all duration-300 shadow-xl cursor-pointer"
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
      
      <div className="absolute right-0 top-0 h-full w-16 md:w-32 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
