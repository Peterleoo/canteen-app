import React from 'react';
import { MapPin, ShoppingBag, Headphones, Store, ChevronRight, User as UserIcon } from 'lucide-react';
// removed unused import
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { Button } from '../components/Button';
import { useUserStore } from '../stores/useUserStore';
import { useCartStore } from '../stores/useCartStore';

interface ProfileViewProps {
    onNavigate: (view: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
    onNavigate
}) => {
    const { user, pickupContact, logout, setShowLoginModal } = useUserStore();

    const { clearCart } = useCartStore();

    const handleLogout = () => {
        logout();
        clearCart();
        // Force clear local storage to be absolutely sure
        localStorage.removeItem('canteen-user-storage');
        localStorage.removeItem('canteen-cart-storage');

        setTimeout(() => {
            window.location.href = '/'; // Use href to force full reload to root
        }, 50);
    };

    return (
        <div className="flex flex-col h-full bg-[#f7f8fa] flex-1 min-h-0">
            <WeChatHeader title="个人中心" />
            <div className="flex-1 overflow-y-auto pb-20 smooth-scroll">
                <div className="bg-white p-6 mb-2 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                        {user ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-4 text-gray-400" />}
                    </div>
                    <div className="flex-1">
                        {user ? (
                            <>
                                <h2 className="font-bold text-xl text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500 mt-1">{user.phone}</p>
                            </>
                        ) : (
                            <button onClick={() => setShowLoginModal(true)} className="font-bold text-lg text-blue-600">点击登录</button>
                        )}
                    </div>
                </div>

                <div className="bg-white mt-4">
                    {[
                        { icon: MapPin, label: '收货地址', action: () => onNavigate('ADDRESS_LIST') },
                        { icon: ShoppingBag, label: '自提信息', action: () => onNavigate('PICKUP_EDIT') },
                        { icon: Headphones, label: '联系客服', action: () => { } },
                        { icon: Store, label: '关于我们', action: () => { } }
                    ].map((item, idx) => (
                        <div key={idx} onClick={item.action} className="flex items-center p-4 active:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                            <item.icon size={20} className="text-gray-600 mr-3" />
                            <span className="flex-1 text-sm font-medium text-gray-900">{item.label}</span>
                            {item.label === '自提信息' && pickupContact.name && (
                                <span className="text-xs text-gray-400 mr-2">{pickupContact.name} {pickupContact.phone}</span>
                            )}
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                    ))}
                </div>

                {user && (
                    <div className="mt-6 px-4">
                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={handleLogout}
                            className="bg-white text-red-500 hover:bg-gray-50 border-none shadow-none py-3"
                        >
                            退出登录
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
