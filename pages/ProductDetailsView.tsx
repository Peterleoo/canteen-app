import React from 'react';
import { ShoppingCart, ChevronLeft, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { formatSales } from '../utils/format';
import { useCartStore } from '../stores/useCartStore';
import { motion } from 'framer-motion';
import { AlertPopup } from '../components/common/AlertPopup';
import { useUserStore } from '../stores/useUserStore';

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
    const { user, setShowLoginModal } = useUserStore();
    const qty = getCartQuantity(product.id);
    const cartCount = getCartCount();

    const [headerOpacity, setHeaderOpacity] = React.useState(0);
    const [alertVisible, setAlertVisible] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState('');
    const [alertTitle, setAlertTitle] = React.useState('');
    
    const showAlert = (message: string, title: string = '提示') => {
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertVisible(true);
    };
    
    // 检查是否允许添加到购物车
    const canAddToCart = () => {
      // 检查用户是否已登录
      if (!user) {
        setShowLoginModal(true);
        return false;
      }
      
      // 从product中获取canteen信息
      const canteen = product.canteen;
      if (!canteen) {
        showAlert('获取食堂信息失败，无法添加到购物车', '提示');
        return false;
      }
      
      // 检查食堂状态
      if (canteen.status === 'CLOSED') {
        showAlert('当前食堂已关停，暂时无法下单', '提示');
        return false;
      }
      if (canteen.status === 'BUSY') {
        showAlert('当前食堂繁忙，暂时无法下单', '提示');
        return false;
      }
      
      // 移除基于当前位置的服务半径检查，仅在下单时检查配送地址
      return true;
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const opacity = Math.min(1, scrollTop / 150);
        setHeaderOpacity(opacity);
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-[#F5F6F8] flex flex-col"
        >
            {/* Immersive Sticky Header */}
            <div
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pb-3 transition-colors duration-300"
                style={{
                    paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)',
                    backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
                    backdropFilter: headerOpacity > 0.5 ? 'blur(12px)' : 'none',
                    borderBottom: `1px solid rgba(229, 231, 235, ${headerOpacity})`
                }}
            >
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${headerOpacity > 0.5 ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white backdrop-blur-md'}`}
                >
                    <ChevronLeft size={22} />
                </motion.button>

                <div className={`flex-1 text-center transition-opacity duration-300 ${headerOpacity > 0.8 ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="font-bold text-gray-900 line-clamp-1 px-4">{product.name}</span>
                </div>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onOpenCart}
                    className={`w-9 h-9 rounded-full flex items-center justify-center relative transition-colors ${headerOpacity > 0.5 ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white backdrop-blur-md'}`}
                >
                    <ShoppingCart size={18} />
                    {cartCount > 0 &&
                        <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-[#EE0D24] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white"
                        >
                            {cartCount}
                        </motion.span>
                    }
                </motion.button>
            </div>

            <div
                className="flex-1 overflow-y-auto no-scrollbar"
                onScroll={handleScroll}
            >
                <div className="relative h-80 w-full bg-gray-200 overflow-hidden">
                    <motion.img
                        src={product.image}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>

                <div className="px-4 -mt-6 relative z-10 pb-10">
                    <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

                        <div className="flex justify-between items-end mb-6">
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-[#EE0D24] font-mono leading-none">¥{product.price}</span>
                                <span className="text-sm text-gray-400 mb-1">月售 {formatSales(product.sales)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {qty > 0 ? (
                                    <>
                                        <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1) }} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-600 bg-white shadow-sm active:bg-gray-50"><Minus size={18} /></motion.button>
                                        <span className="text-lg font-bold min-w-[20px] text-center font-mono">{qty}</span>
                                        <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1) }} className="w-8 h-8 rounded-full bg-[#0052D9] flex items-center justify-center text-white active:scale-95 shadow-sm"><Plus size={18} /></motion.button>
                                    </>
                                ) : (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => { e.stopPropagation(); if (canAddToCart()) addToCart(product); }}
                                        className="bg-[#0052D9] text-white px-5 py-2 rounded-full font-bold shadow-[0_4px_12px_rgba(0,82,217,0.25)] active:scale-95 transition-transform text-sm flex items-center gap-1"
                                    >
                                        <Plus size={16} /> 加入购物车
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Gold Parameter Badges */}
                        <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-50 mt-4">
                            <div className="flex flex-col items-center border-r border-gray-50 last:border-0">
                                <span className="text-[10px] text-gray-400 mb-0.5 font-medium">综合评分</span>
                                <div className="flex items-center gap-0.5">
                                    <span className="text-sm font-bold text-gray-900">4.9</span>
                                    <span className="text-[10px] text-[#FFB800]">★</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center border-r border-gray-50 last:border-0">
                                <span className="text-[10px] text-gray-400 mb-0.5 font-medium">参考热量</span>
                                <div className="flex items-center gap-0.5">
                                    <span className="text-sm font-bold text-gray-900">450</span>
                                    <span className="text-[10px] text-gray-500">kcal</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center border-r border-gray-50 last:border-0">
                                <span className="text-[10px] text-gray-400 mb-0.5 font-medium">主要蛋白</span>
                                <div className="flex items-center gap-0.5">
                                    <span className="text-sm font-bold text-gray-900">22</span>
                                    <span className="text-[10px] text-gray-500">g</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
                        <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-3 bg-[#0052D9] rounded-full"></div>
                            食材介绍
                        </h3>
                        <p className="text-gray-500 text-[13px] leading-relaxed mb-4">{product.description}</p>
                    </div>

                    {product.comboItems && product.comboItems.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
                            <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-1 h-3 bg-[#0052D9] rounded-full"></div>
                                套餐内容
                            </h3>
                            <div className="space-y-3">
                                {product.comboItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                            <span className="text-xs text-gray-400">×{item.quantity}</span>
                                        </div>
                                        <div className="text-[#EE0D24] font-bold text-sm font-mono">¥{item.price.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
                        <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-3 bg-[#0052D9] rounded-full"></div>
                            营养成分 (参考)
                        </h3>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            {[
                                { label: '热量', val: '450kcal' },
                                { label: '蛋白质', val: '22g' },
                                { label: '碳水', val: '45g' },
                                { label: '脂肪', val: '18g' },
                            ].map(n => (
                                <div key={n.label} className="bg-gray-50 rounded-xl py-2">
                                    <div className="text-[10px] text-gray-400 mb-0.5">{n.label}</div>
                                    <div className="text-xs font-bold text-gray-800">{n.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                <div className="w-1 h-3 bg-[#0052D9] rounded-full"></div>
                                商品评价 (12)
                            </h3>
                            <span className="text-[10px] text-[#0052D9] font-bold">查看全部 &gt;</span>
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#0052D9]">U{i}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-gray-700">用户88**</span>
                                            <span className="text-[10px] text-gray-400">2023-10-24</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">味道很不错，分量也足，推荐给各位小伙伴！</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 弹窗组件 */}
            <AlertPopup
                visible={alertVisible}
                onClose={() => setAlertVisible(false)}
                title={alertTitle}
                message={alertMessage}
            />
        </motion.div>
    );
};
