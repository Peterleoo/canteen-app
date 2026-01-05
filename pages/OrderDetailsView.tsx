import React from 'react';
import { Clock } from 'lucide-react';
import { Order } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';

interface OrderDetailsViewProps {
    order: Order;
    onBack: () => void;
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order, onBack }) => {
    if (!order) return null;

    // 计算预计时间：下单时间延后2-3小时
    const calculateEstimatedTime = () => {
        // 解析下单时间
        const orderDate = new Date(order.date.replace(/\//g, '-'));
        // 生成2-3小时的随机延迟（毫秒）
        const delayHours = 2 + Math.random(); // 2-3小时
        const delayMs = delayHours * 60 * 60 * 1000;
        // 计算预计时间
        const estimatedDate = new Date(orderDate.getTime() + delayMs);
        // 格式化时间
        return estimatedDate.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const estimatedTime = calculateEstimatedTime();

    return (
        <div className="fixed inset-0 z-[100] bg-[#f3f4f6] flex flex-col animate-slide-in-right">
            <WeChatHeader title="订单详情" onBack={onBack} />

            <div className="flex-1 overflow-y-auto p-4 pb-safe">
                {/* Status Header */}
                <div className="bg-white p-6 rounded-xl mb-4 text-center shadow-sm">
                    <div className="text-xl font-bold text-gray-900 mb-1">{order.status}</div>
                    <div className="text-xs text-gray-500">感谢您使用 </div>

                    {/* Estimated Time */}
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-blue-600" />
                        <span>
                            {order.deliveryMethod === 'DELIVERY' ?
                                `预计配送时间：${estimatedTime}` :
                                `预计取餐时间：${estimatedTime}`
                            }
                        </span>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <button className="px-4 py-2 border border-gray-200 rounded-full text-xs font-medium text-gray-600">申请售后</button>
                        <button className="px-4 py-2 border border-blue-600 rounded-full text-xs font-medium text-blue-600">再来一单</button>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
                    <div className="p-4 border-b border-gray-50 font-bold text-sm">商品信息</div>
                    <div className="p-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center mb-4 last:mb-0">
                                <div className="flex items-center gap-3">
                                    <img src={item.image} className="w-12 h-12 rounded bg-gray-100 object-cover" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">{item.name}</div>
                                        <div className="text-xs text-gray-400">x{item.quantity}</div>
                                    </div>
                                </div>
                                <div className="font-bold font-mono text-sm">¥{(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        ))}

                        <div className="border-t border-dashed border-gray-100 my-4"></div>

                        <div className="space-y-2 text-xs text-gray-500">
                            <div className="flex justify-between">
                                <span>打包费</span>
                                <span>¥0.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>配送费</span>
                                <span>¥{order.deliveryFee}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-2">
                                <span>实付</span>
                                <span className="font-mono text-lg">¥{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">订单编号</span>
                        <span className="text-gray-900">{order.id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">下单时间</span>
                        <span className="text-gray-900">{order.date}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">支付方式</span>
                        <span className="text-gray-900">微信支付</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">配送方式</span>
                        <span className="text-gray-900">{order.deliveryMethod === 'DELIVERY' ? '外卖配送' : '到店自提'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{order.deliveryMethod === 'DELIVERY' ? '收货地址' : '自提地点'}</span>
                        <span className="text-gray-900 max-w-[60%] text-right truncate">{order.locationInfo}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
