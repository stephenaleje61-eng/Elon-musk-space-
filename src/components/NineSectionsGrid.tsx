import React from 'react';
import {
  Zap,
  Bot,
  Rocket,
  Radio,
  Cpu,
  Brain,
  Navigation,
  Share2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { SECTIONS } from '../defaultData';
import { SectionId } from '../types';

interface NineSectionsGridProps {
  onSelectSection: (sectionId: SectionId) => void;
  activeSection: SectionId | 'all';
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5" />,
  Bot: <Bot className="w-5 h-5" />,
  Rocket: <Rocket className="w-5 h-5" />,
  Radio: <Radio className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  Navigation: <Navigation className="w-5 h-5" />,
  Share2: <Share2 className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
};

export const NineSectionsGrid: React.FC<NineSectionsGridProps> = ({
  onSelectSection,
  activeSection,
}) => {
  return (
    <section className="py-12 bg-white border-b border-slate-100" id="tech-sections">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <span>EXPLORE ALL NINE DIVISIONS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
              Frontier Technology Sectors
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Dive into deep specifications, equipment availability, research whitepapers, and direct procurement channels across each sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((sec) => {
            const isSelected = activeSection === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50/20 shadow-xl ring-2 ring-cyan-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-xl'
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={sec.bannerImage}
                    alt={sec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Section Number Pill */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 text-cyan-400 text-xs font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    {ICONS_MAP[sec.iconName]}
                    <span>SECTOR 0{sec.number}</span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                      {sec.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {sec.tagline}
                  </p>

                  {/* Subcategories tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sec.subcategories.slice(0, 4).map((sub, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                    {sec.subcategories.length > 4 && (
                      <span className="text-[11px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md font-medium">
                        +{sec.subcategories.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    <span>Explore Section & Products</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-cyan-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
