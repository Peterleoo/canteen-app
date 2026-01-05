import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address } from '../types';

interface AddressState {
    addresses: Address[];
    addAddress: (address: Address) => void;
    updateAddress: (address: Address) => void;
    deleteAddress: (id: string) => void;
    setDefaultAddress: (id: string) => void;
    getDefaultAddress: () => Address | undefined;
}

export const useAddressStore = create<AddressState>()(
    persist(
        (set, get) => ({
            addresses: [
                { id: '1', contactName: 'Peter女士', phone: '181****0809', area: '万科·滨河道', detail: '12栋', tag: '家', isDefault: true },
                { id: '2', contactName: '李同学', phone: '13800000001', area: '第二教学楼', detail: '302教室', tag: '学校', isDefault: false },
            ],

            addAddress: (newAddr: Address) => {
                set((state) => {
                    let updated = [...state.addresses, newAddr];
                    if (newAddr.isDefault) {
                        updated = updated.map(a => a.id === newAddr.id ? a : { ...a, isDefault: false });
                    }
                    return { addresses: updated };
                });
            },

            updateAddress: (updatedAddr: Address) => {
                set((state) => {
                    let updated = state.addresses.map(a => a.id === updatedAddr.id ? updatedAddr : a);
                    if (updatedAddr.isDefault) {
                        updated = updated.map(a => a.id === updatedAddr.id ? a : { ...a, isDefault: false });
                    }
                    return { addresses: updated };
                });
            },

            deleteAddress: (id: string) => {
                set((state) => ({ addresses: state.addresses.filter(a => a.id !== id) }));
            },

            setDefaultAddress: (id: string) => {
                set((state) => ({
                    addresses: state.addresses.map(a => ({ ...a, isDefault: a.id === id }))
                }));
            },

            getDefaultAddress: () => {
                return get().addresses.find(a => a.isDefault) || get().addresses[0];
            }
        }),
        {
            name: 'canteen-address-storage',
        }
    )
);
