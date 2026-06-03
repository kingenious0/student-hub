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

interface CartProduct {
    id: string;
    title: string;
    price: number;
    imageUrl?: string | null;
    vendorId?: string;
    vendorName?: string;
    vendor?: { id: string; name: string };
    flashSaleId?: string;
}

interface CartStore {
    items: CartItem[];
    lastActivityAt: number | null;
    recoveryStep: number;
    lastRecoverySentAt: number | null;
    addToCart: (product: CartProduct, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
    touchActivity: () => void;
    markRecoverySent: (step: number) => void;
    resetRecovery: () => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            lastActivityAt: null,
            recoveryStep: 0,
            lastRecoverySentAt: null,
            addToCart: (product: CartProduct, quantity = 1) => {
                set((state) => {
                    const qty = Number(quantity);
                    const existing = state.items.find((item) => item.id === product.id);
                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + qty }
                                    : item
                            ),
                            lastActivityAt: Date.now(),
                        };
                    }
                    return {
                        items: [
                            ...state.items,
                            {
                                id: product.id,
                                title: product.title,
                                price: Number(product.price),
                                imageUrl: product.imageUrl,
                                vendorId: product.vendor?.id || product.vendorId,
                                vendorName: product.vendor?.name || product.vendorName || 'Vendor',
                                quantity: qty,
                            },
                        ],
                        lastActivityAt: Date.now(),
                    };
                });
            },
            removeFromCart: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                    lastActivityAt: Date.now(),
                }));
            },
            updateQuantity: (productId, quantity) => {
                const qty = Number(quantity);
                if (qty < 1) {
                    get().removeFromCart(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === productId ? { ...item, quantity: qty } : item
                    ),
                    lastActivityAt: Date.now(),
                }));
            },
            clearCart: () => set({ items: [], lastActivityAt: null, recoveryStep: 0, lastRecoverySentAt: null }),
            getCartTotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
            markRecoverySent: (step: number) => set({ recoveryStep: step, lastRecoverySentAt: Date.now() }),
            resetRecovery: () => set({ recoveryStep: 0, lastRecoverySentAt: null }),
            touchActivity: () => set({ lastActivityAt: Date.now() }),
        }),
        {
            name: 'omni-cart-storage', // name of the item in the storage (must be unique)
        }
    )
)
