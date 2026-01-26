import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, MessageSquare, Ticket, X } from 'lucide-react';
import { Canteen, DeliveryMethod, UserCoupon } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { Button } from '../components/Button';
import { useCartStore } from '../stores/useCartStore';
import { useAddressStore } from '../stores/useAddressStore';
import { useUserStore } from '../stores/useUserStore';
import { marketingService } from '../services/marketingService';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutViewProps {
    onBack: () => void;
    deliveryMethod: DeliveryMethod;
    setDeliveryMethod: (method: DeliveryMethod) => void;
    selectedCanteen: Canteen;
    onShowAddressList: () => void;
    onPlaceOrder: (couponId?: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
    onBack,
    deliveryMethod,
    setDeliveryMethod,
    selectedCanteen,
    onShowAddressList,
    onPlaceOrder
}) => {
    const { cart, getCartTotal } = useCartStore();
    const { getDefaultAddress, addresses } = useAddressStore();
    const { user } = useUserStore();
    const defaultAddress = getDefaultAddress();
    const hasAddress = addresses.length > 0;

    const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
    const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            marketingService.getUserCoupons(user.id, 'UNUSED')
                .then(list => {
                    // 1. 过滤出当前食堂的优惠券或全站通用的优惠券
                    const filtered = list.filter(uc =>
                        !uc.coupon?.canteen_id || String(uc.coupon?.canteen_id) === String(selectedCanteen.id)
                    );
                    setUserCoupons(filtered);

                    // 2. 自动选中折扣金额最高的优惠券
                    if (filtered.length > 0) {
                        const subtotal = getCartTotal();
                        let bestCoupon = null;
                        let maxDiscount = 0;

                        filtered.forEach(uc => {
                            const cp = uc.coupon;
                            if (!cp || subtotal < (cp.min_spend || 0)) return;

                            let currentDiscount = 0;
                            if (cp.type === 'FIXED') {
                                currentDiscount = Number(cp.value);
                            } else if (cp.type === 'PERCENT') {
                                // 使用统一的折扣解析逻辑
                                const val = Number(cp.value);
                                const rate = val >= 1 ? (val > 10 ? val / 100 : val / 10) : val;
                                currentDiscount = subtotal * (1 - rate);
                            }

                            if (currentDiscount > maxDiscount) {
                                maxDiscount = currentDiscount;
                                bestCoupon = uc;
                            }
                        });

                        if (bestCoupon) {
                            setSelectedCoupon(bestCoupon);
                        }
                    }
                })
                .catch(err => console.error("Failed to fetch coupons", err));
        }
    }, [user, selectedCanteen.id, getCartTotal]);

    const subtotal = getCartTotal();

    // 计算折扣
    let discount = 0;
    if (selectedCoupon && selectedCoupon.coupon) {
        const cp = selectedCoupon.coupon;
        if (subtotal >= (cp.min_spend || 0)) {
            if (cp.type === 'FIXED') {
                discount = cp.value;
            } else if (cp.type === 'PERCENT') {
                // 增强容错：80或8或0.8 均识别为 8折(0.8)
                const rate = cp.value >= 1 ? (cp.value > 10 ? cp.value / 100 : cp.value / 10) : cp.value;
                discount = Number((subtotal * (1 - rate)).toFixed(2));
            }
        }
    }

    const isFreeDelivery = deliveryMethod === 'DELIVERY' &&
        selectedCanteen.freeDeliveryThreshold !== null &&
        selectedCanteen.freeDeliveryThreshold !== undefined &&
        subtotal >= selectedCanteen.freeDeliveryThreshold;

    const deliveryFee = (deliveryMethod === 'DELIVERY' && !isFreeDelivery) ? selectedCanteen.deliveryFee : 0;
    const packagingFee = cart.length > 0 ? selectedCanteen.defaultPackagingFee : 0;

    const finalTotal = Math.max(0, subtotal + deliveryFee + packagingFee - discount);

    const handlePlaceOrder = () => {
        onPlaceOrder(selectedCoupon?.id);
    };

    // 检查优惠券是否可用
    const isCouponAvailable = (uc: UserCoupon) => {
        if (!uc.coupon) return false;
        return subtotal >= (uc.coupon.min_spend || 0);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#f7f8fa] flex flex-col">
            <WeChatHeader title="确认订单" onBack={onBack} />

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {/* Delivery Toggle */}
                <div className="bg-white p-1 rounded-lg flex mb-4 border border-gray-100">
                    {selectedCanteen.isDeliveryActive && (
                        <button
                            onClick={() => setDeliveryMethod('DELIVERY')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${deliveryMethod === 'DELIVERY' ? 'bg-[#0052D9] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            外卖配送
                        </button>
                    )}
                    <button
                        onClick={() => setDeliveryMethod('PICKUP')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${deliveryMethod === 'PICKUP' ? 'bg-[#0052D9] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'} ${selectedCanteen.isDeliveryActive ? '' : 'w-full'}`}
                    >
                        到店自提
                    </button>
                </div>

                {/* Estimated Time */}
                <div className="bg-blue-50 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-[#0052D9]" />
                    <span className="text-sm text-[#0052D9] font-medium">
                        {deliveryMethod === 'DELIVERY' ? '预计 30-45 分钟送达' : '预计 15-20 分钟可取'}
                    </span>
                </div>

                {/* Address Card */}
                <div
                    className="bg-white rounded-xl p-4 mb-4 shadow-sm"
                    onClick={() => deliveryMethod === 'DELIVERY' && onShowAddressList()}
                >
                    {deliveryMethod === 'DELIVERY' ? (
                        <div className="flex justify-between items-center">
                            {hasAddress ? (
                                <div>
                                    <div className="font-bold text-lg text-gray-900 mb-1">{defaultAddress?.area} {defaultAddress?.detail}</div>
                                    <div className="text-sm text-gray-500">{defaultAddress?.contactName} {defaultAddress?.phone}</div>
                                </div>
                            ) : (
                                <span className="text-orange-500 font-bold">请选择收货地址</span>
                            )}
                            <ChevronRight size={20} className="text-gray-400" />
                        </div>
                    ) : (
                        <div>
                            <div className="text-xs text-gray-400 mb-1">自提地点</div>
                            <div className="font-bold text-lg text-gray-900">{selectedCanteen.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{selectedCanteen.address}</div>
                        </div>
                    )}
                </div>

                {/* Products List */}
                <div className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                        <span className="font-bold text-sm">商品明细</span>
                        <span className="text-xs text-gray-400">共 {cart.reduce((s, i) => s + i.quantity, 0)} 件</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between">
                                <div className="flex gap-3">
                                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-400">x{item.quantity}</div>
                                    </div>
                                </div>
                                <div className="font-bold text-gray-900 font-mono">¥{(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fees & Coupon Selection */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm space-y-4">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>打包费</span>
                        <span className="font-mono text-gray-900">¥{packagingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>配送费</span>
                        <span className="font-mono text-gray-900">¥{deliveryFee.toFixed(2)}</span>
                    </div>

                    {/* Coupon Selector Row */}
                    <div
                        className="flex justify-between items-center pt-2 border-t border-gray-50 cursor-pointer"
                        onClick={() => setIsCouponModalOpen(true)}
                    >
                        <div className="flex items-center gap-2">
                            <Ticket size={16} className="text-red-500" />
                            <span className="text-sm font-bold">优惠券</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {selectedCoupon ? (
                                <span className="text-sm text-red-500 font-bold">-¥{discount.toFixed(2)}</span>
                            ) : (
                                <span className="text-sm text-gray-400">
                                    {userCoupons.length > 0 ? `${userCoupons.length} 张可用` : '无可用优惠券'}
                                </span>
                            )}
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="font-bold text-gray-900">应付合计</span>
                        <div className="text-red-500 flex items-baseline gap-0.5">
                            <span className="text-xs font-bold">¥</span>
                            <span className="text-2xl font-bold font-mono">{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-900">支付方式</span>
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <MessageSquare size={16} fill="currentColor" /> 微信支付
                    </div>
                </div>
            </div>

            {/* Bottom Pay Bar */}
            <div className="bg-white border-t border-gray-100 p-4 pb-safe flex items-center justify-between shadow-lg">
                <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-500">合计</span>
                    <span className="text-xl font-bold text-red-500 font-mono">¥{finalTotal.toFixed(2)}</span>
                </div>
                <Button
                    onClick={handlePlaceOrder}
                    className="bg-[#07c160] hover:bg-[#06ad56] text-white px-10 rounded-full font-bold h-12"
                    disabled={deliveryMethod === 'DELIVERY' && !hasAddress}
                >
                    立即支付
                </Button>
            </div>

            {/* Coupon Modal */}
            <AnimatePresence>
                {isCouponModalOpen && (
                    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setIsCouponModalOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative bg-white rounded-t-[20px] max-h-[70vh] flex flex-col pt-4 overflow-hidden"
                        >
                            <div className="px-4 flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">选择优惠券</h3>
                                <button onClick={() => setIsCouponModalOpen(false)}>
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-4">
                                <div
                                    className={`p-4 border rounded-xl flex justify-between items-center ${!selectedCoupon ? 'border-[#0052D9] bg-blue-50' : 'border-gray-100'}`}
                                    onClick={() => { setSelectedCoupon(null); setIsCouponModalOpen(false); }}
                                >
                                    <span className="font-bold text-sm">不使用优惠券</span>
                                    {!selectedCoupon && <div className="w-5 h-5 rounded-full bg-[#0052D9] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                                </div>

                                {userCoupons.map(uc => {
                                    const available = isCouponAvailable(uc);
                                    return (
                                        <div
                                            key={uc.id}
                                            className={`p-4 border rounded-xl flex items-center gap-4 transition-all ${available ? 'cursor-pointer active:scale-[0.98]' : 'opacity-60 grayscale cursor-not-allowed'} ${selectedCoupon?.id === uc.id ? 'border-[#0052D9] bg-blue-50' : 'border-gray-100'}`}
                                            onClick={() => {
                                                if (available) {
                                                    setSelectedCoupon(uc);
                                                    setIsCouponModalOpen(false);
                                                }
                                            }}
                                        >
                                            <div className="w-20 flex flex-col items-center justify-center border-r border-dashed border-gray-200 pr-4">
                                                <div className="text-red-500 font-bold font-mono">
                                                    {uc.coupon?.type === 'PERCENT' ? (
                                                        <>
                                                            <span className="text-2xl">{Number(uc.coupon.value) >= 1 ? (Number(uc.coupon.value) > 10 ? Number(uc.coupon.value) / 10 : Number(uc.coupon.value)) : Number(uc.coupon.value) * 10}</span>
                                                            <span className="text-xs ml-0.5">折</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-xs">¥</span>
                                                            <span className="text-2xl">{uc.coupon?.value}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-400">满{uc.coupon?.min_spend}可用</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-gray-900">{uc.coupon?.name}</div>
                                                <div className="text-[10px] text-gray-400 mt-1">有效期至: {new Date(uc.expires_at).toLocaleDateString()}</div>
                                                {!available && (
                                                    <div className="text-[10px] text-red-500 mt-1 font-bold">差 ¥{(uc.coupon!.min_spend! - subtotal).toFixed(2)} 可用</div>
                                                )}
                                            </div>
                                            {selectedCoupon?.id === uc.id && (
                                                <div className="w-5 h-5 rounded-full bg-[#0052D9] flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
