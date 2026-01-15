import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { Address } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { Button } from '../components/Button';
import { useAddressStore } from '../stores/useAddressStore';
import { useUserStore } from '../stores/useUserStore';
import { getUserLocation, getAddressFromCoords, AddressInfo } from '../utils/location';
import { useNavigate, useLocation } from 'react-router-dom';

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
    const { user } = useUserStore();
    const { addAddress, updateAddress, deleteAddress, isLoading } = useAddressStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [currentAddress, setCurrentAddress] = useState<Partial<Address>>(initialAddress);
    const [currentLocation, setCurrentLocation] = useState<AddressInfo | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocationUsed, setIsLocationUsed] = useState<boolean>(false);

    // 检查是否从地图页面返回并带有选中地址
    useEffect(() => {
        if (location.state?.selectedAddress) {
            const selectedAddress = location.state.selectedAddress as AddressInfo;
            // 填充地址信息
            updateAddr('area', selectedAddress.fullAddress);
            updateAddr('latitude', selectedAddress.coordinates.latitude);
            updateAddr('longitude', selectedAddress.coordinates.longitude);
            // 清除location state，避免重复处理
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const updateAddr = (field: keyof Address, value: any) => {
        setCurrentAddress(prev => ({ ...prev, [field]: value }));
    };

    // 获取当前定位地址
    const fetchCurrentLocation = async () => {
        setIsGettingLocation(true);
        setLocationError(null);
        try {
            // 获取当前坐标
            const coords = await getUserLocation();
            // 通过坐标获取地址信息
            const addressInfo = await getAddressFromCoords(coords);
            setCurrentLocation(addressInfo);
            setIsLocationUsed(false);
        } catch (error: any) {
            setLocationError(error.message || '获取定位失败，请检查权限设置');
            setCurrentLocation(null);
        } finally {
            setIsGettingLocation(false);
        }
    };

    // 使用当前定位地址填充表单
    const useCurrentLocation = () => {
        if (currentLocation) {
            // 填充地址信息
            updateAddr('area', currentLocation.fullAddress);
            updateAddr('latitude', currentLocation.coordinates.latitude);
            updateAddr('longitude', currentLocation.coordinates.longitude);
            setIsLocationUsed(true);
        }
    };

    const handleSave = async () => {
        if (!user?.id) {
            alert("请先登录");
            return;
        }

        if (!currentAddress.contactName || !currentAddress.phone || !currentAddress.area || !currentAddress.detail) {
            alert("请填写完整信息");
            return;
        }

        const newAddr = {
            ...currentAddress,
            id: currentAddress.id || Date.now().toString(),
            isDefault: currentAddress.isDefault || false,
            tag: currentAddress.tag || '其他',
            userId: user.id
        } as Address;

        try {
            if (currentAddress.id) {
                await updateAddress(newAddr);
            } else {
                await addAddress(newAddr);
            }
            onSaved();
        } catch (error) {
            console.error('保存地址失败:', error);
            alert('保存地址失败，请重试');
        }
    };

    const handleDelete = async () => {
        if (currentAddress.id) {
            if (window.confirm('确定要删除该地址吗？')) {
                try {
                    await deleteAddress(currentAddress.id);
                    onSaved();
                } catch (error) {
                    console.error('删除地址失败:', error);
                    alert('删除地址失败，请重试');
                }
            }
        }
    };

    return (
        <div className="flex-1 bg-[#f3f4f6] flex flex-col">
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
                        <div
                            onClick={() => navigate('/address/map')}
                            className="flex-1 outline-none text-sm cursor-pointer border-b border-gray-200 py-1"
                        >
                            <div className="flex justify-between items-center">
                                <span className={currentAddress.area ? 'text-gray-900' : 'text-gray-400'}>
                                    {currentAddress.area || '点击选择地址'}
                                </span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                    {/* 当前定位地址获取组件 */}
                    <div className="px-4 pb-3">
                        <button
                            onClick={fetchCurrentLocation}
                            disabled={isGettingLocation}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 py-2"
                        >
                            <MapPin size={16} className={isGettingLocation ? 'animate-pulse' : ''} />
                            {isGettingLocation ? '获取中...' : '获取当前位置'}
                        </button>

                        {/* 定位结果显示 */}
                        {currentLocation && (
                            <div className="mt-2 bg-blue-50 rounded-lg p-3 flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-1 text-sm text-blue-800 mb-1">
                                        <MapPin size={14} />
                                        <span className="font-medium">当前位置</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-1">{currentLocation.fullAddress}</p>
                                    <div className="flex gap-1">
                                        <span className="text-xs text-gray-500">{currentLocation.province}</span>
                                        <span className="text-xs text-gray-500">{currentLocation.city}</span>
                                        <span className="text-xs text-gray-500">{currentLocation.district}</span>
                                        <span className="text-xs text-gray-500">{currentLocation.street}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={useCurrentLocation}
                                    disabled={isLocationUsed}
                                    className={`ml-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${isLocationUsed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                >
                                    {isLocationUsed ? (
                                        <><Check size={12} className="inline mr-1" />已使用</>
                                    ) : (
                                        '使用'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* 定位错误信息 */}
                        {locationError && (
                            <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>{locationError}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center p-4 border-t border-gray-50">
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
                <Button fullWidth onClick={handleSave} disabled={isLoading} className="mt-4 py-3 rounded-xl shadow-lg shadow-blue-100">
                    {isLoading ? '保存中...' : '保存'}
                </Button>
                {currentAddress.id && (
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="mt-2 border-none text-red-500 bg-white shadow-sm"
                    >
                        {isLoading ? '删除中...' : '删除地址'}
                    </Button>
                )}
            </div>
        </div>
    );
};
