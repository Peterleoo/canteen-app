import React from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, e: React.MouseEvent) => void;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onClick }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full active:scale-[0.98] transition-transform duration-100"
      onClick={onClick}
    >
      <div className="relative h-32 w-full overflow-hidden bg-gray-200">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
            库存紧张
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-red-500 font-bold">¥{product.price.toFixed(2)}</span>
          <button 
            onClick={(e) => onAdd(product, e)}
            className="p-1.5 bg-[#07c160] rounded-full text-white active:scale-90 transition-transform shadow-sm"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
