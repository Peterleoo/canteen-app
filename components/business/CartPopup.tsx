import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { motion } from 'framer-motion';

interface CartPopupProps {
    onClose: () => void;
}

export const CartPopup: React.FC<CartPopupProps> = ({ onClose }) => {
    const { cart, clearCart, updateQuantity } = useCartStore();

    return (
        <div className="fixed inset-0 z-[150] flex flex-col justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full relative z-[111] rounded-t-2xl overflow-hidden flex flex-col max-h-[70vh]"
            >
                <div className="p-3 bg-gray-50 flex justify-between items-center text-xs text-gray-500 border-b border-gray-100">
                    <span>已选商品</span>
                    <button
                        onClick={() => {
                            clearCart();
                            onClose();
                        }}
                        className="flex items-center gap-1 hover:text-red-500 active:opacity-60 py-2 px-2"
                    >
                        <Trash2 size={14} /> 清空
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-5 pb-[100px]">
                    {cart.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">购物车是空的</div>
                    ) : (
                        cart.map(item => (
                            <motion.div
                                layout
                                key={item.id}
                                className="flex justify-between items-center"
                            >
                                <div className="flex gap-3 items-center overflow-hidden">
                                    <img src={item.image} className="w-12 h-12 rounded object-cover bg-gray-100" />
                                    <div className="min-w-0">
                                        <div className="font-bold text-gray-900 text-sm truncate">{item.name}</div>
                                        <div className="text-red-500 font-bold font-mono text-sm mt-1">¥{item.price}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-100"><Minus size={16} /></button>
                                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center active:bg-blue-700 shadow-sm"><Plus size={16} /></button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};
