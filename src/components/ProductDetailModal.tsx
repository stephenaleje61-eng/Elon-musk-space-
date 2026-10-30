import React, { useState } from 'react';
import {
  X,
  Bookmark,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { ProductItem } from '../types';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (product: ProductItem) => void;
  onInquireChat: (productTitle: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isSaved,
  onToggleSave,
  onInquireChat,
}) => {
  if (!product) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const images = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold px-2.5 py-1 rounded bg-cyan-100 text-cyan-800">
              {product.subcategory}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Sector: {product.sectionId.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(product)}
              className={`p-2 rounded-full border transition-colors ${
                isSaved
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-950'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery Column */}
            <div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <img
                  src={images[activeImageIdx] || images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-slate-950/80 text-white font-mono text-xs px-2.5 py-1 rounded backdrop-blur-md">
                  {activeImageIdx + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIdx === idx
                          ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Platform Guarantee Strip */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">Direct Operations Guarantee</p>
                  <p>
                    Technical specifications, production readiness, and pricing estimates are directly synchronized via the central database ledger.
                  </p>
                </div>
              </div>
            </div>

            {/* Info & Specs Column */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
                  {product.title}
                </h2>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-950 font-mono">
                    {product.priceFormatted || `$${product.price.toLocaleString()}`}
                  </span>
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Est. Global Marketplace Price
                  </span>
                </div>

                {/* Availability status */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      product.inStock
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {product.inStock ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{product.stockStatus || (product.inStock ? 'Ready for Manifest / Order' : 'Backorder')}</span>
                  </span>
                </div>

                {/* Description */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Product Overview
                  </h4>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Technical Specifications Table */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                      Key Technical Specifications
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {Object.entries(product.specs).map(([specKey, specVal]) => (
                        <div
                          key={specKey}
                          className="flex items-center justify-between px-3.5 py-2.5 text-xs bg-white hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-medium text-slate-500">{specKey}</span>
                          <span className="font-bold text-slate-900 font-mono text-right">
                            {specVal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onInquireChat(product.title);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-200" />
                  <span>CHAT WITH CONCIERGE ABOUT THIS ITEM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
