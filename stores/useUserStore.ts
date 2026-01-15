import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { generateLocalAvatar } from '../utils/format';
import { loginWithWechat, loginWithPhone, loginWithPhonePassword } from '../services/userService';

interface UserState {
    user: User | null;
    isLoggingIn: boolean;
    error: string | null;
    login: () => void;
    loginWithWechat: (code: string) => Promise<void>;
    loginWithPhone: (phone: string, code: string) => Promise<void>;
    loginWithPhonePassword: (phone: string, password: string) => Promise<void>;
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
            isLoggingIn: false,
            error: null,
            showLoginModal: false,
            pickupContact: { name: '', phone: '' },

            login: () => {
                // Fallback to mock login for development
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
                    const newState: Partial<UserState> = { user: mockUser, showLoginModal: false, error: null };
                    if (!state.pickupContact.name) {
                        newState.pickupContact = { name: '微信用户', phone: '13800008888' };
                    }
                    return newState;
                });
            },

            loginWithWechat: async (code) => {
                set({ isLoggingIn: true, error: null });
                try {
                    const result = await loginWithWechat(code);
                    if (result.code === 200) {
                        set((state) => {
                            const newState: Partial<UserState> = { 
                                user: result.data, 
                                showLoginModal: false, 
                                isLoggingIn: false,
                                error: null 
                            };
                            if (!state.pickupContact.name && result.data.name && result.data.phone) {
                                newState.pickupContact = { 
                                    name: result.data.name, 
                                    phone: result.data.phone 
                                };
                            }
                            return newState;
                        });
                    } else {
                        set({ error: result.message, isLoggingIn: false });
                    }
                } catch (error: any) {
                    set({ error: error.message || '微信登录失败', isLoggingIn: false });
                }
            },

            loginWithPhone: async (phone, code) => {
        set({ isLoggingIn: true, error: null });
        try {
            const result = await loginWithPhone(phone, code);
            if (result.code === 200) {
                set((state) => {
                    const newState: Partial<UserState> = { 
                        user: result.data, 
                        showLoginModal: false, 
                        isLoggingIn: false,
                        error: null 
                    };
                    if (!state.pickupContact.name && result.data.name && result.data.phone) {
                        newState.pickupContact = { 
                            name: result.data.name, 
                            phone: result.data.phone 
                        };
                    }
                    return newState;
                });
            } else {
                set({ error: result.message, isLoggingIn: false });
            }
        } catch (error: any) {
            set({ error: error.message || '手机号登录失败', isLoggingIn: false });
        }
    },

    loginWithPhonePassword: async (phone, password) => {
        set({ isLoggingIn: true, error: null });
        try {
            const result = await loginWithPhonePassword(phone, password);
            if (result.code === 200) {
                set((state) => {
                    const newState: Partial<UserState> = { 
                        user: result.data, 
                        showLoginModal: false, 
                        isLoggingIn: false,
                        error: null 
                    };
                    if (!state.pickupContact.name && result.data.name && result.data.phone) {
                        newState.pickupContact = { 
                            name: result.data.name, 
                            phone: result.data.phone 
                        };
                    }
                    return newState;
                });
            } else {
                set({ error: result.message, isLoggingIn: false });
            }
        } catch (error: any) {
            set({ error: error.message || '手机号密码登录失败', isLoggingIn: false });
        }
    },

            logout: () => set({ user: null, error: null }),

            setShowLoginModal: (show: boolean) => set({ showLoginModal: show, error: null }),

            updatePickupContact: (name: string, phone: string) => set({ pickupContact: { name, phone } }),
        }),
        {
            name: 'canteen-user-storage',
            partialize: (state) => ({ user: state.user, pickupContact: state.pickupContact }), // Don't persist modal state
        }
    )
);
