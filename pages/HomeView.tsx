import React, { useRef, useState, useEffect } from 'react';
import { MapPin, ChevronDown, Search, Minus, Plus, Gift, ExternalLink } from 'lucide-react';
import { Product, Canteen, Category, MarketingBanner, Coupon } from '../types';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { getProducts } from '../services/productService';
import { marketingService } from '../services/marketingService';
import { useCartStore } from '../stores/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/common/Skeleton';
import { AlertPopup } from '../components/common/AlertPopup';
import { useUserStore } from '../stores/useUserStore';
import { useNavigate } from 'react-router-dom';

interface HomeViewProps {
    selectedCanteen: Canteen;
    onShowLocation: () => void;
    onSearch: () => void;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    onProductClick: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
    selectedCanteen,
    onShowLocation,
    onSearch,
    activeCategory,
    setActiveCategory,
    onProductClick,
}) => {
    const navigate = useNavigate();
    const { addToCart, removeFromCart, getCartQuantity } = useCartStore();
    const { user, setShowLoginModal } = useUserStore();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const showAlert = (message: string, title: string = '提示') => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const canAddToCart = () => {
        if (!user) {
            setShowLoginModal(true);
            return false;
        }
        if (selectedCanteen.status === 'CLOSED') {
            showAlert('当前食堂已关停，暂时无法下单', '提示');
            return false;
        }
        if (selectedCanteen.status === 'BUSY') {
            showAlert('当前食堂繁忙，暂时无法下单', '提示');
            return false;
        }
        return true;
    };

    const [isLoading, setIsLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [banners, setBanners] = useState<MarketingBanner[]>([]);
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const rightScrollRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [productRes, bannerList, couponList] = await Promise.all([
                    getProducts({ canteenId: selectedCanteen.id, status: 'ACTIVE' }),
                    marketingService.getBanners(selectedCanteen.id),
                    marketingService.getAvailableCoupons(selectedCanteen.id)
                ]);
                setProducts(productRes.data);
                setBanners(bannerList);
                setAvailableCoupons(couponList);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [selectedCanteen.id]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [banners]);

    const handleBannerClick = (banner: MarketingBanner) => {
        switch (banner.action_type) {
            case 'PRODUCT':
                if (banner.action_value) {
                    const product = products.find(p => String(p.id) === banner.action_value);
                    if (product) onProductClick(product);
                }
                break;
            case 'CATEGORY':
                if (banner.action_value) scrollToCategory(banner.action_value);
                break;
            case 'URL':
                if (banner.action_value) window.open(banner.action_value, '_blank');
                break;
            default:
                break;
        }
    };

    const categories = Object.values(Category);
    const groupedProducts = categories
        .filter(cat => cat !== '人气热销')
        .map(cat => ({
            category: cat,
            products: products.filter(p => p.category === cat)
        }))
        .filter(group => group.products.length > 0);

    const scrollToCategory = (category: string) => {
        isScrollingRef.current = true;
        setActiveCategory(category);
        const container = rightScrollRef.current;
        if (!container) return;

        let element = null;
        if (category === '全部') {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            element = categoryRefs.current[category];
            if (element) {
                const top = element.offsetTop - 10;
                container.scrollTo({ top, behavior: 'smooth' });
            }
        }
        setTimeout(() => { isScrollingRef.current = false; }, 800);
    };

    const handleScroll = () => {
        if (isScrollingRef.current) return;
        const container = rightScrollRef.current;
        if (!container) return;
        const scrollTop = container.scrollTop;
        if (scrollTop < 20) {
            if (activeCategory !== '全部') setActiveCategory('全部');
            return;
        }
        let currentActive = '全部';
        for (const cat in categoryRefs.current) {
            const el = categoryRefs.current[cat];
            if (el && el.offsetTop - 50 <= scrollTop) {
                currentActive = cat;
            }
        }
        if (currentActive !== activeCategory) setActiveCategory(currentActive);
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F6F8] relative flex-1 min-h-0">
            {selectedCanteen.status === 'CLOSED' && (
                <div className="bg-red-500 text-white text-[12px] font-bold py-1.5 flex items-center justify-center gap-2 z-[60] shrink-0">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    当前食堂处于休息时间，暂无法下单
                </div>
            )}

            <WeChatHeader className="bg-white/80 backdrop-blur-md" />

            <div className={`bg-white/80 backdrop-blur-md px-4 pb-3 flex gap-3 items-center shadow-sm z-30 shrink-0 sticky top-0 ${selectedCanteen.status === 'CLOSED' ? 'grayscale' : ''}`}>
                <div className="flex flex-col shrink-0">
                    <div className="flex items-center gap-1.5 max-w-[180px] cursor-pointer active:opacity-60 transition-opacity" onClick={onShowLocation}>
                        <div className="w-8 h-8 rounded-full bg-[#F2F6FC] flex items-center justify-center shrink-0">
                            <MapPin size={16} className="text-[#0052D9]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-gray-900 truncate">{selectedCanteen.name}</span>
                            <ChevronDown size={14} className="text-gray-400 shrink-0" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-gray-100/80 rounded-full flex items-center px-4 py-2 h-9 active:bg-gray-200 transition-colors" onClick={onSearch}>
                    <Search size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">搜索美食...</span>
                </div>
            </div>

            <div className={`flex flex-1 overflow-hidden relative ${selectedCanteen.status === 'CLOSED' ? 'grayscale opacity-80 pointer-events-none' : ''}`}>
                <div className="w-[88px] bg-[#F5F6F8] overflow-y-auto no-scrollbar shrink-0 pb-32">
                    {['今日疯抢', '人气热销', ...categories.filter(cat => cat !== '人气热销')].map(cat => (
                        <button
                            key={cat}
                            onClick={() => scrollToCategory(cat === '今日疯抢' ? '全部' : cat)}
                            className={`w-full h-14 flex items-center justify-center text-[13px] relative transition-all duration-300 ${activeCategory === (cat === '今日疯抢' ? '全部' : cat) ? 'bg-white text-[#0052D9] font-bold shadow-[inset_4px_0_0_0_rgba(0,82,217,1)]' : 'text-gray-500 hover:bg-white/50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex-1 min-h-0 bg-white rounded-tl-[24px] overflow-hidden flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
                    <div className="flex-1 overflow-y-auto pb-40 smooth-scroll" ref={rightScrollRef} onScroll={handleScroll}>
                        {isLoading ? (
                            <div className="p-4 space-y-6">
                                <Skeleton className="w-full h-40 rounded-2xl" />
                                <Skeleton className="w-full h-12 rounded-xl" />
                            </div>
                        ) : (
                            <div className="p-4 bg-white min-h-full">
                                {banners.length > 0 && (
                                    <div className="mb-6 relative h-44 rounded-2xl overflow-hidden shadow-lg group">
                                        <AnimatePresence mode='wait'>
                                            <motion.div
                                                key={currentBannerIndex}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={() => handleBannerClick(banners[currentBannerIndex])}
                                                className="absolute inset-0 cursor-pointer"
                                            >
                                                <img src={banners[currentBannerIndex].image_url} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-6">
                                                    {banners[currentBannerIndex].title && (
                                                        <motion.h2
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="text-white text-xl font-bold mb-1"
                                                        >
                                                            {banners[currentBannerIndex].title}
                                                        </motion.h2>
                                                    )}
                                                    {banners[currentBannerIndex].subtitle && (
                                                        <motion.p
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                            className="text-white/80 text-sm"
                                                        >
                                                            {banners[currentBannerIndex].subtitle}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                        {banners.length > 1 && (
                                            <div className="absolute bottom-3 right-6 flex gap-1.5">
                                                {banners.map((_, i) => (
                                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBannerIndex ? 'bg-white w-4' : 'bg-white/40 w-1.5'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {availableCoupons.length > 0 && (
                                    <motion.div
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/coupons')}
                                        className="mb-6 h-12 bg-gradient-to-r from-[#FFF1F0] to-[#FFF7E6] rounded-xl flex items-center justify-between px-4 border border-[#FFCCC7] cursor-pointer shadow-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="bg-red-500 rounded-lg p-1">
                                                <Gift size={14} className="text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-red-600">领券中心</span>
                                                <span className="text-[10px] text-red-400">当前有 {availableCoupons.length} 张优惠券可领</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-red-500 text-[11px] font-bold">
                                            立即查看 <ExternalLink size={12} className="ml-1" />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-4 bg-[#0052D9] rounded-full"></div>
                                        <h3 className="font-bold text-base text-gray-900">今日疯抢</h3>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                                        {products.slice(0, 5).map(product => (
                                            <div key={product.id} className="w-36 shrink-0 bg-white rounded-xl shadow-card border border-gray-50 flex flex-col" onClick={() => onProductClick(product)}>
                                                <img src={product.image} className="w-full h-28 object-cover rounded-t-xl" />
                                                <div className="p-2">
                                                    <h4 className="text-[13px] font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-red-500 font-bold font-mono">¥{product.price}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); if (canAddToCart()) addToCart({ ...product, canteen: selectedCanteen }); }} className="w-7 h-7 bg-[#0052D9] text-white rounded-full flex items-center justify-center">
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div ref={el => categoryRefs.current['人气热销'] = el} className="mb-2 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-[#0052D9] rounded-full"></div>
                                    <span className="font-bold text-base text-gray-900">人气热销</span>
                                </div>
                                <div className="space-y-6">
                                    {products.filter(product => product.category === '人气热销').map(product => {
                                        const qty = getCartQuantity(product.id);
                                        return (
                                            <div key={product.id} className="flex gap-3" onClick={() => onProductClick(product)}>
                                                <img src={product.image} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-[15px]">{product.name}</h3>
                                                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div className="text-red-500 font-bold text-lg font-mono">¥{product.price}</div>
                                                        <div className="flex items-center gap-3">
                                                            {qty > 0 && (
                                                                <>
                                                                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400"><Minus size={14} /></button>
                                                                    <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                                                </>
                                                            )}
                                                            <button onClick={(e) => { e.stopPropagation(); if (canAddToCart()) addToCart({ ...product, canteen: selectedCanteen }); }} className="w-7 h-7 rounded-full bg-[#0052D9] flex items-center justify-center text-white"><Plus size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {groupedProducts.map(group => (
                                    <div key={group.category} ref={el => categoryRefs.current[group.category] = el} className="mt-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-4 bg-[#0052D9] rounded-full"></div>
                                            <span className="font-bold text-base text-gray-900">{group.category}</span>
                                        </div>
                                        <div className="space-y-6">
                                            {group.products.map(product => {
                                                const qty = getCartQuantity(product.id);
                                                return (
                                                    <div key={product.id} className="flex gap-3" onClick={() => onProductClick(product)}>
                                                        <img src={product.image} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                                                        <div className="flex-1 flex flex-col justify-between py-0.5">
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 text-[15px]">{product.name}</h3>
                                                                <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>
                                                            </div>
                                                            <div className="flex justify-between items-end">
                                                                <div className="text-red-500 font-bold text-lg font-mono">¥{product.price}</div>
                                                                <div className="flex items-center gap-3">
                                                                    {qty > 0 && (
                                                                        <>
                                                                            <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400"><Minus size={14} /></button>
                                                                            <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                                                        </>
                                                                    )}
                                                                    <button onClick={(e) => { e.stopPropagation(); if (canAddToCart()) addToCart({ ...product, canteen: selectedCanteen }); }} className="w-7 h-7 rounded-full bg-[#0052D9] flex items-center justify-center text-white"><Plus size={14} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <div className="h-40 flex items-center justify-center text-xs text-gray-300">— 已经到底啦 —</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AlertPopup visible={alertVisible} onClose={() => setAlertVisible(false)} title={alertTitle} message={alertMessage} />
        </div>
    );
};
