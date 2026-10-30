import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Bookmark,
  TrendingUp,
  Shield,
  Menu,
  X,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { SECTIONS } from '../defaultData';
import { SectionId, UserProfile } from '../types';
import { signInWithGoogle, logOut } from '../auth';

interface NavbarProps {
  currentUser: UserProfile | null;
  onSelectSection: (sectionId: SectionId | 'all') => void;
  activeSection: SectionId | 'all';
  onOpenChat: (prefilledProductTitle?: string) => void;
  onOpenSavedItems: () => void;
  onOpenWatchlist: () => void;
  onOpenAdmin: () => void;
  unreadCount: number;
  savedCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectSection,
  activeSection,
  onOpenChat,
  onOpenSavedItems,
  onOpenWatchlist,
  onOpenAdmin,
  unreadCount,
  savedCount,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectionsDropdownOpen, setSectionsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => {
              onSelectSection('all');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-md group-hover:border-cyan-500 transition-colors">
              <span className="font-mono font-black text-cyan-400 text-xl tracking-tighter">
                X
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-wider text-slate-950 text-lg font-mono">
                  ELON MUSK SPACE
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700 tracking-wider">
                  MARKETPLACE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Global Technology, Orbital Systems & Robotics
              </p>
            </div>
          </div>

          {/* Search Input (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Cybertruck, Starlink, Optimus, Grok..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full bg-slate-100 text-slate-900 pl-10 pr-4 py-2.5 rounded-full text-sm font-medium border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-2">
            {/* Sections Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSectionsDropdownOpen(!sectionsDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeSection !== 'all'
                    ? 'text-cyan-600 bg-cyan-50'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <span>9 Tech Sections</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {sectionsDropdownOpen && (
                <div
                  onMouseLeave={() => setSectionsDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <button
                    onClick={() => {
                      onSelectSection('all');
                      setSectionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 border-b border-slate-100"
                  >
                    View All Sections & Products
                  </button>
                  <div className="max-h-96 overflow-y-auto">
                    {SECTIONS.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => {
                          onSelectSection(sec.id);
                          setSectionsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                          activeSection === sec.id
                            ? 'text-cyan-600 font-bold bg-cyan-50/50'
                            : 'text-slate-800'
                        }`}
                      >
                        <span className="truncate">{sec.number}. {sec.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Investment Info Button */}
            <button
              onClick={() => onSelectSection('investment')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'investment'
                  ? 'text-cyan-600 bg-cyan-50'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Investment TSLA</span>
            </button>
          </nav>

          {/* Right Action Icons & Primary Chat Button */}
          <div className="flex items-center gap-2.5">
            {/* Bookmarks */}
            <button
              onClick={onOpenSavedItems}
              title="Saved Products"
              className="relative p-2.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Watchlist */}
            <button
              onClick={onOpenWatchlist}
              title="Investment Watchlist"
              className="p-2.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors hidden sm:block"
            >
              <TrendingUp className="w-5 h-5" />
            </button>

            {/* MANDATORY PROMINENT: CHAT ELON MUSK BUTTON */}
            <button
              onClick={() => onOpenChat()}
              className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm px-4 sm:px-5 py-2.5 rounded-full shadow-lg shadow-cyan-500/25 active:scale-95 transition-all group"
            >
              <MessageSquare className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">CHAT ELON MUSK</span>
              {unreadCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-2 ring-white" />
              )}
            </button>

            {/* User Account / Identity Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-950 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
                  {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-800 max-w-[90px] truncate hidden md:inline-block">
                  {currentUser?.displayName || 'Explorer'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 px-4 z-50 text-left"
                >
                  <div className="pb-3 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Connected Identity
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                      {currentUser?.displayName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentUser?.isAnonymous
                        ? 'Anonymous Session (Auto Background Auth)'
                        : currentUser?.email}
                    </p>
                    {currentUser?.role === 'admin' && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        Verified Administrator
                      </span>
                    )}
                  </div>

                  <div className="py-2 space-y-1">
                    {currentUser?.isAnonymous ? (
                      <button
                        onClick={async () => {
                          try {
                            await signInWithGoogle();
                            setUserDropdownOpen(false);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <LogIn className="w-4 h-4 text-cyan-600" />
                        <span>Sign in to preserve chats across devices</span>
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await logOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out (Switch to Guest)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenAdmin();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Admin Control Panel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="lg:hidden pb-3 pt-1">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search all products, rockets, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full bg-slate-100 text-slate-900 pl-10 pr-4 py-2 rounded-full text-sm border border-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 py-4 space-y-2">
            <div className="px-2 pb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Browse Marketplace Sections
              </p>
              <button
                onClick={() => {
                  onSelectSection('all');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  activeSection === 'all' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-800'
                }`}
              >
                All Sections & Full Catalog
              </button>
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    onSelectSection(sec.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                    activeSection === sec.id ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  {sec.number}. {sec.title}
                </button>
              ))}
            </div>

            <div className="px-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin Control Panel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
