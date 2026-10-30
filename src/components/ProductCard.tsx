import React from 'react';
import { Bookmark, MessageSquare, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { ProductItem } from '../types';

interface ProductCardProps {
  product: ProductItem;
  isSaved: boolean;
  onToggleSave: (product: ProductItem) => void;
  onViewDetails: (product: ProductItem) => void;
  onInquireChat: (productTitle: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSaved,
  onToggleSave,
  onViewDetails,
  onInquireChat,
}) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Box */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Tag */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 bg-cyan-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
            FEATURED TECH
          </div>
        )}

        {/* Bookmark Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(product);
          }}
          title={isSaved ? 'Remove from Saved' : 'Save Product'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            isSaved
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-900/70 text-slate-200 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Stock / Availability Indicator */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-sm text-slate-300 text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1.5 border border-slate-700">
          {product.inStock ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          ) : (
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
          )}
          <span className="truncate max-w-[170px]">{product.stockStatus || 'Available'}</span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1.5">
            <span className="uppercase text-cyan-600 font-bold">{product.subcategory}</span>
            <span>ID: {product.id.split('-').slice(-1)[0]}</span>
          </div>

          <h3
            onClick={() => onViewDetails(product)}
            className="text-base font-bold text-slate-900 hover:text-cyan-600 cursor-pointer transition-colors line-clamp-1"
          >
            {product.title}
          </h3>

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.summary}
          </p>

          {/* Quick Specs Chips */}
          {product.specs && (
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
                <div key={key} className="bg-slate-50 px-2 py-1 rounded text-[11px] border border-slate-100">
                  <span className="text-slate-400 block truncate">{key}</span>
                  <span className="font-semibold text-slate-800 truncate block">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Market Value
            </span>
            <span className="text-lg font-black text-slate-950 font-mono">
              {product.priceFormatted || `$${product.price.toLocaleString()}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onInquireChat(product.title)}
              title="Chat with platform admin about this item"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50/50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewDetails(product)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold font-mono tracking-wider transition-colors flex items-center gap-1"
            >
              <span>SPECS</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
