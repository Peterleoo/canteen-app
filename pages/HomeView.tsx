import React, { useRef } from 'react';
import { MapPin, ChevronDown, Search, Minus, Plus } from 'lucide-react';
import { Product, Canteen, Category } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { formatSales } from '../utils/format';
import { useCartStore } from '../stores/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/common/Skeleton';

interface HomeViewProps {
    selectedCanteen: Canteen;
    onShowLocation: () => void;
    onSearch: () => void;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    onProductClick: (product: Product) => void;
}

const BANNERS = [
    { id: 1, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop', title: '匠心好味道', subtitle: '严选食材，新鲜每一天' },
    { id: 2, image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=1200&auto=format&fit=crop', title: '轻食新选择', subtitle: '低卡健康，活力满分' },
    { id: 3, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1200&auto=format&fit=crop', title: '暖心午餐', subtitle: '正宗风味，回味无穷' },
];

export const HomeView: React.FC<HomeViewProps> = ({
    selectedCanteen,
    onShowLocation,
    onSearch,
    activeCategory,
    setActiveCategory,
    onProductClick,
}) => {
    const { addToCart, removeFromCart, getCartQuantity } = useCartStore();
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentBanner, setCurrentBanner] = React.useState(0);
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const rightScrollRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        const bannerTimer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % BANNERS.length);
        }, 5000);
        return () => {
            clearTimeout(timer);
            clearInterval(bannerTimer);
        };
    }, []);

    const categories = Object.values(Category);
    const groupedProducts = categories.map(cat => ({
        category: cat,
        products: MOCK_PRODUCTS.filter(p => p.category === cat)
    })).filter(group => group.products.length > 0);

    const scrollToCategory = (category: string) => {
        isScrollingRef.current = true;
        setActiveCategory(category);

        const container = rightScrollRef.current;
        if (!container) return;

        if (category === '全部') {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (category === '人气热销') {
            const element = categoryRefs.current['人气热销'];
            if (element) {
                const top = element.offsetTop - 10;
                container.scrollTo({ top, behavior: 'smooth' });
            }
        } else {
            const element = categoryRefs.current[category];
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
        const headerOffset = 50;

        if (scrollTop < 20) {
            if (activeCategory !== '全部') setActiveCategory('全部');
            return;
        }

        const categories = Object.keys(categoryRefs.current);
        let currentActive = '全部';
        for (const cat of categories) {
            const el = categoryRefs.current[cat];
            if (el) {
                if (el.offsetTop - headerOffset <= scrollTop) {
                    currentActive = cat;
                }
            }
        }
        if (currentActive !== activeCategory) {
            setActiveCategory(currentActive);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F6F8] relative">
            <WeChatHeader className="bg-white/80 backdrop-blur-md" />

            <div className="bg-white/80 backdrop-blur-md px-4 pb-3 flex gap-3 items-center shadow-sm z-30 shrink-0 sticky top-0">
                <div
                    className="flex items-center gap-1.5 max-w-[40%] cursor-pointer active:opacity-60 transition-opacity"
                    onClick={onShowLocation}
                >
                    <div className="w-8 h-8 rounded-full bg-[#F2F6FC] flex items-center justify-center">
                        <MapPin size={16} className="text-[#0052D9]" />
                    </div>
                    <span className="text-[15px] font-bold text-gray-900 truncate">{selectedCanteen.name}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                </div>

                <div
                    className="flex-1 bg-gray-100/80 rounded-full flex items-center px-4 py-2 h-9 active:bg-gray-200 transition-colors"
                    onClick={onSearch}
                >
                    <Search size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">搜索美食...</span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar Category */}
                <div className="w-[88px] bg-[#F5F6F8] overflow-y-auto no-scrollbar shrink-0 pb-32">
                    <button
                        onClick={() => scrollToCategory('全部')}
                        className={`w-full h-14 flex items-center justify-center text-[13px] relative transition-all duration-300 ${activeCategory === '全部' || activeCategory === '今日疯抢' ? 'bg-white text-[#0052D9] font-bold shadow-[inset_4px_0_0_0_rgba(0,82,217,1)]' : 'text-gray-500 hover:bg-white/50'}`}
                    >
                        今日疯抢
                    </button>
                    <button
                        onClick={() => scrollToCategory('人气热销')}
                        className={`w-full h-14 flex items-center justify-center text-[13px] relative transition-all duration-300 ${activeCategory === '人气热销' ? 'bg-white text-[#0052D9] font-bold shadow-[inset_4px_0_0_0_rgba(0,82,217,1)]' : 'text-gray-500 hover:bg-white/50'}`}
                    >
                        人气热销
                    </button>
                    {categories.filter(cat => cat !== '人气热销').map(cat => (
                        <button
                            key={cat}
                            onClick={() => scrollToCategory(cat)}
                            className={`w-full h-14 flex items-center justify-center text-[13px] relative transition-all duration-300 ${activeCategory === cat ? 'bg-white text-[#0052D9] font-bold shadow-[inset_4px_0_0_0_rgba(0,82,217,1)]' : 'text-gray-500 hover:bg-white/50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Right Content Area */}
                <div
                    className="flex-1 min-h-0 bg-white rounded-tl-[24px] overflow-visible shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10"
                >
                    <div
                        className="h-full overflow-y-auto pb-40 smooth-scroll"
                        ref={rightScrollRef}
                        onScroll={handleScroll}
                    >
                        {isLoading ? (
                            <div className="p-4 space-y-6">
                                <Skeleton className="w-full h-40 rounded-2xl" />
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="w-24 h-6" />
                                        <Skeleton className="w-16 h-4" />
                                    </div>
                                    <div className="flex gap-4 overflow-hidden">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-36 shrink-0 space-y-2">
                                                <Skeleton className="w-full h-28 rounded-xl" />
                                                <Skeleton className="w-3/4 h-4" />
                                                <Skeleton className="w-full h-8 rounded-lg" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-white min-h-full">
                                {/* Hero Banner Slider */}
                                <div className="mb-6 relative h-44 rounded-2xl overflow-hidden shadow-lg group">
                                    <AnimatePresence mode='wait'>
                                        <motion.div
                                            key={currentBanner}
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="absolute inset-0"
                                        >
                                            <img src={BANNERS[currentBanner].image} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-6">
                                                <motion.h2
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="text-white text-xl font-bold mb-1"
                                                >
                                                    {BANNERS[currentBanner].title}
                                                </motion.h2>
                                                <motion.p
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="text-white/80 text-sm"
                                                >
                                                    {BANNERS[currentBanner].subtitle}
                                                </motion.p>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Dots */}
                                    <div className="absolute bottom-3 right-6 flex gap-1.5">
                                        {BANNERS.map((_, i) => (
                                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'bg-white w-4' : 'bg-white/40 w-1.5'}`} />
                                        ))}
                                    </div>
                                </div>

                                {/* Horizontal Scroll Section (Flash Sale) */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[#0052D9] rounded-full"></div>
                                            <h3 className="font-bold text-base text-gray-900">今日疯抢</h3>
                                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">今日限购</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-4 snap-x scroll-pl-4">
                                        <div className="w-1 shrink-0" /> {/* 4px w-1 + 12px gap-3 = 16px (matches p-4) */}
                                        {MOCK_PRODUCTS.slice(0, 5).map(product => {
                                            const soldPercent = Math.floor((product.sales / (product.sales + product.stock)) * 100);
                                            return (
                                                <div key={product.id} className="snap-start w-36 min-w-[9rem] shrink-0 bg-white rounded-xl shadow-card border border-gray-50 overflow-hidden flex flex-col active:scale-[0.98] transition-all duration-300" onClick={() => onProductClick(product)}>
                                                    <div className="relative h-28 overflow-hidden group">
                                                        <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6">
                                                            <div className="text-white text-sm font-bold font-mono">¥{product.price}</div>
                                                        </div>
                                                    </div>
                                                    <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
                                                        <h4 className="text-[13px] font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-center text-[9px] text-gray-400">
                                                                <span>已抢 {soldPercent}%</span>
                                                            </div>
                                                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                                                                    style={{ width: `${soldPercent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                            className="w-full bg-red-50 text-red-600 text-[10px] py-1.5 rounded-lg font-bold hover:bg-red-100 active:scale-95 transition-all shadow-sm"
                                                        >
                                                            马上抢
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="w-1 shrink-0" />
                                    </div>
                                </div>

                                <div className="bg-gray-50 h-[10px] -mx-4 mb-6"></div>

                                {/* Popular Section */}
                                <div
                                    ref={el => categoryRefs.current['人气热销'] = el}
                                    className="mb-2 flex items-center gap-2"
                                >
                                    <div className="w-1 h-4 bg-[#0052D9] rounded-full"></div>
                                    <span className="font-bold text-base text-gray-900">人气热销</span>
                                </div>

                                <div className="space-y-6">
                                    {[...MOCK_PRODUCTS].sort((a, b) => b.sales - a.sales).slice(0, 8).map(product => {
                                        const qty = getCartQuantity(product.id);
                                        return (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                whileInView={{ y: 0, opacity: 1 }}
                                                viewport={{ once: true }}
                                                key={product.id}
                                                className="flex gap-3 relative group"
                                                onClick={() => onProductClick(product)}
                                            >
                                                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative shadow-sm">
                                                    <img src={product.image} className="w-full h-full object-cover" loading="lazy" />
                                                    {product.stock < 10 && (
                                                        <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm text-white text-[10px] text-center py-0.5">仅剩{product.stock}份</div>
                                                    )}
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-[15px] mb-1 truncate">{product.name}</h3>
                                                        <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">{product.description}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {product.tags?.map(tag => (
                                                                <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-end">
                                                        <div className="flex flex-col">
                                                            <div className="text-[10px] text-gray-400 mb-0.5">月售 {formatSales(product.sales)}</div>
                                                            <div className="text-red-500 font-bold text-lg flex items-baseline font-mono lh-1">
                                                                <span className="text-xs mr-0.5">¥</span>{product.price}
                                                            </div>
                                                        </div>

                                                        {qty > 0 ? (
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 bg-white active:bg-gray-100 active:scale-90 transition-all">
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="text-sm font-bold w-4 text-center text-gray-900">{qty}</span>
                                                                <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="w-7 h-7 rounded-full bg-[#0052D9] flex items-center justify-center text-white active:scale-90 shadow-glow transition-all">
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                                                                className="w-7 h-7 rounded-full bg-[#0052D9] flex items-center justify-center text-white active:scale-90 shadow-glow transition-all"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {groupedProducts.map(group => (
                                    <div key={group.category} id={group.category} ref={(el) => { categoryRefs.current[group.category] = el; }} className="mt-8">
                                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-3 z-10 flex items-center gap-2 mb-2">
                                            <div className="w-1 h-4 bg-[#0052D9] rounded-full"></div>
                                            <span className="font-bold text-base text-gray-900">{group.category}</span>
                                        </div>
                                        <div className="space-y-6">
                                            {group.products.map(product => {
                                                const qty = getCartQuantity(product.id);
                                                return (
                                                    <div
                                                        key={product.id}
                                                        className="flex gap-3 relative group"
                                                        onClick={() => onProductClick(product)}
                                                    >
                                                        <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative shadow-sm">
                                                            <img src={product.image} className="w-full h-full object-cover" loading="lazy" />
                                                            {product.stock < 10 && (
                                                                <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm text-white text-[10px] text-center py-0.5">仅剩{product.stock}份</div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 text-[15px] mb-1 truncate">{product.name}</h3>
                                                                <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">{product.description}</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {product.tags?.map(tag => (
                                                                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-end">
                                                                <div className="flex flex-col">
                                                                    <div className="text-[10px] text-gray-400 mb-0.5">月售 {formatSales(product.sales)}</div>
                                                                    <div className="text-red-500 font-bold text-lg flex items-baseline font-mono lh-1">
                                                                        <span className="text-xs mr-0.5">¥</span>{product.price}
                                                                    </div>
                                                                </div>

                                                                {qty > 0 ? (
                                                                    <div className="flex items-center gap-3">
                                                                        <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 bg-white active:bg-gray-100 active:scale-90 transition-all">
                                                                            <Minus size={14} />
                                                                        </button>
                                                                        <span className="text-sm font-bold w-4 text-center text-gray-900">{qty}</span>
                                                                        <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="w-7 h-7 rounded-full bg-[#0052D9] flex items-center justify-center text-white active:scale-90 shadow-glow transition-all">
                                                                            <Plus size={14} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                                                                        className="w-7 h-7 rounded-full bg-[#0052D9] flex items-center justify-center text-white active:scale-90 shadow-glow transition-all"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <div className="h-20 flex items-center justify-center text-xs text-gray-300">
                                    — 到底了 —
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
};
