import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    vendorId: string;
    vendorName: string;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addToCart: (product: any, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addToCart: (product: any, quantity = 1) => {
                set((state) => {
                    const qty = Number(quantity); // Force number
                    const existing = state.items.find((item) => item.id === product.id);
                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + qty }
                                    : item
                            ),
                        };
                    }
                    return {
                        items: [
                            ...state.items,
                            {
                                id: product.id,
                                title: product.title,
                                price: Number(product.price), // Force number
                                imageUrl: product.imageUrl,
                                vendorId: product.vendor?.id || product.vendorId,
                                vendorName: product.vendor?.name || product.vendorName || 'Vendor',
                                quantity: qty,
                            },
                        ],
                    };
                });
            },
            removeFromCart: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                }));
            },
            updateQuantity: (productId, quantity) => {
                const qty = Number(quantity); // Force number
                if (qty < 1) {
                    get().removeFromCart(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === productId ? { ...item, quantity: qty } : item
                    ),
                }));
            },
            clearCart: () => set({ items: [] }),
            getCartTotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'omni-cart-storage', // name of the item in the storage (must be unique)
        }
    )
)
