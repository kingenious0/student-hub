'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
}

interface ReviewListProps {
    productId: string;
}

const StarIcon = ({ fill }: { fill: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SkeletonBlock({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-zinc-300 dark:bg-zinc-700 rounded-xl ${className || ''}`} />;
}

export default function ReviewList({ productId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/reviews/${productId}?page=${page}&pageSize=10`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setReviews(data.reviews);
                    setTotalPages(data.pagination.totalPages);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [productId, page]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-3">
                        <div className="flex items-center gap-3">
                            <SkeletonBlock className="w-8 h-8 rounded-full" />
                            <SkeletonBlock className="h-3 w-24" />
                        </div>
                        <SkeletonBlock className="h-3 w-full" />
                        <SkeletonBlock className="h-3 w-3/4" />
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-16 border border-dashed border-black/10 dark:border-white/10 rounded-3xl">
                <div className="text-3xl mb-3 opacity-20">💬</div>
                <p className="font-black text-xs uppercase tracking-widest opacity-50">No reviews yet</p>
                <p className="text-sm text-foreground/40 mt-2">Be the first to share your experience</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review, i) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-black uppercase">
                                {review.userName.charAt(0)}
                            </div>
                            <div>
                                <span className="text-sm font-bold text-foreground">{review.userName}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <StarIcon key={s} fill={s <= review.rating} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {review.verifiedPurchase && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Verified
                                </span>
                            )}
                            <span className="text-[10px] font-medium text-foreground/40">{formatDate(review.createdAt)}</span>
                        </div>
                    </div>
                    {review.comment && (
                        <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                    )}
                </motion.div>
            ))}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-bold text-foreground/50">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="px-4 py-2 rounded-full border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
