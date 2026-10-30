import React, { useState } from 'react';
import { ShieldCheck, Sparkles, MessageSquare, ExternalLink, Database } from 'lucide-react';
import { SECTIONS } from '../defaultData';
import { SectionId } from '../types';

interface FooterProps {
  onSelectSection: (sectionId: SectionId) => void;
  onOpenChat: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectSection,
  onOpenChat,
  onOpenAdmin,
}) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700 shadow-md">
                <span className="font-mono font-black text-cyan-400 text-xl">X</span>
              </div>
              <span className="font-mono font-black text-lg tracking-wider text-white">
                ELON MUSK SPACE
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Global technology marketplace and frontier knowledge directory. Connecting innovators, engineers, enterprise procurement, and investors across orbital launch vehicles, clean electric transport, neural interfaces, and autonomous systems.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onOpenChat}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-mono font-bold text-xs rounded-xl shadow transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-200" />
                <span>CHAT ELON MUSK (CONCIERGE)</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              <span>Direct Cloud Firestore & Auth Connected</span>
            </div>
          </div>

          {/* Column 2: Sections 1-4 */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Divisions 01 - 04
            </h4>
            <ul className="space-y-2 text-xs">
              {SECTIONS.slice(0, 4).map((sec) => (
                <li key={sec.id}>
                  <button
                    onClick={() => onSelectSection(sec.id)}
                    className="hover:text-cyan-400 text-slate-400 transition-colors text-left"
                  >
                    0{sec.number}. {sec.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Sections 5-9 */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Divisions 05 - 09
            </h4>
            <ul className="space-y-2 text-xs">
              {SECTIONS.slice(4).map((sec) => (
                <li key={sec.id}>
                  <button
                    onClick={() => onSelectSection(sec.id)}
                    className="hover:text-cyan-400 text-slate-400 transition-colors text-left"
                  >
                    0{sec.number}. {sec.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Platform & Legal */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Platform & Control
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setLegalModal('privacy')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy & Data Rights
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLegalModal('terms')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Terms of Public Marketplace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSection('investment')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  SEC & Investment Transparency
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-purple-400 hover:text-purple-300 font-mono font-bold transition-colors"
                >
                  Admin Control Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Clear Independent Platform Disclaimer Requirement */}
        <div className="pt-8 border-t border-slate-900 text-xs text-slate-500 leading-relaxed space-y-2">
          <p className="font-mono text-slate-400 font-bold uppercase">
            Mandatory Independent Platform Disclaimer:
          </p>
          <p>
            ELON MUSK SPACE is an independent technology catalog, marketplace showcase, and educational information hub. This website is not operated, owned, or endorsed by Elon Musk, Tesla, Inc., Space Exploration Technologies Corp. (SpaceX), Starlink, xAI, Neuralink Corp., or The Boring Company. All trademarks, service marks, and trade names referenced remain the property of their respective owners.
          </p>
          <p>
            Market and financial data in Section 9 is curated from publicly accessible SEC Edgar filings and NASDAQ quotes for research reference. No investment guarantees or speculative warranties are made.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
          <span>© {new Date().getFullYear()} ELON MUSK SPACE — ALL RIGHTS RESERVED</span>
          <span>ENTERPRISE GRADE ARCHITECTURE • ZERO PRE-LOGIN BLOCKERS</span>
        </div>
      </div>

      {/* Legal Modals */}
      {legalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-mono">
              {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h3>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                1. <strong>Anonymous Access:</strong> Visitors are permitted to explore all nine sections, browse products, search, and review financial metrics without prior mandatory account registration.
              </p>
              <p>
                2. <strong>Direct Firestore Encryption:</strong> Private conversations with the platform administration are stored with individual UID ownership constraints. Visitors cannot inspect other visitors&apos; correspondence.
              </p>
              <p>
                3. <strong>Catalog Integrity:</strong> Technical hardware listings are maintained directly in Cloud Firestore.
              </p>
            </div>
            <button
              onClick={() => setLegalModal(null)}
              className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-mono font-bold"
            >
              Close Notice
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
