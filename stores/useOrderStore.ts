import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '../types';

interface OrderState {
    orders: Order[];
    addOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderState>()(
    persist(
        (set) => ({
            orders: [],
            addOrder: (order: Order) => set((state) => ({ orders: [order, ...state.orders] })),
        }),
        {
            name: 'canteen-order-storage',
        }
    )
);
