import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Gift, Clock, CheckCircle2 } from 'lucide-react';
import { marketingService } from '../services/marketingService';
import { Coupon, Canteen } from '../types';
import { useUserStore } from '../stores/useUserStore';
import { Skeleton } from '../components/common/Skeleton';
import { AlertPopup } from '../components/common/AlertPopup';

interface CouponHubViewProps {
    canteen: Canteen;
    onBack: () => void;
}

export const CouponHubView: React.FC<CouponHubViewProps> = ({ canteen, onBack }) => {
    const { user } = useUserStore();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [userCouponIds, setUserCouponIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [receivingId, setReceivingId] = useState<string | null>(null);

    const [alert, setAlert] = useState({ visible: false, title: '', message: '' });

    useEffect(() => {
        loadData();
    }, [canteen.id, user?.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [availableCoupons, ownedCoupons] = await Promise.all([
                marketingService.getAvailableCoupons(canteen.id),
                user ? marketingService.getUserCoupons(user.id, 'UNUSED') : Promise.resolve([])
            ]);
            setCoupons(availableCoupons);
            setUserCouponIds(new Set(ownedCoupons.map(uc => uc.coupon_id)));
        } catch (error) {
            console.error('Failed to load coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async (couponId: string) => {
        if (!user) return;
        setReceivingId(couponId);
        try {
            await marketingService.receiveCoupon(user.id, couponId);
            setUserCouponIds(prev => new Set([...Array.from(prev), couponId]));
            setAlert({
                visible: true,
                title: '领取成功',
                message: '优惠券已存入您的账户，下单时可直接抵扣。'
            });
        } catch (error: any) {
            setAlert({
                visible: true,
                title: '领取失败',
                message: error.message || '系统繁忙，请稍后再试'
            });
        } finally {
            setReceivingId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8F9FB]">
            <div className="bg-white px-4 py-3 flex items-center gap-4 shadow-sm shrink-0">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100 transition-colors">
                    <ChevronLeft size={24} className="text-gray-900" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">领券中心</h1>
                    <p className="text-[11px] text-gray-400">{canteen.name}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="w-full h-32 rounded-2xl" />)
                ) : coupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Gift size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">暂无可领取的优惠券</p>
                    </div>
                ) : (
                    coupons.map((coupon, index) => (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            key={coupon.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm flex relative border border-gray-100"
                        >
                            {/* Left Section: Value */}
                            <div className="w-28 bg-gradient-to-br from-[#0052D9] to-[#003CAB] flex flex-col items-center justify-center text-white p-3 shrink-0">
                                <div className="flex items-baseline font-bold font-mono">
                                    {coupon.type === 'PERCENT' ? (
                                        <>
                                            <span className="text-2xl">{coupon.value * 10}</span>
                                            <span className="text-xs ml-0.5">折</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs mr-0.5">¥</span>
                                            <span className="text-2xl">{coupon.value}</span>
                                        </>
                                    )}
                                </div>
                                <div className="text-[10px] opacity-80 mt-1 whitespace-nowrap">
                                    {coupon.min_spend > 0 ? `满¥${coupon.min_spend}可用` : '无门槛'}
                                </div>
                            </div>

                            {/* Right Section: Info */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-[15px] mb-1">{coupon.name}</h3>
                                    <p className="text-[11px] text-gray-500 line-clamp-1">{coupon.description || '全场通用'}</p>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <Clock size={10} />
                                        <span>有效期至 {new Date(coupon.end_at).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        disabled={receivingId === coupon.id || userCouponIds.has(coupon.id)}
                                        onClick={() => handleReceive(coupon.id)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${userCouponIds.has(coupon.id)
                                            ? 'bg-gray-100 text-gray-400'
                                            : receivingId === coupon.id
                                                ? 'bg-blue-100 text-[#0052D9]'
                                                : 'bg-[#0052D9] text-white active:scale-95 shadow-lg shadow-blue-100'
                                            }`}
                                    >
                                        {userCouponIds.has(coupon.id) ? (
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 size={12} /> 已领取
                                            </span>
                                        ) : receivingId === coupon.id ? (
                                            '领取中...'
                                        ) : (
                                            '立即领取'
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Circle */}
                            <div className="absolute top-1/2 left-28 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FB] rounded-full border-r border-gray-100" />
                        </motion.div>
                    ))
                )}
            </div>

            <AlertPopup
                visible={alert.visible}
                onClose={() => setAlert({ ...alert, visible: false })}
                title={alert.title}
                message={alert.message}
            />
        </div>
    );
};
