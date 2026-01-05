import React, { useRef } from 'react';
import { MapPin, ChevronDown, Search, Minus, Plus } from 'lucide-react';
import { Product, Canteen, Category } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { WeChatHeader } from '../components/layout/WeChatHeader';
import { formatSales } from '../utils/format';
import { useCartStore } from '../stores/useCartStore';

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
    const { addToCart, removeFromCart, getCartQuantity } = useCartStore();
    const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const rightScrollRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

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
        } else {
            const element = categoryRefs.current[category];
            if (element) {
                const top = element.offsetTop - 40;
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
        <div className="flex flex-col h-full bg-white relative">
            <WeChatHeader />

            <div className="bg-white px-4 pb-3 flex gap-3 items-center shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)] z-30 shrink-0">
                <div
                    className="flex items-center gap-1 max-w-[40%] cursor-pointer active:opacity-60"
                    onClick={onShowLocation}
                >
                    <MapPin size={18} className="text-gray-900" />
                    <span className="text-base font-bold text-gray-900 truncate">{selectedCanteen.name}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                </div>

                <div
                    className="flex-1 bg-gray-100 rounded-full flex items-center px-3 py-1.5 h-9 active:bg-gray-200 transition-colors"
                    onClick={onSearch}
                >
                    <Search size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">搜索美食</span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="w-24 bg-[#f7f8fa] overflow-y-auto no-scrollbar shrink-0 pb-40">
                    <button
                        onClick={() => scrollToCategory('全部')}
                        className={`w-full px-2 py-4 text-xs font-medium text-center break-words relative transition-all ${activeCategory === '全部' ? 'bg-white text-gray-900 font-bold' : 'text-gray-500'
                            }`}
                    >
                        {activeCategory === '全部' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r"></div>}
                        今日疯抢
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => scrollToCategory(cat)}
                            className={`w-full px-2 py-4 text-xs font-medium text-center break-words relative transition-all ${activeCategory === cat ? 'bg-white text-gray-900 font-bold' : 'text-gray-500'
                                }`}
                        >
                            {activeCategory === cat && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r"></div>}
                            {cat}
                        </button>
                    ))}
                </div>

                <div
                    className="flex-1 bg-white overflow-y-auto pb-40"
                    ref={rightScrollRef}
                    onScroll={handleScroll}
                >
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-base text-gray-800">今日疯抢</h3>
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold">限时</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {MOCK_PRODUCTS.slice(0, 5).map(product => (
                                <div key={product.id} className="w-32 min-w-[8rem] shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col active:scale-95 transition-transform" onClick={() => onProductClick(product)}>
                                    <div className="relative h-24">
                                        <img src={product.image} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                                            <div className="text-white text-sm font-bold font-mono">¥{product.price}</div>
                                        </div>
                                    </div>
                                    <div className="p-2 flex flex-col justify-between flex-1">
                                        <h4 className="text-xs font-medium text-gray-800 line-clamp-1">{product.name}</h4>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            className="mt-2 w-full bg-red-50 text-red-600 text-[10px] py-1 rounded font-bold border border-red-100"
                                        >
                                            马上抢
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-4 py-2 z-10 text-xs font-bold text-gray-500 flex items-center gap-2">
                            <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                            人气热销
                        </div>
                        <div>
                            {[...MOCK_PRODUCTS].sort((a, b) => b.sales - a.sales).slice(0, 8).map(product => {
                                const qty = getCartQuantity(product.id);
                                return (
                                    <div
                                        key={product.id}
                                        className="flex p-4 gap-3 relative active:bg-gray-50 transition-colors"
                                        onClick={() => onProductClick(product)}
                                    >
                                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-100">
                                            <img src={product.image} className="w-full h-full object-cover" loading="lazy" />
                                            {product.stock < 10 && (
                                                <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-0.5">仅剩{product.stock}份</div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-0.5">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-1 mb-1">{product.description}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {product.tags?.map(tag => (
                                                        <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">月售 {formatSales(product.sales)}</div>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="text-red-500 font-bold text-lg flex items-baseline font-mono">
                                                    <span className="text-xs mr-0.5">¥</span>{product.price}
                                                </div>

                                                {qty > 0 ? (
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 bg-white active:bg-gray-100">
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-sm font-medium w-4 text-center">{qty}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white active:scale-95 shadow-sm">
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                                                        className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white active:scale-95 shadow-sm"
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

                    {groupedProducts.map(group => (
                        <div key={group.category} id={group.category} ref={(el) => { categoryRefs.current[group.category] = el; }} className="mb-4">
                            <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-4 py-2 z-10 text-xs font-bold text-gray-500 flex items-center gap-2">
                                <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                                {group.category}
                            </div>
                            <div>
                                {group.products.map(product => {
                                    const qty = getCartQuantity(product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            className="flex p-4 gap-3 relative active:bg-gray-50 transition-colors"
                                            onClick={() => onProductClick(product)}
                                        >
                                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-100">
                                                <img src={product.image} className="w-full h-full object-cover" loading="lazy" />
                                                {product.stock < 10 && (
                                                    <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-0.5">仅剩{product.stock}份</div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h3>
                                                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">{product.description}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.tags?.map(tag => (
                                                            <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1">月售 {formatSales(product.sales)}</div>
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <div className="text-red-500 font-bold text-lg flex items-baseline font-mono">
                                                        <span className="text-xs mr-0.5">¥</span>{product.price}
                                                    </div>

                                                    {qty > 0 ? (
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 bg-white active:bg-gray-100">
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="text-sm font-medium w-4 text-center">{qty}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white active:scale-95 shadow-sm">
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                                                            className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white active:scale-95 shadow-sm"
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
                    <div className="h-16 flex items-center justify-center text-xs text-gray-300 pb-safe">
                        — 到底了 —
                    </div>
                </div>
            </div>

        </div>
    );
};
