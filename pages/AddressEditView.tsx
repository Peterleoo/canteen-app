import React, { useState } from 'react';
import { Address } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { Button } from '../components/Button';
import { useAddressStore } from '../stores/useAddressStore';

interface AddressEditViewProps {
    initialAddress: Partial<Address>;
    onBack: () => void;
    onSaved: () => void; // Callback after save to navigate back
}

export const AddressEditView: React.FC<AddressEditViewProps> = ({
    initialAddress,
    onBack,
    onSaved
}) => {
    const { addAddress, updateAddress, deleteAddress } = useAddressStore();
    const [currentAddress, setCurrentAddress] = useState<Partial<Address>>(initialAddress);

    const updateAddr = (field: keyof Address, value: any) => {
        setCurrentAddress(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!currentAddress.contactName || !currentAddress.phone || !currentAddress.area || !currentAddress.detail) {
            alert("请填写完整信息");
            return;
        }
        const newAddr = {
            ...currentAddress,
            id: currentAddress.id || Date.now().toString(),
            isDefault: currentAddress.isDefault || false,
            tag: currentAddress.tag || '其他'
        } as Address;

        if (currentAddress.id) {
            updateAddress(newAddr);
        } else {
            addAddress(newAddr);
        }
        onSaved();
    };

    const handleDelete = () => {
        if (currentAddress.id) {
            if (window.confirm('确定要删除该地址吗？')) {
                deleteAddress(currentAddress.id);
                onSaved();
            }
        }
    };

    return (
        <div className="absolute inset-0 bg-[#f3f4f6] z-[120] flex flex-col animate-slide-in">
            <WeChatHeader title={currentAddress.id ? "编辑地址" : "新增地址"} onBack={onBack} />
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <label className="w-20 text-sm font-medium text-gray-900">联系人</label>
                        <input type="text" value={currentAddress.contactName || ''} onChange={e => updateAddr('contactName', e.target.value)} placeholder="请填写收货人姓名" className="flex-1 outline-none text-sm" />
                    </div>
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <label className="w-20 text-sm font-medium text-gray-900">手机号</label>
                        <input type="tel" value={currentAddress.phone || ''} onChange={e => updateAddr('phone', e.target.value)} placeholder="请填写收货人手机号" className="flex-1 outline-none text-sm" />
                    </div>
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <label className="w-20 text-sm font-medium text-gray-900">地址</label>
                        <input type="text" value={currentAddress.area || ''} onChange={e => updateAddr('area', e.target.value)} placeholder="小区/写字楼/学校" className="flex-1 outline-none text-sm" />
                    </div>
                    <div className="flex items-center p-4">
                        <label className="w-20 text-sm font-medium text-gray-900">门牌号</label>
                        <input type="text" value={currentAddress.detail || ''} onChange={e => updateAddr('detail', e.target.value)} placeholder="例：8号楼808室" className="flex-1 outline-none text-sm" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">标签</span>
                    <div className="flex gap-2">
                        {['家', '公司', '学校'].map(tag => (
                            <button key={tag} onClick={() => updateAddr('tag', tag)} className={`px-3 py-1 rounded-full text-xs border transition-colors ${currentAddress.tag === tag ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600'}`}>{tag}</button>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">设为默认地址</span>
                    <div onClick={() => updateAddr('isDefault', !currentAddress.isDefault)} className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${currentAddress.isDefault ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${currentAddress.isDefault ? 'translate-x-4' : ''}`}></div>
                    </div>
                </div>
                <Button fullWidth onClick={handleSave} className="mt-4 py-3 rounded-xl shadow-lg shadow-blue-100">保存</Button>
                {currentAddress.id && (<Button variant="outline" fullWidth onClick={handleDelete} className="mt-2 border-none text-red-500 bg-white shadow-sm">删除地址</Button>)}
            </div>
        </div>
    );
};
