import React, { useState } from 'react';
import { Clock, BarChart3, ChevronRight, Smartphone, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { AppState } from '../types';
import { getTodayProgress } from '../utils/scoring';
import { getTodayDateString } from '../utils/storage';

interface ActivityTimelineCardProps {
  state: AppState;
  onNavigateTab: (tab: 'home' | 'today' | 'progress' | 'goals' | 'profile') => void;
}

export const ActivityTimelineCard: React.FC<ActivityTimelineCardProps> = ({
  state,
  onNavigateTab,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week'>('today');
  const [viewMode, setViewMode] = useState<'screen' | 'prayer'>('screen');
  const todayStr = getTodayDateString();
  const todayProgress = getTodayProgress(state, todayStr);
  const fbMinutes = todayProgress.log.facebookMinutes || 0;

  // Hourly simulated/logged activity distribution (12 AM to 11 PM)
  // Reflects real daily rhythm: Fajr prayer, morning deep work, afternoon check, evening tilawat
  const hourlyData = [
    { hour: 'রাত ১২টা', minutes: 0, label: 'ঘুম' },
    { hour: '২টা', minutes: 0, label: 'ঘুম' },
    { hour: '৪টা', minutes: 5, label: 'তাহাজ্জুদ' },
    { hour: 'সকাল ৬টা', minutes: 12, label: 'ফজর ও আযকার' },
    { hour: '৮টা', minutes: 8, label: 'কুরআন তাদাব্বুর' },
    { hour: '১০টা', minutes: 25, label: 'ডিপ-ওয়ার্ক' },
    { hour: 'দুপুর ১২টা', minutes: 15, label: 'জোহর সালাত' },
    { hour: '২টা', minutes: Math.min(20, Math.floor(fbMinutes * 0.3)), label: 'সোশ্যাল চেক' },
    { hour: 'বিকাল ৪টা', minutes: 18, label: 'আসর ও ব্যায়াম' },
    { hour: 'মাগরিব', minutes: 10, label: 'মাগরিব ও নফল' },
    { hour: 'রাত ৮টা', minutes: Math.min(25, Math.floor(fbMinutes * 0.5)), label: 'বই অধ্যয়ন' },
    { hour: 'মধ্যরাত', minutes: Math.min(15, Math.floor(fbMinutes * 0.2)), label: 'ইশা ও ডায়েরি' },
  ];

  const maxMinutes = 40;

  // Social App breakdown pills (matching screenshot 3)
  const appBreakdown = [
    { name: 'Facebook', icon: 'f', color: 'bg-blue-50 text-blue-700 border-blue-200', count: `${fbMinutes} মি.` },
    { name: 'YouTube', icon: '▶', color: 'bg-rose-50 text-rose-700 border-rose-200', count: '০ মি.' },
    { name: 'Instagram', icon: '📷', color: 'bg-purple-50 text-purple-700 border-purple-200', count: '০ মি.' },
    { name: 'Quran/App', icon: '📖', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', count: '৪৫ মি.' },
    { name: 'Deep Work', icon: '🎯', color: 'bg-amber-50 text-amber-800 border-amber-200', count: '২ ঘণ্টা' },
  ];

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header: Total Screen Time & Navigation (KahfGuard Style) */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {fbMinutes}
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">
              <p>মিনিট স্ক্রিন টাইম</p>
              <p className="text-[11px] text-emerald-700 font-semibold">
                {fbMinutes <= 30 ? '✓ নিরাপদ সীমার মধ্যে আছে' : '⚠️ সীমা অতিক্রম করেছে'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('progress')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all cursor-pointer"
        >
          <span>আরো দেখুন</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7-Day Mini Bar Trend Pills (Screenshot 3 KahfGuard style) */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-slate-500">
          <span>প্রতিদিন ব্যবহার ও ফোকাস · গত ৭ দিন</span>
          <span className="text-emerald-700 font-black">গড়: ২৩ মি./দিন</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 h-9 items-end">
          {[15, 30, 20, 10, 45, 25, fbMinutes || 20].map((val, idx) => {
            const isToday = idx === 6;
            const isSafe = val <= 30;
            const barHeight = Math.max(20, Math.min(100, (val / 60) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-1 group relative">
                <div
                  className={`w-full rounded-md transition-all ${
                    isToday
                      ? isSafe
                        ? 'bg-emerald-600 ring-2 ring-emerald-300'
                        : 'bg-rose-500 ring-2 ring-rose-300'
                      : isSafe
                      ? 'bg-slate-300 hover:bg-emerald-400'
                      : 'bg-rose-300 hover:bg-rose-400'
                  }`}
                  style={{ height: `${barHeight}%` }}
                  title={`${val} মিনিট`}
                />
                <span className={`text-[9px] font-bold ${isToday ? 'text-emerald-800' : 'text-slate-400'}`}>
                  {isToday ? 'আজ' : `D${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* App Breakdown Tags (Screenshot 3 KahfGuard pill style) */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-[11px] font-bold text-slate-500 mb-2">আজকের ডিজিটাল সময় বিভাজন:</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {appBreakdown.map((app, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shrink-0 ${app.color}`}
            >
              <span className="text-[11px]">{app.icon}</span>
              <span>{app.name}</span>
              <span className="opacity-90">{app.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Hourly Timeline Chart (Screenshot 3 KahfGuard Style) */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span>দৈনিক ২৪ ঘণ্টার অ্যাক্টিভিটি টাইমলাইন</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                timeFilter === 'today' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              আজ ▾
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'screen' ? 'prayer' : 'screen')}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              title="ভিউ মোড পরিবর্তন"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chart Canvas with Mint Backdrop and Gridlines */}
        <div className="relative rounded-2xl bg-[#EAFBF3]/60 border border-[#B2F0D4] p-3 sm:p-4">
          {/* Horizontal Reference Lines */}
          <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-emerald-300 w-full" />
            <div className="border-b border-emerald-300 w-full" />
            <div className="border-b border-emerald-300 w-full" />
            <div className="border-b border-emerald-300 w-full" />
          </div>

          {/* Bar Chart Bars */}
          <div className="relative z-10 grid grid-cols-12 gap-1 sm:gap-2 h-24 items-end">
            {hourlyData.map((item, idx) => {
              const heightPct = Math.max(10, Math.min(100, (item.minutes / maxMinutes) * 100));
              const isHighlight = item.minutes > 15;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isHighlight
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-700 group-hover:to-teal-500'
                        : 'bg-emerald-400/70 group-hover:bg-emerald-500'
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${item.hour}: ${item.minutes} মিনিট - ${item.label}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Horizontal Time Labels */}
          <div className="flex justify-between text-[10px] font-bold text-emerald-900/80 mt-2 pt-1 border-t border-emerald-200">
            <span>রাত ১২টা</span>
            <span>সকাল ৬টা</span>
            <span>দুপুর ১২টা</span>
            <span>মাগরিব</span>
            <span>মধ্যরাত</span>
          </div>
        </div>
      </div>
    </div>
  );
};
