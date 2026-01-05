import React, { useState } from 'react';
import { ChevronLeft, Search, X, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { useCartStore } from '../stores/useCartStore';

interface SearchViewProps {
    onBack: () => void;
    onProductClick: (product: Product) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
    onBack,
    onProductClick,
}) => {
    const { addToCart, removeFromCart, getCartQuantity } = useCartStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = searchQuery ? MOCK_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : [];

    return (
        <div className="flex flex-col h-full bg-white z-[60]">
            <div className="flex items-center gap-2 p-2 bg-white border-b border-gray-100 pt-safe">
                <button onClick={onBack} className="p-2"><ChevronLeft size={24} /></button>
                <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3 h-9">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input
                        autoFocus
                        className="bg-transparent flex-1 outline-none text-sm h-full"
                        placeholder="搜索商品名称、描述或标签"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-gray-400" /></button>}
                </div>
                <button className="px-2 text-sm text-blue-600 font-medium" onClick={() => { }}>搜索</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-40">
                {!searchQuery ? (
                    <div className="text-gray-400 text-sm mt-10 text-center">请输入关键词搜索</div>
                ) : filtered.length === 0 ? (
                    <div className="text-gray-400 text-sm mt-10 text-center">未找到相关商品</div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filtered.map(product => {
                            const qty = getCartQuantity(product.id);
                            return (
                                <div key={product.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden flex flex-col shadow-sm active:scale-95 transition-transform" onClick={() => onProductClick(product)}>
                                    <div className="h-32 bg-gray-200 relative">
                                        <img src={product.image} className="w-full h-full object-cover" loading="lazy" />
                                        {product.stock < 10 && (
                                            <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-0.5">仅剩{product.stock}份</div>
                                        )}
                                    </div>
                                    <div className="p-2 flex flex-col flex-1">
                                        <div className="font-bold text-sm text-gray-800 line-clamp-2">{product.name}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</div>
                                        {product.tags && product.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {product.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-auto flex justify-between items-center pt-2">
                                            <span className="text-red-500 font-bold text-sm">¥{product.price}</span>
                                            {qty > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(product.id) }} className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 bg-white">
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-xs font-medium w-4 text-center">{qty}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); addToCart(product) }} className="w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center">
                                                    <Plus size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
