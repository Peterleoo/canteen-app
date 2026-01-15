import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
    cart: CartItem[];
    canteenId: string | null;
    canteenName: string | null;
    conflictProduct: Product | null;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    confirmClearAndAdd: () => void;
    cancelConflict: () => void;
    getCartQuantity: (productId: string) => number;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            canteenId: null,
            canteenName: null,
            conflictProduct: null,

            addToCart: (product: Product) => {
                const { cart, canteenId } = get();

                // 冲突检测：如果购物车不为空且新商品的食堂 ID 不同
                if (cart.length > 0 && canteenId && product.canteenId && canteenId !== product.canteenId) {
                    set({ conflictProduct: product });
                    return;
                }

                set((state) => {
                    // 如果是第一件商品，锁定食堂
                    const newCanteenId = state.cart.length === 0 ? product.canteenId : state.canteenId;
                    const newCanteenName = state.cart.length === 0 ? product.canteen?.name : state.canteenName;

                    const existing = state.cart.find((item) => item.id === product.id);
                    if (existing) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                            canteenId: newCanteenId || null,
                            canteenName: newCanteenName || null,
                        };
                    }
                    return {
                        cart: [...state.cart, { ...product, quantity: 1 }],
                        canteenId: newCanteenId || null,
                        canteenName: newCanteenName || null,
                    };
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

            clearCart: () => set({ cart: [], canteenId: null, canteenName: null, conflictProduct: null }),

            confirmClearAndAdd: () => {
                const { conflictProduct, addToCart, clearCart } = get();
                if (conflictProduct) {
                    const productToStore = { ...conflictProduct };
                    clearCart();
                    // 清空后直接添加（此时 cart.length 为 0，不会再触发冲突）
                    addToCart(productToStore);
                    set({ conflictProduct: null });
                }
            },

            cancelConflict: () => set({ conflictProduct: null }),

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
