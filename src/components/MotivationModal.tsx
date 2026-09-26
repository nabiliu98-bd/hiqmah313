import React, { useState } from 'react';
import { MotivationQuote } from '../types';
import { Sparkles, Plus, Trash2, X, Quote, BookOpen } from 'lucide-react';

interface MotivationModalProps {
  quotes: MotivationQuote[];
  onSaveQuotes: (quotes: MotivationQuote[]) => void;
  onClose: () => void;
}

export const MotivationModal: React.FC<MotivationModalProps> = ({
  quotes,
  onSaveQuotes,
  onClose,
}) => {
  const [newText, setNewText] = useState('');
  const [newSource, setNewSource] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newQuote: MotivationQuote = {
      id: `mq-${Date.now()}`,
      text: newText.trim(),
      source: newSource.trim() || 'ব্যক্তিগত সংকল্প',
      custom: true,
    };

    onSaveQuotes([...quotes, newQuote]);
    setNewText('');
    setNewSource('');
    setIsAdding(false);
  };

  const handleDeleteQuote = (id: string) => {
    onSaveQuotes(quotes.filter((q) => q.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white border border-emerald-100 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                দৈনিক প্রেরণা ও রূহানী শক্তি
              </h3>
              <p className="text-xs text-amber-700 font-semibold">
                “আপনার নিজের নির্বাচিত Motivation ও অন্তরের সংকল্প”
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quotes List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 relative group flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  “{q.text}”
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-bold">
                  <Quote className="w-3 h-3 text-amber-500" />
                  <span>— {q.source}</span>
                </div>
              </div>

              {q.custom && (
                <button
                  onClick={() => handleDeleteQuote(q.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Quote Form */}
        {isAdding ? (
          <form onSubmit={handleAddQuote} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700">প্রেরণাদায়ী বাক্য / আয়াত / হাদিস:</label>
              <textarea
                rows={2}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="যেমন: আর নিশ্চয় কষ্টের সাথেই স্বস্তি রয়েছে..."
                className="w-full mt-1 p-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">উৎস / রেফারেন্স:</label>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="যেমন: সূরা আশ-শারহ"
                className="w-full mt-1 p-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                যুক্ত করুন
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-dashed border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ নিজের পছন্দের বাণী বা আয়াত যুক্ত করুন</span>
          </button>
        )}
      </div>
    </div>
  );
};
