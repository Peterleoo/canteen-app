import React from 'react';
import { MapPin, ShoppingBag, Headphones, Store, ChevronRight, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
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
                {/* Premium Background Header */}
                <div className="relative h-48 bg-gradient-to-br from-[#0052D9] to-[#2E7DFF] overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center gap-5">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 rounded-2xl bg-white p-1 shadow-2xl relative z-10"
                        >
                            <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden">
                                {user ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-full h-full p-5 text-gray-300" />
                                )}
                            </div>
                            {user && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-yellow-900">V</span>
                                </div>
                            )}
                        </motion.div>

                        <div className="flex-1 py-1">
                            {user ? (
                                <>
                                    <motion.h2
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="font-bold text-2xl text-white tracking-tight"
                                    >
                                        {user.name}
                                    </motion.h2>
                                    <motion.div
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="inline-flex items-center px-2 py-0.5 mt-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20"
                                    >
                                        <span className="text-[11px] text-white/90 font-medium">{user.phone}</span>
                                    </motion.div>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="px-6 py-2 bg-white text-blue-600 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all"
                                >
                                    立即登录
                                </button>
                            )}
                        </div>
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
