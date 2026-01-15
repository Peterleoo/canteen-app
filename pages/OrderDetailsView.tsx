import React, { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, OrderStatusText } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { getOrderById } from '../services/orderService';

interface OrderDetailsViewProps {
    order?: Order;
    onBack: () => void;
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ order: initialOrder, onBack }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(initialOrder || null);
    const [isLoading, setIsLoading] = useState(!initialOrder);
    const [error, setError] = useState<string | null>(null);
    
    // 获取订单详情
    const fetchOrder = async () => {
        if (!id) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const result = await getOrderById(id);
            if (result.code === 200 && result.data) {
                setOrder(result.data);
            } else {
                setError(result.message || '获取订单详情失败');
            }
        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError('获取订单详情失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (id && !initialOrder) {
            fetchOrder();
        }
        
        // 每15秒自动刷新一次订单详情，确保状态更新
        const interval = setInterval(() => {
            fetchOrder();
        }, 15000);
        
        return () => clearInterval(interval);
    }, [id, initialOrder]);
    
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#f3f4f6] flex flex-col">
                <WeChatHeader title="订单详情" onBack={onBack} />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 size={48} className="animate-spin text-gray-400" />
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#f3f4f6] flex flex-col">
                <WeChatHeader title="订单详情" onBack={onBack} />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-red-500 mb-4">{error}</div>
                    <button 
                        onClick={() => navigate('/orders')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full"
                    >
                        返回订单列表
                    </button>
                </div>
            </div>
        );
    }
    
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
                        <div className="text-xl font-bold text-gray-900 mb-1">{OrderStatusText[order.status]}</div>
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
                        {order.orderItems?.map(item => (
                        <div key={item.id} className="flex justify-between items-center mb-4 last:mb-0">
                            <div className="flex items-center gap-3">
                                <img src={item.image || ''} alt={item.productName} className="w-12 h-12 rounded bg-gray-100 object-cover" />
                                <div>
                                    <div className="text-sm font-bold text-gray-800">{item.productName}</div>
                                    <div className="text-xs text-gray-400">x{item.quantity}</div>
                                </div>
                            </div>
                            <div className="font-bold font-mono text-sm">¥{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    )) || <div className="text-center text-gray-500 py-4">暂无商品信息</div>}

                        <div className="border-t border-dashed border-gray-100 my-4"></div>

                        <div className="space-y-2 text-xs text-gray-500">
                            <div className="flex justify-between">
                                <span>打包费</span>
                                <span>¥{order.packagingFee?.toFixed(2) || '0.00'}</span>
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
                        <span className="text-gray-900 max-w-[60%] text-right truncate">{order.addressDetail}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
