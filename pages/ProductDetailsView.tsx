import React from 'react';
import { ShoppingCart, ChevronLeft, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { formatSales } from '../utils/format';
import { useCartStore } from '../stores/useCartStore';
import { motion } from 'framer-motion';

interface ProductDetailsViewProps {
    product: Product;
    onClose: () => void;
    onOpenCart: () => void;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({
    product,
    onClose,
    onOpenCart,
}) => {
    const { addToCart, updateQuantity, getCartQuantity, getCartCount } = useCartStore();
    const qty = getCartQuantity(product.id);
    const cartCount = getCartCount();

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
        >
            <div className="relative h-72 w-full bg-gray-200">
                <img src={product.image} className="w-full h-full object-cover" />
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-black/60 z-20"
                    style={{ marginTop: 'env(safe-area-inset-top)' }}
                >
                    <ChevronLeft size={24} />
                </button>

                <div
                    className="absolute top-4 right-4 z-20"
                    style={{ marginTop: 'env(safe-area-inset-top)' }}
                >
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onOpenCart}
                        className="w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white active:bg-black/60 relative"
                    >
                        <ShoppingCart size={18} />
                        {cartCount > 0 &&
                            <motion.span
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white"
                            >
                                {cartCount}
                            </motion.span>
                        }
                    </motion.button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-safe">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

                <div className="flex justify-between items-end mb-6">
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-red-500 font-mono">¥{product.price}</span>
                        <span className="text-sm text-gray-400 mb-1">月售 {formatSales(product.sales)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {qty > 0 ? (
                            <>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1) }} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-100"><Minus size={18} /></motion.button>
                                <span className="text-lg font-bold min-w-[20px] text-center">{qty}</span>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1) }} className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white active:scale-95 shadow-sm"><Plus size={18} /></motion.button>
                            </>
                        ) : (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                                className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold shadow-md shadow-blue-200 active:scale-95 transition-transform text-sm flex items-center gap-1"
                            >
                                <Plus size={16} /> 加入购物车
                            </motion.button>
                        )}
                    </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

                {product.comboItems && product.comboItems.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-bold text-sm mb-3">套餐内容</h3>
                        <div className="space-y-2">
                            {product.comboItems.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-900">{item.name}</span>
                                        <span className="text-xs text-gray-500">{item.quantity}</span>
                                    </div>
                                    <div className="text-red-500 font-bold text-sm font-mono">¥{item.price.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-sm mb-3">商品详情</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>商品详情内容示例，可根据需要添加图文介绍。</p>
                        <p>这里可以展示商品的详细信息，包括：</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>商品的原料和制作工艺</li>
                            <li>商品的特色和优势</li>
                            <li>商品的食用方法和注意事项</li>
                            <li>其他相关信息</li>
                        </ul>
                        <div className="h-32 bg-gray-200 rounded-lg mt-3 flex items-center justify-center text-gray-400">
                            商品图片示例
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-sm mb-3">营养成分 (参考)</h3>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                            { label: '热量', val: '450kcal' },
                            { label: '蛋白质', val: '22g' },
                            { label: '碳水', val: '45g' },
                            { label: '脂肪', val: '18g' },
                        ].map(n => (
                            <div key={n.label}>
                                <div className="text-xs text-gray-500 mb-1">{n.label}</div>
                                <div className="text-sm font-bold text-gray-800">{n.val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-sm">商品评价 (12)</h3>
                    {[1, 2].map(i => (
                        <div key={i} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-gray-700">用户88**</span>
                                    <span className="text-[10px] text-gray-400">2023-10-24</span>
                                </div>
                                <p className="text-xs text-gray-600">味道很不错，分量也足，推荐！</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
