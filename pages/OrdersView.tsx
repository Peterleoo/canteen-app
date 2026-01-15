import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { History, ChevronRight, Loader2 } from 'lucide-react';
import { Order, OrderStatusText } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { useUserStore } from '../stores/useUserStore';

import { getOrders } from '../services/orderService';

interface OrdersViewProps {
    onOrderClick: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOrderClick }) => {
    const { user } = useUserStore();
    const location = useLocation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 获取订单列表
    const fetchOrders = async () => {
        if (!user?.id) {
            setOrders([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await getOrders({
                userId: user.id
            });
            setOrders(result.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('获取订单失败，请稍后重试');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 组件挂载或路径切换时获取订单
    useEffect(() => {
        // 只要路径切换到“订单”页面且用户已登录，就刷新数据
        if (location.pathname === '/orders' && user?.id) {
            fetchOrders();
        }

        // 每30秒自动刷新一次订单列表，确保状态更新
        const interval = setInterval(() => {
            if (location.pathname === '/orders' && user?.id) {
                fetchOrders();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user?.id, location.pathname]);

    return (
        <div className="flex flex-col h-full bg-[#f7f8fa] flex-1 min-h-0">
            <WeChatHeader title="订单列表" />

            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3 smooth-scroll">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                        <Loader2 size={48} className="mb-4 opacity-20 animate-spin" />
                        <p className="text-sm">加载中...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                        <History size={48} className="mb-4 opacity-20" />
                        <p className="text-sm text-red-500 mb-2">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full"
                        >
                            重试
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                        <History size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">暂无订单</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => onOrderClick(order)}
                            className="bg-white p-4 rounded-xl shadow-sm active:scale-[0.99] transition-transform"
                        >
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm">{order.deliveryMethod === 'DELIVERY' ? '外卖' : '自提'}</span>
                                    <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{order.addressDetail}</span>
                                    <ChevronRight size={14} className="text-gray-400" />
                                </div>
                                <span className="text-xs text-gray-500">{OrderStatusText[order.status]}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {order.orderItems?.slice(0, 3).map((item) => (
                                        <img key={item.id} src={item.image || ''} alt={item.productName} className="w-12 h-12 rounded bg-gray-100 object-cover" />
                                    ))}
                                    {order.orderItems?.length && order.orderItems.length > 3 && <div className="text-xs text-gray-400 bg-gray-50 h-12 px-2 flex items-center justify-center rounded">+{order.orderItems.length - 3}</div>}
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 text-base font-mono">¥{order.total.toFixed(2)}</div>
                                    <div className="text-[10px] text-gray-400">共{order.orderItems?.reduce((a, b) => a + b.quantity, 0)}件</div>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end gap-2">
                                <button onClick={(e) => { e.stopPropagation(); }} className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-full text-xs font-medium">再来一单</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};