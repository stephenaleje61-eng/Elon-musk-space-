import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Filter,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { SectionMeta, ProductItem, ArticleItem } from '../types';
import { ProductCard } from './ProductCard';

interface SectionDetailPageProps {
  section: SectionMeta;
  products: ProductItem[];
  articles: ArticleItem[];
  savedProductIds: Set<string>;
  onToggleSave: (product: ProductItem) => void;
  onViewProductDetails: (product: ProductItem) => void;
  onInquireChat: (prefill: string) => void;
  onBackToAll: () => void;
  onViewArticle: (article: ArticleItem) => void;
}

export const SectionDetailPage: React.FC<SectionDetailPageProps> = ({
  section,
  products,
  articles,
  savedProductIds,
  onToggleSave,
  onViewProductDetails,
  onInquireChat,
  onBackToAll,
  onViewArticle,
}) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  const filteredProducts =
    selectedSubcategory === 'all'
      ? products
      : products.filter(
          (p) => p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase()
        );

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToAll}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ALL SECTIONS</span>
          </button>

          <span className="text-xs font-mono text-cyan-600 font-bold uppercase tracking-wider">
            SECTOR 0{section.number} OF 09
          </span>
        </div>

        {/* Section Hero Banner */}
        <div className="rounded-3xl bg-slate-950 text-white overflow-hidden border border-slate-800 shadow-2xl relative">
          <div className="absolute inset-0 z-0">
            <img
              src={section.bannerImage}
              alt={section.title}
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DIVISION 0{section.number} SPECIFICATIONS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase">
              {section.title}
            </h1>

            <p className="mt-3 text-lg text-slate-300 font-light leading-relaxed">
              {section.tagline}
            </p>

            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-2xl">
              {section.description}
            </p>

            {/* MANDATORY PROMINENT CHAT BUTTON INSIDE SECTION */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onInquireChat(`Inquiry regarding ${section.title} catalog and specs`)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-cyan-200" />
                <span>CHAT ELON MUSK (CONCIERGE DESK)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subcategories Filter Bar */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Filter by Subcategory
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shrink-0 transition-all ${
                selectedSubcategory === 'all'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({products.length})
            </button>
            {section.subcategories.map((sub) => {
              const count = products.filter(
                (p) => p.subcategory.toLowerCase() === sub.toLowerCase()
              ).length;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shrink-0 transition-all ${
                    selectedSubcategory.toLowerCase() === sub.toLowerCase()
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black font-mono text-slate-950 tracking-tight">
              Products & Hardware Catalog
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredProducts.length} verified item{filteredProducts.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-500 font-mono">
                No products currently listed under &quot;{selectedSubcategory}&quot;.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Administrators can publish hardware specifications to this sector from the Admin Dashboard.
              </p>
              <button
                onClick={() => setSelectedSubcategory('all')}
                className="mt-4 px-4 py-2 bg-slate-950 text-white text-xs font-mono font-bold rounded-lg"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSaved={savedProductIds.has(product.id)}
                  onToggleSave={onToggleSave}
                  onViewDetails={onViewProductDetails}
                  onInquireChat={onInquireChat}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section Technical Articles & Research */}
        {articles.length > 0 && (
          <div className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                <h3 className="text-xl font-bold font-mono text-slate-950">
                  Technical Articles & Engineering Dispatches
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => onViewArticle(art)}
                  className="p-6 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all cursor-pointer bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                      <span className="text-cyan-600 font-bold uppercase">{art.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {art.readTime}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 hover:text-cyan-600 transition-colors">
                      {art.title}
                    </h4>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono font-bold text-cyan-600">
                    <span>Read Full Dispatch</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
