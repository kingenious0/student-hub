'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

interface ReviewFormProps {
    productId: string;
    onReviewSubmitted: () => void;
}

const StarButton = ({ selected, hovered, onClick, onMouseEnter, onMouseLeave, star }: {
    selected: boolean;
    hovered: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    star: number;
}) => (
    <button
        type="button"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        className={`w-11 h-11 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${
            hovered || selected ? 'text-yellow-400' : 'text-zinc-600 dark:text-zinc-500'
        }`}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    </button>
);

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
    const { user } = useUser();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating, comment: comment.trim() || undefined })
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to submit review');
            }
            toast.success('Review submitted!');
            setRating(0);
            setComment('');
            onReviewSubmitted();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-5"
        >
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-3">
                    Your Rating
                </label>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <StarButton
                            key={star}
                            star={star}
                            selected={star <= rating}
                            hovered={star <= hoveredRating}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => {}}
                        />
                    ))}
                    <span className="ml-3 text-xs font-bold text-foreground/50 uppercase tracking-widest">
                        {rating > 0 ? `${rating} / 5` : 'Tap to rate'}
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="review-comment" className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-3">
                    Comment <span className="opacity-40">(optional)</span>
                </label>
                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    className="w-full bg-background/80 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 font-medium resize-none focus:outline-none focus:border-primary transition-colors"
                />
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    size="sm"
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </motion.form>
    );
}
