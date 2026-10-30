import React from 'react';
import { X, Clock, User, Share2, Sparkles, BookOpen } from 'lucide-react';
import { ArticleItem } from '../types';

interface ArticleDetailModalProps {
  article: ArticleItem | null;
  onClose: () => void;
  onOpenChat: (prefill: string) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onOpenChat,
}) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative h-64 w-full bg-slate-950 overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {/* Header metadata */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mb-3">
            <span className="uppercase font-bold px-2.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {article.author}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
            {article.title}
          </h2>

          <div className="mt-4 p-4 rounded-xl bg-slate-50 border-l-4 border-cyan-500 text-sm text-slate-700 italic">
            &quot;{article.excerpt}&quot;
          </div>

          {/* Body Content */}
          <div className="mt-6 text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-4 font-sans">
            {article.content}
          </div>

          {/* Footer inquiry strip */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-mono">
              Published directly via Firestore Article Collection
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenChat(`Inquiry regarding article: ${article.title}`);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-mono font-bold transition-colors"
            >
              Discuss with Technical Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
