import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Search, X, Minus, Plus, TrendingUp, History, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { useCartStore } from '../stores/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchViewProps {
    onBack: () => void;
    onProductClick: (product: Product) => void;
}

const HOT_SEARCHES = ['人气热销', '暖心午餐', '招牌套餐', '轻食沙拉', '广式点心'];

export const SearchView: React.FC<SearchViewProps> = ({
    onBack,
    onProductClick,
}) => {
    const { addToCart, removeFromCart, getCartQuantity } = useCartStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load history from local storage
    useEffect(() => {
        const savedHistory = localStorage.getItem('search_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    const saveHistory = (query: string) => {
        if (!query.trim()) return;
        const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 8);
        setHistory(newHistory);
        localStorage.setItem('search_history', JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('search_history');
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        saveHistory(query);
        inputRef.current?.blur();
    };

    const filtered = searchQuery.trim() ? MOCK_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8F9FB] z-[60] relative overflow-hidden">
            {/* Elegant Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[30%] bg-blue-500/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[30%] bg-purple-500/5 blur-[100px] pointer-events-none" />

            {/* Premium Header */}
            <div className={`sticky top-0 z-50 transition-all duration-300 ${isFocused ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-xl border-b border-gray-100'}`}>
                <div className="p-4 pt-safe flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 active:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </motion.button>

                    <div className={`flex-1 relative transition-all duration-300 ${isFocused ? 'ring-2 ring-blue-500/20' : ''}`}>
                        <div className={`flex items-center gap-2 h-11 px-4 rounded-2xl transition-all duration-300 ${isFocused ? 'bg-white shadow-lg' : 'bg-gray-100/80'}`}>
                            <Search size={18} className={`transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                            <input
                                ref={inputRef}
                                autoFocus
                                className="bg-transparent flex-1 outline-none text-sm font-medium placeholder:text-gray-400 text-gray-800"
                                placeholder="搜索心仪的美味..."
                                value={searchQuery}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        onClick={() => setSearchQuery('')}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {!searchQuery ? (
                        <motion.div
                            key="discovery"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 space-y-8"
                        >
                            {/* Hot Searches */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp size={16} className="text-orange-500" />
                                    <h3 className="text-[15px] font-bold text-gray-800">热门搜索</h3>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {HOT_SEARCHES.map((tag, i) => (
                                        <motion.button
                                            key={tag}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleSearch(tag)}
                                            className="px-4 py-2 rounded-xl bg-white text-[13px] text-gray-600 border border-gray-100 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all font-medium"
                                        >
                                            {tag}
                                        </motion.button>
                                    ))}
                                </div>
                            </section>

                            {/* Search History */}
                            {history.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <History size={16} className="text-gray-400" />
                                            <h3 className="text-[15px] font-bold text-gray-800">搜索历史</h3>
                                        </div>
                                        <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-400 transition-colors">清空</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {history.map(item => (
                                            <button
                                                key={item}
                                                onClick={() => handleSearch(item)}
                                                className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-500 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Inspiration */}
                            <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl p-6 border border-white/50 flex flex-col items-center text-center space-y-3">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-6">
                                    <Sparkles className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 mb-1">寻味食堂</h4>
                                    <p className="text-xs text-gray-500">发现那些让你心动的美食灵感</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center pt-20 px-6 text-center"
                        >
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <Search size={40} />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">未找到相关商品</h3>
                            <p className="text-sm text-gray-400">换个词再搜搜看？或者来看看热门推荐</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                            >
                                返回推荐
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="p-4 space-y-4 pb-40"
                        >
                            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-2 ml-1">
                                搜索结果 {filtered.length}
                            </div>
                            {filtered.map(product => {
                                const qty = getCartQuantity(product.id);
                                return (
                                    <motion.div
                                        key={product.id}
                                        variants={itemVariants}
                                        onClick={() => onProductClick(product)}
                                        className="bg-white rounded-[24px] p-3 flex gap-4 shadow-sm border border-gray-50 active:scale-[0.98] transition-all relative group overflow-hidden"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-md">
                                            <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            {product.stock < 10 && (
                                                <div className="absolute top-0 left-0 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg shadow-lg">
                                                    剩{product.stock}份
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 flex flex-col min-w-0 pr-1">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                    {product.name}
                                                </h4>
                                            </div>
                                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>

                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {product.tags?.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-500 font-bold border border-blue-100/50 uppercase tracking-tighter">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-auto flex items-end justify-between">
                                                <div className="flex items-baseline gap-0.5">
                                                    <span className="text-[10px] text-red-500 font-bold">¥</span>
                                                    <span className="text-lg font-bold text-red-500 font-mono tracking-tighter">
                                                        {product.price}
                                                    </span>
                                                </div>

                                                {/* Cart Controls */}
                                                <div className="relative flex items-center bg-gray-50/80 p-0.5 rounded-full border border-gray-100 shadow-inner">
                                                    {qty > 0 ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <motion.button
                                                                whileTap={{ scale: 0.8 }}
                                                                onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }}
                                                                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm border border-gray-100"
                                                            >
                                                                <Minus size={14} />
                                                            </motion.button>
                                                            <span className="text-xs font-bold w-4 text-center text-gray-800">{qty}</span>
                                                            <motion.button
                                                                whileTap={{ scale: 0.8 }}
                                                                onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                                                                className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20"
                                                            >
                                                                <Plus size={14} />
                                                            </motion.button>
                                                        </div>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => { e.stopPropagation(); addToCart(product) }}
                                                            className="w-10 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 active:bg-blue-700"
                                                        >
                                                            <Plus size={16} />
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
