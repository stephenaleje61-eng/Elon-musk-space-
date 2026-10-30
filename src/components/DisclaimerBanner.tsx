import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-400 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Independent Technology Marketplace:</strong> This platform is an independent global showcase and technical commerce platform. Not officially operated, affiliated, or endorsed by Elon Musk or featured corporate entities.
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] text-cyan-400 font-mono tracking-wider">
          LIVE DIRECT FIREBASE INTEGRATION
        </span>
      </div>
    </div>
  );
};
