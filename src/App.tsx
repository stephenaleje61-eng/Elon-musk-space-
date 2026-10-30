import React, { useState, useEffect } from 'react';
import {
  DisclaimerBanner,
} from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { HeroWelcome } from './components/HeroWelcome';
import { NineSectionsGrid } from './components/NineSectionsGrid';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SectionDetailPage } from './components/SectionDetailPage';
import { InvestmentPage } from './components/InvestmentPage';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { ChatElonMuskModal } from './components/ChatElonMuskModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SavedItemsModal } from './components/SavedItemsModal';
import { Footer } from './components/Footer';

import {
  ProductItem,
  ArticleItem,
  SectionId,
  UserProfile,
  SavedItemRecord,
} from './types';
import { SECTIONS } from './defaultData';
import {
  getProducts,
  getArticles,
  saveItem,
  removeSavedItem,
  getSavedItems,
  seedInitialFirestoreData,
} from './database';
import {
  subscribeToAuth,
  initializeBackgroundAuth,
} from './auth';
import { testConnection } from './firebase';
import {
  Sparkles,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItemRecord[]>([]);
  const [activeSection, setActiveSection] = useState<SectionId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState<string | undefined>();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSavedItemsOpen, setIsSavedItemsOpen] = useState(false);

  // Boot & Auth Initialization (Runs in background without blocking homepage viewing)
  useEffect(() => {
    // 1. Listen for auth changes
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        loadUserSavedItems(user.uid);
      }
    });

    // 2. Initialize silent background auth and test database
    const startup = async () => {
      try {
        await testConnection();
        await initializeBackgroundAuth();
        await seedInitialFirestoreData();
      } catch (e) {
        console.warn('Startup probe:', e);
      } finally {
        await loadMarketplaceData();
      }
    };

    startup();

    return () => unsubAuth();
  }, []);

  const loadMarketplaceData = async () => {
    setIsLoading(true);
    try {
      const [prods, arts] = await Promise.all([
        getProducts(),
        getArticles(),
      ]);
      setProducts(prods);
      setArticles(arts);
    } catch (err) {
      console.warn('Error loading products/articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSavedItems = async (uid: string) => {
    try {
      const items = await getSavedItems(uid);
      setSavedItems(items);
    } catch (e) {
      console.warn('Error loading saved items:', e);
    }
  };

  // Saved / Bookmark Toggle
  const savedProductIds = new Set(savedItems.map((s) => s.productId));

  const handleToggleSave = async (product: ProductItem) => {
    if (!currentUser) return;
    if (savedProductIds.has(product.id)) {
      await removeSavedItem(currentUser.uid, product.id);
      setSavedItems(savedItems.filter((s) => s.productId !== product.id));
    } else {
      await saveItem(currentUser.uid, product);
      setSavedItems([
        ...savedItems,
        {
          id: `${currentUser.uid}_${product.id}`,
          userId: currentUser.uid,
          productId: product.id,
          productTitle: product.title,
          productPrice: product.price,
          productImage: product.images[0] || '',
          sectionId: product.sectionId,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  // Open Chat with optional context
  const handleOpenChat = (prefill?: string) => {
    setChatPrefill(prefill);
    setIsChatOpen(true);
  };

  // Section Selector
  const handleSelectSection = (sectionId: SectionId | 'all') => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter products by search or active section
  const displayedProducts = products.filter((p) => {
    const matchesSection = activeSection === 'all' || p.sectionId === activeSection;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const featuredProducts = products.filter((p) => p.isFeatured);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* 1. Independent Platform Transparency Banner */}
      <DisclaimerBanner />

      {/* 2. Responsive Navigation Header with search and prominent Chat button */}
      <Navbar
        currentUser={currentUser}
        onSelectSection={handleSelectSection}
        activeSection={activeSection}
        onOpenChat={() => handleOpenChat()}
        onOpenSavedItems={() => setIsSavedItemsOpen(true)}
        onOpenWatchlist={() => handleSelectSection('investment')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        unreadCount={0}
        savedCount={savedItems.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => {}}
      />

      {/* 3. Main Views Switching */}
      <main className="flex-1">
        {/* VIEW A: SECTION 9 (INVESTMENT INFORMATION) */}
        {activeSection === 'investment' ? (
          <InvestmentPage
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
          />
        ) : activeSection !== 'all' ? (
          /* VIEW B: INDIVIDUAL SECTION DEEP DIVE (1 THROUGH 8) */
          (() => {
            const currentSecMeta = SECTIONS.find((s) => s.id === activeSection);
            if (!currentSecMeta) return null;
            return (
              <SectionDetailPage
                section={currentSecMeta}
                products={products.filter((p) => p.sectionId === activeSection)}
                articles={articles.filter((a) => a.sectionId === activeSection)}
                savedProductIds={savedProductIds}
                onToggleSave={handleToggleSave}
                onViewProductDetails={(p) => setSelectedProduct(p)}
                onInquireChat={handleOpenChat}
                onBackToAll={() => handleSelectSection('all')}
                onViewArticle={(a) => setSelectedArticle(a)}
              />
            );
          })()
        ) : (
          /* VIEW C: HOMEPAGE (ALL NINE SECTIONS & GLOBAL MARKETPLACE) */
          <>
            {/* MANDATORY HERO WELCOME SCREEN (Section 5) */}
            <HeroWelcome
              onExploreProducts={() => {
                document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreTechnology={() => {
                document.getElementById('tech-sections')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onInvestmentInfo={() => handleSelectSection('investment')}
              onChatPrivately={() => handleOpenChat()}
            />

            {/* ALL NINE SECTIONS GRID (Section 6) */}
            <NineSectionsGrid
              onSelectSection={handleSelectSection}
              activeSection={activeSection}
            />

            {/* FEATURED PRODUCTS CAROUSEL / HIGHLIGHTS */}
            {featuredProducts.length > 0 && !searchQuery && (
              <section className="py-12 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-600 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>FLAGSHIP INNOVATIONS</span>
                      </div>
                      <h2 className="text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
                        Featured Technology Hardware
                      </h2>
                    </div>

                    <button
                      onClick={() => {
                        document.getElementById('marketplace-catalog')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-600 hover:text-cyan-700"
                    >
                      <span>View Full Catalog</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSaved={savedProductIds.has(product.id)}
                        onToggleSave={handleToggleSave}
                        onViewDetails={(p) => setSelectedProduct(p)}
                        onInquireChat={handleOpenChat}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* COMPLETE MARKETPLACE PRODUCT CATALOG */}
            <section className="py-14 bg-white" id="marketplace-catalog">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>GLOBAL HARDWARE & RESERVATIONS</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
                      All Products & Equipment
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>Showing {displayedProducts.length} items</span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-cyan-600 font-bold underline"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Pills for Quick Switch on Homepage */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-100">
                  <button
                    onClick={() => setActiveSection('all')}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shrink-0 bg-slate-950 text-white shadow"
                  >
                    All Sectors ({products.length})
                  </button>
                  {SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => handleSelectSection(sec.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium shrink-0 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      {sec.shortTitle}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                {displayedProducts.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm font-mono text-slate-600">
                      No products matched your search query &quot;{searchQuery}&quot;.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-4 py-2 bg-slate-950 text-white text-xs font-mono font-bold rounded-lg"
                    >
                      Reset Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSaved={savedProductIds.has(product.id)}
                        onToggleSave={handleToggleSave}
                        onViewDetails={(p) => setSelectedProduct(p)}
                        onInquireChat={handleOpenChat}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* FEATURED ARTICLES & RESEARCH SECTION */}
            {articles.length > 0 && (
              <section className="py-14 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-2 text-cyan-600 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                        <span>LATEST UPDATES & RESEARCH</span>
                      </div>
                      <h2 className="text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
                        Engineering Whitepapers & News
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {articles.slice(0, 3).map((art) => (
                      <div
                        key={art.id}
                        onClick={() => setSelectedArticle(art)}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="h-44 bg-slate-900 overflow-hidden relative">
                            <img
                              src={art.coverImage}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-cyan-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded">
                              {art.sectionId.toUpperCase()}
                            </div>
                          </div>

                          <div className="p-5">
                            <span className="text-[11px] font-mono text-slate-400 block mb-1">
                              {art.readTime}
                            </span>
                            <h3 className="font-bold text-base text-slate-900 group-hover:text-cyan-600 transition-colors line-clamp-2">
                              {art.title}
                            </h3>
                            <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {art.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-cyan-600">
                          <span>Read Whitepaper</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* 4. Professional Footer */}
      <Footer
        onSelectSection={handleSelectSection}
        onOpenChat={() => handleOpenChat()}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* MODAL 1: Product Detail View */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isSaved={savedProductIds.has(selectedProduct.id)}
          onToggleSave={handleToggleSave}
          onInquireChat={handleOpenChat}
        />
      )}

      {/* MODAL 2: Article Full View */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onOpenChat={handleOpenChat}
        />
      )}

      {/* MODAL 3: Real-Time Private Chat Elon Musk */}
      {isChatOpen && (
        <ChatElonMuskModal
          currentUser={currentUser}
          onClose={() => setIsChatOpen(false)}
          initialInquiry={chatPrefill}
        />
      )}

      {/* MODAL 4: Admin Control Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          currentUser={currentUser}
          products={products}
          articles={articles}
          onRefreshData={loadMarketplaceData}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* MODAL 5: Saved / Bookmarked Items */}
      {isSavedItemsOpen && (
        <SavedItemsModal
          savedItems={savedItems}
          onClose={() => setIsSavedItemsOpen(false)}
          onRemove={async (pid) => {
            if (currentUser) {
              await removeSavedItem(currentUser.uid, pid);
              setSavedItems(savedItems.filter((s) => s.productId !== pid));
            }
          }}
          onSelectProduct={(pid) => {
            const p = products.find((x) => x.id === pid);
            if (p) setSelectedProduct(p);
          }}
        />
      )}
    </div>
  );
}
