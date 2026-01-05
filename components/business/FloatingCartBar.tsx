import React from 'react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../stores/useCartStore';

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
    const { cart, addToCart, updateQuantity, getCartQuantity, getCartTotal, getCartCount } = useCartStore();

    const cartItemTotal = getCartTotal();
    const cartCount = getCartCount();

    if (cart.length === 0) return null;



    const isExpanded = showCartModal || mode === 'DETAILS';

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-[120] transition-all duration-300 ${isExpanded
                ? 'bg-white border-t border-gray-100 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.08)]'
                : 'bottom-[60px] px-4 pointer-events-none'
                }`}
        >
            <div
                className={`flex items-center justify-between transition-all duration-300 pointer-events-auto ${isExpanded
                    ? 'px-4 h-[60px] w-full'
                    : 'bg-black/90 rounded-full h-12 px-4 shadow-xl mx-auto w-full'
                    }`}
                onClick={onToggleCart}
            >
                <div className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className={`relative transition-transform ${isExpanded ? '' : '-mt-4'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white border-4 border-[#f3f4f6]'
                            }`}>
                            <ShoppingCart size={24} />
                        </div>
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full border border-white">
                            {cartCount}
                        </span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className={`font-bold font-mono text-xl transition-colors ${isExpanded ? 'text-gray-900' : 'text-white'}`}>
                            ¥{cartItemTotal.toFixed(2)}
                        </div>
                        <div className={`text-[10px] transition-colors ${isExpanded ? 'text-gray-500' : 'text-gray-400'}`}>
                            预估配送费 ¥{deliveryFee}
                        </div>
                    </div>
                </div>

                {mode === 'DETAILS' && selectedProduct && !showCartModal && getCartQuantity(selectedProduct.id) === 0 ? (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); addToCart(selectedProduct) }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform text-sm"
                        >
                            加入购物车
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onCheckout(); }}
                        className="bg-blue-600 text-white h-9 px-8 rounded-full font-bold text-sm shadow-lg shadow-blue-600/30 active:scale-95"
                    >
                        去结算
                    </button>
                )}
            </div>
        </div>
    );
};
