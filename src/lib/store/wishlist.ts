import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
    items: string[];
    addItem: (productId: string) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loadWishlist: () => Promise<void>;
    setItems: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: async (productId: string) => {
                set((state) => {
                    if (state.items.includes(productId)) return state;
                    return { items: [...state.items, productId] };
                });
                try {
                    const res = await fetch('/api/wishlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId }),
                    });
                    if (!res.ok) {
                        set((state) => ({
                            items: state.items.filter((id) => id !== productId),
                        }));
                    }
                } catch {
                    set((state) => ({
                        items: state.items.filter((id) => id !== productId),
                    }));
                }
            },
            removeItem: async (productId: string) => {
                set((state) => ({
                    items: state.items.filter((id) => id !== productId),
                }));
                try {
                    await fetch('/api/wishlist', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId }),
                    });
                } catch {
                    // Silently fail - item was already removed locally
                }
            },
            isInWishlist: (productId: string) => {
                return get().items.includes(productId);
            },
            loadWishlist: async () => {
                try {
                    const res = await fetch('/api/wishlist');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success) {
                            set({ items: data.items.map((item: any) => item.productId) });
                        }
                    }
                } catch {
                    // Silently fail - keep local state
                }
            },
            setItems: (ids: string[]) => set({ items: ids }),
        }),
        {
            name: 'omni-wishlist',
        }
    )
)
