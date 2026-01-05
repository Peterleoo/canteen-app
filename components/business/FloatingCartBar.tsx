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
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
    mode = 'HOME',
    showCartModal,
    onToggleCart,
    selectedProduct,
    onCheckout,
    deliveryFee
}) => {
    const { cart, addToCart, getCartQuantity, getCartTotal, getCartCount } = useCartStore();

    const cartItemTotal = getCartTotal();
    const cartCount = getCartCount();

    if (cart.length === 0) return null;

    const isExpanded = showCartModal || mode === 'DETAILS';

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-[160] transition-all duration-300 ${isExpanded
                ? 'bg-white border-t border-gray-100 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.08)]'
                : 'bottom-[60px] px-4 pointer-events-none'
                }`}
        >
            <div
                className={`flex items-center justify-between transition-all duration-300 pointer-events-auto ${isExpanded
                    ? 'px-4 h-[65px] w-full'
                    : 'bg-[#1C1C1E]/95 backdrop-blur-md rounded-full h-14 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] mx-auto w-full'
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
                    <div className="flex flex-col justify-center">
                        <div className={`font-bold font-mono text-xl transition-colors ${isExpanded ? 'text-gray-900' : 'text-white'}`}>
                            ¥{cartItemTotal.toFixed(2)}
                        </div>
                        <div className={`text-[10px] transition-colors ${isExpanded ? 'text-gray-500' : 'text-gray-400 font-medium'}`}>
                            预估配送费 ¥{deliveryFee}
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
