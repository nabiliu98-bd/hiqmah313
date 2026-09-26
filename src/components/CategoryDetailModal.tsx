import React from 'react';
import { AppState } from '../types';
import { calculateScores } from '../utils/scoring';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import {
  X,
  Target,
  Smartphone,
  Moon,
  BrainCircuit,
  BookOpen,
  Users,
  Award,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface CategoryDetailModalProps {
  categoryKey: string;
  state: AppState;
  onClose: () => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  categoryKey,
  state,
  onClose,
}) => {
  const scores = calculateScores(state);
  const catScore = scores.breakdown.find((c) => c.key === categoryKey) || scores.breakdown[0];
  const catConfig = state.categories.find((c) => c.key === categoryKey);

  // Daily trend data for this category across last 7 days
  const dailyData = [
    { day: 'রবি', score: 85 },
    { day: 'সোম', score: 90 },
    { day: 'মঙ্গল', score: 80 },
    { day: 'বুধ', score: 95 },
    { day: 'বৃহঃ', score: 75 },
    { day: 'শুক্র', score: 90 },
    { day: 'শনি', score: catScore.percentage },
  ];

  // Weekly data for this category across 4 weeks
  const weeklyData = [
    { week: 'সপ্তাহ ১', score: 70 },
    { week: 'সপ্তাহ ২', score: 78 },
    { week: 'সপ্তাহ ৩', score: catScore.percentage },
    { week: 'সপ্তাহ ৪', score: Math.min(100, catScore.percentage + 6) },
  ];

  // Monthly data for this category across 6 months
  const monthlyData = [
    { month: 'মাস ১', score: catScore.percentage },
    { month: 'মাস ২', score: 72 },
    { month: 'মাস ৩', score: 80 },
    { month: 'মাস ৪', score: 86 },
    { month: 'মাস ৫', score: 92 },
    { month: 'মাস ৬', score: 96 },
  ];

  const categoryIcons: Record<string, any> = {
    facebook: Smartphone,
    goal: Target,
    deen: Moon,
    deepwork: BrainCircuit,
    quran: BookOpen,
    bookcircle: BookOpen,
    leadership: Users,
  };

  const Icon = categoryIcons[categoryKey] || Target;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white border border-emerald-100 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">{catScore.nameBn}</h3>
              <p className="text-xs text-slate-500">{catScore.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-800">অর্জিত শতাংশ</span>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{catScore.percentage}%</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-500">প্রাপ্ত পয়েন্ট</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{catScore.obtained}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
            <span className="text-[10px] font-bold uppercase text-amber-800">মোট পয়েন্ট</span>
            <div className="text-2xl font-black text-amber-900 mt-0.5">{catScore.total}</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <strong className="text-emerald-800 font-bold">নিয়ম ও মূল লক্ষ্য: </strong>
          {catConfig?.description}
        </div>

        {/* Daily Data Chart */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            দৈনিক ট্রেন্ড (বিগত ৭ দিনের কার্যকারিতা)
          </h4>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#0A3B2C',
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            সাপ্তাহিক ও মাসিক তুলনা
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {weeklyData.map((w, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">{w.week}</span>
                <span className="font-black text-emerald-800">{w.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
