import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { WatchlistRecord, UserProfile } from '../types';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../database';

interface InvestmentPageProps {
  currentUser: UserProfile | null;
  onOpenChat: (prefill?: string) => void;
}

export const InvestmentPage: React.FC<InvestmentPageProps> = ({
  currentUser,
  onOpenChat,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y' | 'ALL'>('1Y');
  const [watchlist, setWatchlist] = useState<WatchlistRecord[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // Load watchlist on mount or user switch
  useEffect(() => {
    if (currentUser) {
      loadWatchlist();
    }
  }, [currentUser]);

  const loadWatchlist = async () => {
    if (!currentUser) return;
    setLoadingWatchlist(true);
    try {
      const items = await getWatchlist(currentUser.uid);
      setWatchlist(items);
    } catch (err) {
      console.warn('Error loading watchlist:', err);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newSymbol.trim()) return;

    try {
      const added = await addToWatchlist(
        currentUser.uid,
        newSymbol.trim(),
        newCompanyName.trim() || newSymbol.toUpperCase(),
        newTargetPrice ? parseFloat(newTargetPrice) : undefined,
        newNotes.trim() || undefined
      );
      setWatchlist([added, ...watchlist]);
      setNewSymbol('');
      setNewCompanyName('');
      setNewTargetPrice('');
      setNewNotes('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const handleRemoveWatchlist = async (watchId: string) => {
    try {
      await removeFromWatchlist(watchId);
      setWatchlist(watchlist.filter((w) => w.id !== watchId));
    } catch (err) {
      console.error('Failed to remove watchlist item:', err);
    }
  };

  // TSLA stock quote simulation based on latest public baseline
  const tslaQuote = {
    symbol: 'TSLA',
    name: 'Tesla, Inc. (NASDAQ)',
    price: 254.28,
    change: +7.84,
    changePercent: +3.18,
    marketCap: '$812.4 Billion',
    peRatio: '72.4x',
    volume: '74,820,100',
    fiftyTwoWeekHigh: '$271.00',
    fiftyTwoWeekLow: '$138.80',
    q3AutomotiveRevenue: '$20.016 Billion',
    q3EnergyRevenue: '$2.376 Billion (+52% YoY)',
    q3FreeCashFlow: '$2.74 Billion',
    energyStorageDeployed: '6.9 GWh (Record Quarter)',
  };

  return (
    <div className="bg-white py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Banner */}
        <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold tracking-wider mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>SECTOR 09: FINANCIAL & MARKET ANALYTICS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white uppercase">
              INVESTMENT & EQUITY RESEARCH
            </h1>

            <p className="mt-3 text-slate-300 text-base leading-relaxed">
              Transparent public financial reporting, SEC 10-K regulatory filings, operational cash flow metrics, and secure private watchlists.
            </p>

            {/* In-Section Mandatory Chat Button */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenChat('Inquiry regarding Section 9 Investment Analytics')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-cyan-200" />
                <span>CHAT ELON MUSK (CONCIERGE DESK)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clear Independent Platform Investment Disclaimer */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 leading-relaxed">
            <p className="font-bold uppercase tracking-wider text-amber-950 font-mono">
              Regulatory Disclosure & Investment Transparency Notice
            </p>
            <p>
              This section compiles public financial research, historical filings, and SEC disclosures for educational and informational purposes only. It does not constitute financial, legal, or investment advice.
            </p>
            <p className="font-semibold">
              Warning: We will never offer guaranteed returns, private venture equity, or solicit unauthorized funds. Please verify all trading data with registered brokerages.
            </p>
          </div>
        </div>

        {/* TSLA Interactive Market Terminal */}
        <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black font-mono tracking-tight text-white">
                  TSLA
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  NASDAQ
                </span>
                <span className="text-xs text-slate-400">{tslaQuote.name}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-black font-mono text-cyan-400">
                  ${tslaQuote.price.toFixed(2)}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  <TrendingUp className="w-4 h-4" />
                  +${tslaQuote.change} ({tslaQuote.changePercent}%)
                </span>
              </div>
            </div>

            {/* Timeframe Controls */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              {(['1D', '1W', '1M', '1Y', '5Y', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeTimeframe === tf
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart Canvas Simulation */}
          <div className="py-8">
            <div className="relative h-60 w-full flex items-end justify-between gap-1 pt-8 pb-2 px-2 bg-slate-900/60 rounded-2xl border border-slate-800/80">
              {/* SVG Trendline */}
              <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,35 Q 20,40 35,28 T 65,15 T 85,20 T 100,8"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                />
                <path
                  d="M 0,35 Q 20,40 35,28 T 65,15 T 85,20 T 100,8 L 100,50 L 0,50 Z"
                  fill="url(#chartGradient)"
                />
              </svg>

              <div className="relative z-10 w-full flex justify-between text-[11px] font-mono text-slate-500 mt-auto">
                <span>Q1 Deliveries</span>
                <span>Q2 Energy Growth</span>
                <span>Robotaxi Reveal</span>
                <span>Q3 10-K Filing</span>
                <span>Record Energy GWh</span>
              </div>
            </div>
          </div>

          {/* Key Fundamentals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-slate-800">
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Market Cap</p>
              <p className="text-base font-bold font-mono text-white mt-1">{tslaQuote.marketCap}</p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">P/E Ratio</p>
              <p className="text-base font-bold font-mono text-white mt-1">{tslaQuote.peRatio}</p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">52-Wk Range</p>
              <p className="text-base font-bold font-mono text-white mt-1">
                {tslaQuote.fiftyTwoWeekLow} - {tslaQuote.fiftyTwoWeekHigh}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Energy Storage</p>
              <p className="text-base font-bold font-mono text-emerald-400 mt-1">
                {tslaQuote.energyStorageDeployed}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Q3 Free Cash Flow</p>
              <p className="text-base font-bold font-mono text-cyan-400 mt-1">
                {tslaQuote.q3FreeCashFlow}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-slate-400">Energy Revenue</p>
              <p className="text-base font-bold font-mono text-emerald-400 mt-1">
                {tslaQuote.q3EnergyRevenue}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Filings & Educational Research */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Official 10-K Reports Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <FileText className="w-5 h-5 text-cyan-600" />
              <h3 className="text-xl font-bold font-mono text-slate-950">
                Official SEC Filings & Investor Relations
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Official filings filed with the United States Securities and Exchange Commission (SEC).
            </p>

            <div className="space-y-3">
              {[
                {
                  title: 'Tesla 2024-2025 Form 10-K (Annual Comprehensive Filing)',
                  date: 'SEC EDGAR Archive',
                  desc: 'Comprehensive annual financial performance, risk factors, automotive gross margins, and Megapack scaling.',
                },
                {
                  title: 'Tesla Q3 Shareholder Deck & Balance Sheet',
                  date: 'Investor Relations Official',
                  desc: 'Operational summary of 4680 battery cell yield, FSD V12 hardware architecture, and Shanghai Megafactory ramp.',
                },
                {
                  title: 'SpaceX Commercial Launch Manifest & FCC Constellation Filings',
                  date: 'Federal Communications Commission',
                  desc: 'Spectrum authorization and direct-to-cell orbital generation 2 constellation filings.',
                },
              ].map((docItem, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-cyan-50/40 hover:border-cyan-200 transition-colors flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-mono">{docItem.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{docItem.desc}</p>
                    <span className="inline-block mt-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {docItem.date}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Personal Watchlist Management (Stored Permanently in Firestore!) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-bold font-mono text-slate-950">
                    Personal Investment Watchlist
                  </h3>
                </div>
                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-white rounded-xl text-xs font-mono font-bold hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAdding ? 'Cancel' : 'Add Symbol'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 mb-6">
                Privately saved directly to your Firestore document profile. Stored across sessions.
              </p>

              {/* Add Symbol Form */}
              {isAdding && (
                <form
                  onSubmit={handleAddWatchlist}
                  className="p-4 mb-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold font-mono uppercase text-slate-500">
                        Ticker Symbol *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TSLA, NVDA"
                        required
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold font-mono uppercase text-slate-500">
                        Target Alert ($)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 300.00"
                        value={newTargetPrice}
                        onChange={(e) => setNewTargetPrice(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold font-mono uppercase text-slate-500">
                      Research Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Watch for FSD take rate & robotaxi scaling"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-lg transition-colors"
                  >
                    SAVE TO PERSISTENT FIRESTORE WATCHLIST
                  </button>
                </form>
              )}

              {/* Watchlist Table */}
              <div className="space-y-2">
                {watchlist.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-mono">
                    No watchlist entries saved yet. Click &apos;Add Symbol&apos; above to track stocks or ecosystem assets.
                  </div>
                ) : (
                  watchlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {item.symbol}
                          </span>
                          <span className="text-xs text-slate-500 truncate max-w-[150px]">
                            {item.companyName}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-slate-600 mt-1 italic">&quot;{item.notes}&quot;</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {item.targetPrice && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-mono">
                              TARGET
                            </span>
                            <span className="text-xs font-bold font-mono text-emerald-600">
                              ${item.targetPrice.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => handleRemoveWatchlist(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Database Status: Connected</span>
              <span>Watchlist Count: {watchlist.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
