import React from 'react';
import {
  Rocket,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Zap,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { SectionId } from '../types';

interface HeroWelcomeProps {
  onExploreProducts: () => void;
  onExploreTechnology: () => void;
  onInvestmentInfo: () => void;
  onChatPrivately: () => void;
}

export const HeroWelcome: React.FC<HeroWelcomeProps> = ({
  onExploreProducts,
  onExploreTechnology,
  onInvestmentInfo,
  onChatPrivately,
}) => {
  return (
    <section className="relative bg-white pt-6 pb-12 overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Banner Card (Premium Dark Technology Aesthetic inside clean white container) */}
        <div className="relative rounded-3xl bg-slate-950 text-white overflow-hidden shadow-2xl border border-slate-800">
          {/* Subtle Ambient Glow and High-Tech Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,180,255,0.25),rgba(255,255,255,0))] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          <div className="relative z-10 px-6 sm:px-12 py-14 lg:py-20 max-w-4xl">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GLOBAL TECHNOLOGY MARKETPLACE & ECOSYSTEM</span>
            </div>

            {/* Main Welcome Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-mono uppercase leading-none">
              WELCOME TO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-blue-500">
                ELON MUSK SPACE
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-xl sm:text-2xl text-slate-300 font-light max-w-2xl leading-relaxed">
              Explore Innovation. Discover Technology. Connect with the Future.
            </p>

            {/* Summary description */}
            <p className="mt-3 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Explore all nine industry-defining pillars—from Tesla electric mobility and high-density Powerwalls to SpaceX Starship launch slots, Optimus humanoid robotics, Starlink global terminals, and verified public market analytics.
            </p>

            {/* Four Mandatory Large Action Buttons */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Button 1: EXPLORE PRODUCTS */}
              <button
                onClick={onExploreProducts}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 hover:shadow-lg transition-all active:scale-95 group"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">EXPLORE PRODUCTS</span>
              </button>

              {/* Button 2: EXPLORE TECHNOLOGY */}
              <button
                onClick={onExploreTechnology}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-slate-900 text-white border border-slate-700 font-bold text-sm hover:border-cyan-400 hover:bg-slate-800 transition-all active:scale-95 group"
              >
                <Rocket className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">EXPLORE TECHNOLOGY</span>
              </button>

              {/* Button 3: INVESTMENT INFORMATION */}
              <button
                onClick={onInvestmentInfo}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-slate-900 text-white border border-slate-700 font-bold text-sm hover:border-emerald-400 hover:bg-slate-800 transition-all active:scale-95 group"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">INVESTMENT INFO</span>
              </button>

              {/* Button 4: CHAT PRIVATELY */}
              <button
                onClick={onChatPrivately}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 group"
              >
                <MessageSquare className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">CHAT PRIVATELY</span>
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">
                  Sectors Covered
                </p>
                <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5">9 Frontier Divisions</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">
                  Active Constellation
                </p>
                <p className="text-xl font-bold font-mono text-white mt-0.5">7,000+ Satellites</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">
                  Supercluster Power
                </p>
                <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5">100k H100 Colossus</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">
                  Access Model
                </p>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">Open Public Catalog</p>
              </div>
            </div>
          </div>

          {/* Futuristic Hero Visual Collage Element */}
          <div className="absolute right-0 bottom-0 top-0 w-2/5 hidden lg:block opacity-40 hover:opacity-60 transition-opacity pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1517976487502-5f65f126c888?q=80&w=1200&auto=format&fit=crop"
              alt="Orbital rocket launching into cosmos"
              className="w-full h-full object-cover object-center mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};
