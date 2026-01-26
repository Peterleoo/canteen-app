import React, { useState, useEffect } from 'react';
import { Ticket, ChevronLeft, Calendar, Info } from 'lucide-react';
import { UserCoupon } from '../types';
import { marketingService } from '../services/marketingService';
import { useUserStore } from '../stores/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';

interface UserCouponsViewProps {
    onBack: () => void;
}

type TabType = 'UNUSED' | 'USED' | 'EXPIRED';

export const UserCouponsView: React.FC<UserCouponsViewProps> = ({ onBack }) => {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState<TabType>('UNUSED');
    const [coupons, setCoupons] = useState<UserCoupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadCoupons = async () => {
            setIsLoading(true);
            try {
                const list = await marketingService.getUserCoupons(user.id, activeTab);
                setCoupons(list);
            } catch (err) {
                console.error("Failed to load user coupons", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadCoupons();
    }, [user, activeTab]);

    const tabs: { type: TabType; label: string }[] = [
        { type: 'UNUSED', label: '未使用' },
        { type: 'USED', label: '已使用' },
        { type: 'EXPIRED', label: '已过期' }
    ];

    return (
        <div className="flex flex-col h-full bg-[#F7F8FA]">
            {/* Header */}
            <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm shrink-0">
                <button onClick={onBack} className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center font-bold text-lg mr-8">我的优惠券</h1>
            </div>

            {/* Tabs */}
            <div className="bg-white flex px-4 border-b border-gray-50 shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.type}
                        onClick={() => setActiveTab(tab.type)}
                        className={`flex-1 py-4 text-sm font-medium relative transition-colors ${activeTab === tab.type ? 'text-[#0052D9]' : 'text-gray-500'}`}
                    >
                        {tab.label}
                        {activeTab === tab.type && (
                            <motion.div
                                layoutId="couponTab"
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#0052D9] rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence mode='wait'>
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-8 h-8 border-2 border-[#0052D9] border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                    ) : coupons.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 opacity-40"
                        >
                            <Ticket size={64} strokeWidth={1} />
                            <p className="mt-4 text-sm">暂无优惠券</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {coupons.map(uc => {
                                const cp = uc.coupon;
                                if (!cp) return null;
                                return (
                                    <div
                                        key={uc.id}
                                        className={`bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col ${activeTab !== 'UNUSED' ? 'grayscale opacity-70' : ''}`}
                                    >
                                        <div className="p-4 flex gap-4">
                                            {/* Value Area */}
                                            <div className="w-24 flex flex-col items-center justify-center border-r border-dashed border-gray-100 pr-4">
                                                <div className="text-red-500 font-bold font-mono">
                                                    {cp.type === 'PERCENT' ? (
                                                        <>
                                                            <span className="text-3xl">{Number(cp.value) >= 1 ? (Number(cp.value) > 10 ? Number(cp.value) / 10 : Number(cp.value)) : Number(cp.value) * 10}</span>
                                                            <span className="text-xs ml-0.5">折</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-xs">¥</span>
                                                            <span className="text-3xl">{cp.value}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {cp.min_spend > 0 ? `满¥${cp.min_spend}可用` : '无门槛'}
                                                </div>
                                            </div>

                                            {/* Info Area */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="bg-red-50 text-red-500 text-[10px] px-1.5 py-0.5 rounded font-bold border border-red-100">
                                                            {cp.type === 'FIXED' ? '代金券' : '折扣券'}
                                                        </span>
                                                        <h3 className="font-bold text-gray-900 text-sm">{cp.name}</h3>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 line-clamp-1">{cp.description || '全场通用'}</p>
                                                </div>
                                                <div className="flex items-center text-[10px] text-gray-400 gap-1 mt-3">
                                                    <Calendar size={10} />
                                                    有效期至: {new Date(uc.expires_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Status decoration */}
                                        <div className="h-1 bg-gradient-to-r from-red-500/20 to-transparent" />
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-2 py-6 opacity-20">
                    <Info size={12} />
                    <span className="text-[10px]">优惠券不可与其他活动叠加使用</span>
                </div>
            </div>
        </div>
    );
};
