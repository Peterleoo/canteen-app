import { ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../stores/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingCartBarProps {
    mode?: 'HOME' | 'DETAILS';
    showCartModal: boolean;
    onToggleCart: () => void;
    selectedProduct: Product | null;
    onCheckout: () => void;
    deliveryFee: number;
    hasBottomNav?: boolean;
    selectedCanteen?: import('../../types').Canteen;
    deliveryMethod?: 'DELIVERY' | 'PICKUP';
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
    mode = 'HOME',
    showCartModal,
    onToggleCart,
    selectedProduct,
    onCheckout,
    deliveryFee: propDeliveryFee,
    hasBottomNav = false,
    selectedCanteen,
    deliveryMethod = 'DELIVERY'
}) => {
    const { cart, addToCart, getCartQuantity, getCartTotal, getCartCount } = useCartStore();

    const cartItemTotal = getCartTotal();
    const cartCount = getCartCount();

    if (cart.length === 0) return null;

    const isExpanded = showCartModal || mode === 'DETAILS';

    // 凑单逻辑计算：仅在配送模式下有效
    const freeDeliveryThreshold = selectedCanteen?.freeDeliveryThreshold || 0;
    const isFreeDelivery = deliveryMethod === 'DELIVERY' && freeDeliveryThreshold > 0 && cartItemTotal >= freeDeliveryThreshold;
    const remainingForFree = freeDeliveryThreshold - cartItemTotal;
    const progressPercent = freeDeliveryThreshold > 0 ? Math.min((cartItemTotal / freeDeliveryThreshold) * 100, 100) : 0;

    // 配送费逻辑优化
    const actualDeliveryFee = (deliveryMethod === 'DELIVERY' && !isFreeDelivery) ? (selectedCanteen?.deliveryFee ?? propDeliveryFee) : 0;

    return (
        <div
            className={`fixed left-0 right-0 z-[200] transition-all duration-500 ${isExpanded
                ? 'bottom-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.08)]'
                : 'px-4 pointer-events-none'
                }`}
            style={!isExpanded ? {
                bottom: hasBottomNav
                    ? 'calc(65px + env(safe-area-inset-bottom))'
                    : '20px'
            } : {}}
        >
            {/* 凑单引导进度条 (仅外卖模式且非展开模式显示) */}
            {!isExpanded && deliveryMethod === 'DELIVERY' && freeDeliveryThreshold > 0 && (
                <div className="max-w-md mx-auto mb-2 pointer-events-auto">
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col gap-1.5"
                    >
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-gray-800">
                                {isFreeDelivery ? '🎉 已享免配送费' : `还差 ¥${remainingForFree.toFixed(1)} 免配送费`}
                            </span>
                            {/* {!isFreeDelivery && <span className="text-[9px] text-blue-500 font-bold">去凑单 &gt;</span>} */}
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                className={`h-full transition-all duration-1000 ${isFreeDelivery ? 'bg-green-500' : 'bg-blue-500'}`}
                            />
                        </div>
                    </motion.div>
                </div>
            )}

            <div
                className={`flex items-center justify-between transition-all duration-300 pointer-events-auto ${isExpanded
                    ? 'px-4 h-[65px] w-full'
                    : 'bg-[#1C1C1E]/95 backdrop-blur-md rounded-full h-14 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.15)] mx-auto w-full max-w-md'
                    }`}
                onClick={onToggleCart}
            >
                <div className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className={`relative transition-transform duration-500 ${isExpanded ? '' : '-mt-5'}`}>
                        <motion.div
                            key={cartCount}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-colors shadow-glow ${isExpanded ? 'bg-[#F2F6FC] text-[#0052D9]' : 'bg-[#0052D9] text-white border-2 border-[#1C1C1E]'
                                }`}
                        >
                            <ShoppingCart size={22} />
                        </motion.div>
                        <AnimatePresence>
                            <motion.span
                                key={cartCount}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute -top-1 -right-1 bg-[#EE0D24] text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full border border-white shadow-sm"
                            >
                                {cartCount}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-col justify-center ml-1">
                        <div className={`font-bold font-mono text-xl transition-colors ${isExpanded ? 'text-gray-900' : 'text-white'}`}>
                            ¥{cartItemTotal.toFixed(2)}
                        </div>
                        <div className={`text-[10px] transition-colors flex items-center gap-1 ${isExpanded ? 'text-gray-500' : 'text-gray-400 font-medium'}`}>
                            {deliveryMethod === 'DELIVERY' ? (
                                isFreeDelivery ? (
                                    <span className="text-green-500">免配送费</span>
                                ) : (
                                    <>预估配送费 ¥{actualDeliveryFee}</>
                                )
                            ) : (
                                <span className="text-gray-400">到店自提</span>
                            )}
                        </div>
                    </div>
                </div>

                {mode === 'DETAILS' && selectedProduct && !showCartModal && getCartQuantity(selectedProduct.id) === 0 ? (
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); addToCart(selectedProduct) }}
                            className="bg-[#0052D9] text-white px-6 py-2 rounded-full font-bold shadow-[0_8px_20px_rgba(0,82,217,0.3)] active:scale-95 transition-transform text-sm"
                        >
                            加入购物车
                        </motion.button>
                    </div>
                ) : (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); onCheckout(); }}
                        className="bg-[#0052D9] text-white h-10 px-8 rounded-full font-bold text-sm shadow-[0_8px_20px_rgba(0,82,217,0.3)]"
                    >
                        去结算
                    </motion.button>
                )}
            </div>
        </div>
    );
};
