
'use client';

import Link from 'next/link';
import GoBack from '@/components/navigation/GoBack';

const CATEGORIES = [
    { id: 'food', name: 'Food', icon: '🍔', color: 'bg-orange-500', description: 'Campus meals & delivery' },
    { id: 'tech', name: 'Tech', icon: '📱', color: 'bg-blue-500', description: 'Gadgets, repairs & parts' },
    { id: 'fashion', name: 'Fashion', icon: '👟', color: 'bg-pink-500', description: 'Clothing & accessories' },
    { id: 'books', name: 'Books', icon: '📚', color: 'bg-indigo-500', description: 'Textbooks & stationery' },
    { id: 'services', name: 'Services', icon: '✂️', color: 'bg-emerald-500', description: 'Hair, laundry & tutors' },
    { id: 'beauty', name: 'Beauty', icon: '💄', color: 'bg-rose-400', description: 'Cosmetics & skincare' },
    { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-green-600', description: 'Gear & activewear' },
    { id: 'stationary', name: 'Stationary', icon: '📎', color: 'bg-yellow-500', description: 'Office & study supplies' },
    { id: 'home', name: 'Home', icon: '🏠', color: 'bg-amber-600', description: 'Room essentials & decor' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🧘', color: 'bg-purple-500', description: 'Wellness & accessories' },
    { id: 'art', name: 'Art', icon: '🎨', color: 'bg-cyan-500', description: 'Creative supplies' },
    { id: 'audio', name: 'Audio', icon: '🎧', color: 'bg-slate-700', description: 'Sound & music gear' },
];

export default function MoreCategoriesPage() {
    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="pt-32 pb-12 px-4 max-w-7xl mx-auto">
                <GoBack fallback="/" />
                <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter mt-4">
                    THE HUB <span className="text-primary italic">DIRECTORY</span>
                </h1>
                <p className="text-foreground/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
                    Access all sectors of the student economy
                </p>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat) => (
                        <Link 
                            key={cat.id} 
                            href={`/category/${cat.id}`}
                            className="group relative overflow-hidden bg-surface border border-surface-border rounded-[2.5rem] p-8 transition-all hover:scale-[1.03] active:scale-95 hover:border-primary/50"
                        >
                            <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-black/10`}>
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                                {cat.name}
                            </h3>
                            <p className="text-foreground/40 text-xs font-medium leading-relaxed">
                                {cat.description}
                            </p>
                            
                            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-primary">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
