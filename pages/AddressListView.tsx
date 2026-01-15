import React, { useEffect, useRef } from 'react';
import { Edit2, Plus } from 'lucide-react';
import { Address } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { Button } from '../components/Button';
import { useAddressStore } from '../stores/useAddressStore';
import { useUserStore } from '../stores/useUserStore';

interface AddressListViewProps {
    onBack: () => void;
    onEdit: (addr: Address) => void;
    onSelect: (addr: Address) => void;
    onAdd: () => void;
    isCheckoutMode?: boolean;
}

export const AddressListView: React.FC<AddressListViewProps> = ({
    onBack,
    onEdit,
    onSelect,
    onAdd,
    isCheckoutMode = false
}) => {
    const { user } = useUserStore();
    const { addresses, isLoading, loadAddresses } = useAddressStore();

    // 组件加载时从数据库加载地址
    // 使用ref防止React StrictMode下的重复调用
    const addressesLoadedRef = useRef(false);
    useEffect(() => {
        // React StrictMode下会执行两次，这里只执行一次
        if (addressesLoadedRef.current || !user?.id) return;
        addressesLoadedRef.current = true;

        loadAddresses(user.id);
    }, [user?.id]); // 移除loadAddresses依赖，避免每次渲染都重新加载

    return (
        <div className="flex-1 bg-[#f3f4f6] flex flex-col">
            <WeChatHeader title="我的地址" onBack={onBack} />
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                    <div className="flex justify-center items-center h-20 text-gray-500">
                        加载中...
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <p>暂无地址</p>
                        <Button onClick={onAdd} className="mt-4">
                            <Plus size={18} className="mr-1" /> 新增地址
                        </Button>
                    </div>
                ) : (
                    addresses.map(addr => (
                        <div key={addr.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm active:scale-[0.99] transition-transform">
                            <div onClick={() => {
                                if (isCheckoutMode) {
                                    onSelect(addr);
                                }
                            }} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 text-base">{addr.area} {addr.detail}</span>
                                    {addr.tag && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{addr.tag}</span>}
                                    {addr.isDefault && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">默认</span>}
                                </div>
                                <div className="text-sm text-gray-500">{addr.contactName} <span className="ml-2">{addr.phone}</span></div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(addr); }} className="p-2 text-gray-400 hover:text-gray-600 border-l border-gray-100 ml-2">
                                <Edit2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            {!isCheckoutMode && (
                <div className="p-4 bg-white border-t border-gray-100 pb-safe z-10">
                    <Button fullWidth onClick={onAdd} className="rounded-full shadow-lg shadow-blue-100"><Plus size={18} className="mr-1" /> 新增地址</Button>
                </div>
            )}
        </div>
    );
};
