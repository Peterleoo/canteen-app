import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { generateLocalAvatar } from '../utils/format';

interface UserState {
    user: User | null;
    login: () => void;
    logout: () => void;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
    pickupContact: { name: string; phone: string };
    updatePickupContact: (name: string, phone: string) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            showLoginModal: false,
            pickupContact: { name: '', phone: '' },

            login: () => {
                const mockUser = {
                    id: 'u123',
                    username: 'wechat_user',
                    name: '微信用户',
                    phone: '138****8888',
                    avatar: generateLocalAvatar('微'),
                    status: 'ACTIVE' as const,
                    createdAt: new Date().toISOString(),
                };
                set((state) => {
                    const newState: Partial<UserState> = { user: mockUser, showLoginModal: false };
                    if (!state.pickupContact.name) {
                        newState.pickupContact = { name: '微信用户', phone: '13800008888' };
                    }
                    return newState;
                });
            },

            logout: () => set({ user: null }),

            setShowLoginModal: (show: boolean) => set({ showLoginModal: show }),

            updatePickupContact: (name: string, phone: string) => set({ pickupContact: { name, phone } }),
        }),
        {
            name: 'canteen-user-storage',
            partialize: (state) => ({ user: state.user, pickupContact: state.pickupContact }), // Don't persist modal state
        }
    )
);
