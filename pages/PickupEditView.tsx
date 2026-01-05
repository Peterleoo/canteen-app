import React, { useState } from 'react';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { Button } from '../components/Button';
import { useUserStore } from '../stores/useUserStore';

interface PickupEditViewProps {
    onBack: () => void;
    onSaved: () => void;
}

export const PickupEditView: React.FC<PickupEditViewProps> = ({
    onBack,
    onSaved
}) => {
    const { pickupContact, updatePickupContact } = useUserStore();
    const [name, setName] = useState(pickupContact.name);
    const [phone, setPhone] = useState(pickupContact.phone);

    const handleSave = () => {
        if (!name || !phone) {
            alert('请填写完整信息');
            return;
        }
        updatePickupContact(name, phone);
        onSaved();
    };

    return (
        <div className="absolute inset-0 bg-[#f3f4f6] z-[120] flex flex-col animate-slide-in">
            <WeChatHeader title="自提信息" onBack={onBack} />
            <div className="p-4 space-y-4">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <label className="w-20 text-sm font-medium text-gray-900">取餐人</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="请输入取餐人姓名"
                            className="flex-1 outline-none text-sm"
                        />
                    </div>
                    <div className="flex items-center p-4">
                        <label className="w-20 text-sm font-medium text-gray-900">手机号</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="请输入取餐人手机号"
                            className="flex-1 outline-none text-sm"
                        />
                    </div>
                </div>
                <div className="text-xs text-gray-500 px-2">该信息仅用于自提订单联系使用</div>
                <Button fullWidth onClick={handleSave} className="mt-4 py-3 rounded-xl shadow-lg shadow-blue-100">保存</Button>
            </div>
        </div>
    );
};
