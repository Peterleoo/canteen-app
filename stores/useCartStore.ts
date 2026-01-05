import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    getCartQuantity: (productId: string) => number;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],

            addToCart: (product: Product) => {
                set((state) => {
                    const existing = state.cart.find((item) => item.id === product.id);
                    if (existing) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                        };
                    }
                    return { cart: [...state.cart, { ...product, quantity: 1 }] };
                });
            },

            removeFromCart: (productId: string) => {
                set((state) => {
                    const existing = state.cart.find((item) => item.id === productId);
                    if (existing && existing.quantity > 1) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === productId
                                    ? { ...item, quantity: item.quantity - 1 }
                                    : item
                            ),
                        };
                    }
                    return { cart: state.cart.filter((item) => item.id !== productId) };
                });
            },

            updateQuantity: (productId: string, delta: number) => {
                set((state) => ({
                    cart: state.cart
                        .map((item) => {
                            if (item.id === productId) {
                                return { ...item, quantity: item.quantity + delta };
                            }
                            return item;
                        })
                        .filter((item) => item.quantity > 0),
                }));
            },

            clearCart: () => set({ cart: [] }),

            getCartQuantity: (productId: string) => {
                return get().cart.find((item) => item.id === productId)?.quantity || 0;
            },

            getCartTotal: () => {
                return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            },

            getCartCount: () => {
                return get().cart.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'canteen-cart-storage',
        }
    )
);
