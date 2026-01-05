import React from 'react';
import { Clock, ChevronRight, MessageSquare } from 'lucide-react';
import { Canteen, DeliveryMethod } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { Button } from '../components/Button';
import { useCartStore } from '../stores/useCartStore';
import { useAddressStore } from '../stores/useAddressStore';
// removed unused import

interface CheckoutViewProps {
    onBack: () => void;
    deliveryMethod: DeliveryMethod;
    setDeliveryMethod: (method: DeliveryMethod) => void;
    selectedCanteen: Canteen;
    onShowLocation: () => void;
    onShowAddressList: () => void;
    onPlaceOrder: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
    onBack,
    deliveryMethod,
    setDeliveryMethod,
    selectedCanteen,
    onShowLocation,
    onShowAddressList,
    onPlaceOrder
}) => {
    const { cart, getCartTotal } = useCartStore();
    const { getDefaultAddress, addresses } = useAddressStore();
    const defaultAddress = getDefaultAddress();
    const hasAddress = addresses.length > 0;

    const deliveryFee = deliveryMethod === 'DELIVERY' ? 2.5 : 0;
    const finalTotal = getCartTotal() + deliveryFee;

    // 计算预计时间
    const now = new Date();
    const getEstimatedTime = () => {
        if (deliveryMethod === 'DELIVERY') {
            const deliveryTime = new Date(now.getTime() + Math.floor(Math.random() * 15 + 30) * 60 * 1000);
            return `预计${deliveryTime.getHours().toString().padStart(2, '0')}:${deliveryTime.getMinutes().toString().padStart(2, '0')}送达`;
        } else {
            const pickupTime = new Date(now.getTime() + Math.floor(Math.random() * 10 + 15) * 60 * 1000);
            return `预计${pickupTime.getHours().toString().padStart(2, '0')}:${pickupTime.getMinutes().toString().padStart(2, '0')}出餐`;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#f7f8fa] flex flex-col animate-slide-in-right">
            <WeChatHeader title="确认订单" onBack={onBack} />

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {/* Delivery Toggle */}
                <div className="bg-white p-1 rounded-lg flex mb-4 border border-gray-100">
                    <button
                        onClick={() => setDeliveryMethod('DELIVERY')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${deliveryMethod === 'DELIVERY' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        外卖配送
                    </button>
                    <button
                        onClick={() => setDeliveryMethod('PICKUP')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${deliveryMethod === 'PICKUP' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        到店自提
                    </button>
                </div>

                {/* Estimated Time */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-800 font-medium">{getEstimatedTime()}</span>
                </div>

                {/* Location/Address Card */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                        if (deliveryMethod === 'DELIVERY') {
                            onShowAddressList();
                        } else {
                            onShowLocation();
                        }
                    }}
                >
                    {deliveryMethod === 'DELIVERY' ? (
                        hasAddress ? (
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-lg text-gray-900 mb-1">{defaultAddress?.area} {defaultAddress?.detail}</div>
                                    <div className="text-sm text-gray-500">{defaultAddress?.contactName} {defaultAddress?.phone}</div>
                                </div>
                                <ChevronRight size={20} className="text-gray-400" />
                            </div>
                        ) : (
                            <div className="flex justify-between items-center py-2 text-orange-500">
                                <span className="font-bold">请选择收货地址</span>
                                <ChevronRight size={20} />
                            </div>
                        )
                    ) : (
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">自提地点</div>
                                <div className="font-bold text-lg text-gray-900">{selectedCanteen.name}</div>
                                <div className="text-xs text-gray-400 mt-1">{selectedCanteen.address}</div>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Cart Items Summary */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700">商品明细</div>
                    <div className="p-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between mb-4 last:mb-0">
                                <div className="flex gap-3">
                                    <img src={item.image} className="w-12 h-12 rounded bg-gray-100 object-cover" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">{item.name}</div>
                                        <div className="text-xs text-gray-400 mt-1">x {item.quantity}</div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-gray-900">¥{(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        ))}

                        <div className="border-t border-dashed border-gray-100 my-4"></div>

                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">打包费</span>
                            <span className="font-mono">¥0.00</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">配送费</span>
                            <span className="font-mono">¥{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-bold text-gray-900">小计</span>
                            <span className="text-xl font-bold text-red-500 font-mono">¥{finalTotal.toFixed(2)}</span>
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

            {/* Bottom Bar */}
            <div className="bg-white border-t border-gray-100 p-4 pb-safe flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="text-2xl font-bold text-gray-900 font-mono flex items-baseline">
                    <span className="text-xs mr-1">合计</span>
                    <span className="text-sm">¥</span>{finalTotal.toFixed(2)}
                </div>
                <Button
                    onClick={onPlaceOrder}
                    className="bg-[#07c160] hover:bg-[#06ad56] text-white px-8 rounded-full font-bold shadow-lg shadow-green-100"
                    disabled={deliveryMethod === 'DELIVERY' && !hasAddress}
                >
                    立即支付
                </Button>
            </div>
        </div>
    );
};
