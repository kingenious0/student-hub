'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    vendorId: string;
    vendorName: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('omni_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('omni_cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (product: any, quantity: number = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                id: product.id,
                title: product.title,
                price: product.price,
                imageUrl: product.imageUrl,
                vendorId: product.vendor?.id || product.vendorId,
                vendorName: product.vendor?.name || product.vendorName || 'Vendor',
                quantity: quantity
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getCartTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getItemCount = () => {
        return items.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
