import React from 'react';
import { X, Trash2, ArrowUpRight, Bookmark } from 'lucide-react';
import { SavedItemRecord, ProductItem } from '../types';

interface SavedItemsModalProps {
  savedItems: SavedItemRecord[];
  onClose: () => void;
  onRemove: (productId: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const SavedItemsModal: React.FC<SavedItemsModalProps> = ({
  savedItems,
  onClose,
  onRemove,
  onSelectProduct,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-bold font-mono text-slate-950">
              Saved Products & Hardware ({savedItems.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
          {savedItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              No saved items yet. Click the bookmark icon on any product in the marketplace to save it here.
            </div>
          ) : (
            savedItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div
                  className="flex items-center gap-3 cursor-pointer group flex-1"
                  onClick={() => {
                    onClose();
                    onSelectProduct(item.productId);
                  }}
                >
                  <img
                    src={item.productImage || ''}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-slate-900 group-hover:text-cyan-600 transition-colors">
                      {item.productTitle}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">
                      ${item.productPrice.toLocaleString()} • {item.sectionId.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectProduct(item.productId);
                    }}
                    className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(item.productId)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
