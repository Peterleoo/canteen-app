import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address } from '../types';
import {
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress
} from '../services/userService';

interface AddressState {
    addresses: Address[];
    isLoading: boolean;
    error: string | null;
    loadAddresses: (userId: string) => Promise<void>;
    addAddress: (address: Address) => Promise<void>;
    updateAddress: (address: Address) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string, userId: string) => Promise<void>;
    getDefaultAddress: () => Address | undefined;
}

export const useAddressStore = create<AddressState>()(
    persist(
        (set, get) => ({
            addresses: [],
            isLoading: false,
            error: null,

            // 从数据库加载地址
            loadAddresses: async (userId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await getUserAddresses(userId);
                    if (response.code === 200) {
                        set({ addresses: response.data || [] });
                    } else {
                        set({ error: response.message });
                    }
                } catch (error: any) {
                    set({ error: error.message || '加载地址失败' });
                } finally {
                    set({ isLoading: false });
                }
            },

            // 添加地址并同步到数据库
            addAddress: async (newAddr: Address) => {
                if (!newAddr.userId) {
                    set({ error: '用户ID不能为空' });
                    return;
                }
                
                set({ isLoading: true, error: null });
                try {
                    const response = await createUserAddress(newAddr);
                    if (response.code === 200 && response.data) {
                        set((state) => {
                            let updated = [...state.addresses, response.data];
                            if (response.data.isDefault) {
                                updated = updated.map(a => a.id === response.data?.id ? a : { ...a, isDefault: false });
                            }
                            return { addresses: updated };
                        });
                    } else {
                        set({ error: response.message });
                    }
                } catch (error: any) {
                    set({ error: error.message || '添加地址失败' });
                } finally {
                    set({ isLoading: false });
                }
            },

            // 更新地址并同步到数据库
            updateAddress: async (updatedAddr: Address) => {
                if (!updatedAddr.id) {
                    set({ error: '地址ID不能为空' });
                    return;
                }
                
                set({ isLoading: true, error: null });
                try {
                    const response = await updateUserAddress(updatedAddr.id, updatedAddr);
                    if (response.code === 200 && response.data) {
                        set((state) => {
                            let updated = state.addresses.map(a => a.id === response.data?.id ? response.data : a);
                            if (response.data.isDefault) {
                                updated = updated.map(a => a.id === response.data?.id ? a : { ...a, isDefault: false });
                            }
                            return { addresses: updated };
                        });
                    } else {
                        set({ error: response.message });
                    }
                } catch (error: any) {
                    set({ error: error.message || '更新地址失败' });
                } finally {
                    set({ isLoading: false });
                }
            },

            // 删除地址并同步到数据库
            deleteAddress: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await deleteUserAddress(id);
                    if (response.code === 200) {
                        set((state) => ({ addresses: state.addresses.filter(a => a.id !== id) }));
                    } else {
                        set({ error: response.message });
                    }
                } catch (error: any) {
                    set({ error: error.message || '删除地址失败' });
                } finally {
                    set({ isLoading: false });
                }
            },

            // 设置默认地址并同步到数据库
            setDefaultAddress: async (id: string, userId: string) => {
                const currentAddress = get().addresses.find(a => a.id === id);
                if (!currentAddress) {
                    set({ error: '地址不存在' });
                    return;
                }
                
                set({ isLoading: true, error: null });
                try {
                    // 更新当前地址为默认地址
                    const updatedAddr = { ...currentAddress, isDefault: true, userId };
                    const response = await updateUserAddress(id, updatedAddr);
                    
                    if (response.code === 200 && response.data) {
                        set((state) => ({
                            addresses: state.addresses.map(a => ({
                                ...a,
                                isDefault: a.id === id
                            }))
                        }));
                    } else {
                        set({ error: response.message });
                    }
                } catch (error: any) {
                    set({ error: error.message || '设置默认地址失败' });
                } finally {
                    set({ isLoading: false });
                }
            },

            // 获取默认地址
            getDefaultAddress: () => {
                return get().addresses.find(a => a.isDefault) || get().addresses[0];
            }
        }),
        {
            name: 'canteen-address-storage',
            // 不持久化加载状态和错误信息
            partialize: (state) => ({
                addresses: state.addresses
            })
        }
    )
);
