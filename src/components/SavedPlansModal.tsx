import React from 'react';
import { X, Trash2, ExternalLink, Calendar, BookmarkCheck, ArrowRight, Printer } from 'lucide-react';
import { SavedPlan, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SavedPlan[];
  onDeletePlan: (id: string) => void;
  onLoadPlan: (plan: SavedPlan) => void;
  currency: Currency;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  plans,
  onDeletePlan,
  onLoadPlan,
  currency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Your Saved Budget Plans ({plans.length})</h3>
              <p className="text-xs text-slate-400">Stored safely in local browser storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <BookmarkCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="font-bold text-slate-300 text-sm">No plans saved yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Generate a budget plan in Home Interior, Party, or Jewelry mode and click the Save bookmark icon to store it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {plans.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        p.scenario === 'home'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : p.scenario === 'party'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                      }`}
                    >
                      {p.scenario.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{p.title}</h4>
                  <div className="text-xs text-slate-400 font-mono">
                    Spend: <strong className="text-white">{formatCurrency(p.totalEstimatedCost, p.currency)}</strong> / Cap: {formatCurrency(p.budget, p.currency)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onLoadPlan(p);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePlan(p.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span>Persisted in browser localStorage</span>
          <button
            onClick={() => window.print()}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print All Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
