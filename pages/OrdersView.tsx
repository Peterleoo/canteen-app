import React from 'react';
import { History, ChevronRight } from 'lucide-react';
import { Order } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { useOrderStore } from '../stores/useOrderStore';

interface OrdersViewProps {
    onOrderClick: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOrderClick }) => {
    const { orders } = useOrderStore();

    return (
        <div className="flex flex-col h-full bg-[#f7f8fa] flex-1 min-h-0">
            <WeChatHeader title="订单列表" />
            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3 smooth-scroll">
                {orders.length === 0 ? (
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
                                    <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{order.locationInfo}</span>
                                    <ChevronRight size={14} className="text-gray-400" />
                                </div>
                                <span className="text-xs text-gray-500">{order.status}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {order.items.slice(0, 3).map(item => (
                                        <img key={item.id} src={item.image} className="w-12 h-12 rounded bg-gray-100 object-cover border border-gray-100" />
                                    ))}
                                    {order.items.length > 3 && <div className="text-xs text-gray-400 bg-gray-50 h-12 px-2 flex items-center justify-center rounded">+{order.items.length - 3}</div>}
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 text-base font-mono">¥{order.total.toFixed(2)}</div>
                                    <div className="text-[10px] text-gray-400">共{order.items.reduce((a, b) => a + b.quantity, 0)}件</div>
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
