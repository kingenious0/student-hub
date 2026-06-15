import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function generateCartItemId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export interface SelectedModifier {
  groupName: string;
  optionName: string;
  priceDiff: number;
}

export interface CartItem {
    id: string;
    cartItemId: string;
    title: string;
    price: number;
    imageUrl: string | null;
    vendorId: string;
    vendorName: string;
    quantity: number;
    selectedModifiers?: SelectedModifier[];
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
    selectedModifiers?: SelectedModifier[];
}

function itemTotal(item: CartItem): number {
  const modifiersTotal = (item.selectedModifiers || []).reduce((sum, m) => sum + m.priceDiff, 0);
  return (item.price + modifiersTotal) * item.quantity;
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
                    const modifiersKey = JSON.stringify(product.selectedModifiers || []);
                    const existing = state.items.find(
                        (item) => item.id === product.id && JSON.stringify(item.selectedModifiers || []) === modifiersKey
                    );
                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.cartItemId === existing.cartItemId
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
                                cartItemId: generateCartItemId(),
                                title: product.title,
                                price: Number(product.price),
                                imageUrl: product.imageUrl ?? null,
                                vendorId: product.vendor?.id || product.vendorId || '',
                                vendorName: product.vendor?.name || product.vendorName || 'Vendor',
                                quantity: qty,
                                selectedModifiers: product.selectedModifiers || [],
                            },
                        ],
                        lastActivityAt: Date.now(),
                    };
                });
            },
            removeFromCart: (cartItemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.cartItemId !== cartItemId),
                    lastActivityAt: Date.now(),
                }));
            },
            updateQuantity: (cartItemId, quantity) => {
                const qty = Number(quantity);
                if (qty < 1) {
                    get().removeFromCart(cartItemId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.cartItemId === cartItemId ? { ...item, quantity: qty } : item
                    ),
                    lastActivityAt: Date.now(),
                }));
            },
            clearCart: () => set({ items: [], lastActivityAt: null, recoveryStep: 0, lastRecoverySentAt: null }),
            getCartTotal: () => {
                return get().items.reduce((total, item) => total + itemTotal(item), 0);
            },
            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
            markRecoverySent: (step: number) => set({ recoveryStep: step, lastRecoverySentAt: Date.now() }),
            resetRecovery: () => set({ recoveryStep: 0, lastRecoverySentAt: null }),
            touchActivity: () => set({ lastActivityAt: Date.now() }),
        }),
        {
            name: 'LaHustle-cart-storage',
            onRehydrateStorage: () => {
                return (state) => {
                    if (state) {
                        state.items = state.items.map(item => ({
                            ...item,
                            cartItemId: item.cartItemId || generateCartItemId(),
                        }));
                    }
                };
            },
        }
    )
)
