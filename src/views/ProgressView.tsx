import React, { useState } from 'react';
import { AppState } from '../types';
import { calculateScores, generateWeeklyReport, generateMonthlyReport, calculateStreak } from '../utils/scoring';
import { getTodayDateString } from '../utils/storage';
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
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Flame,
  Award,
  Lock,
  FileCheck,
  ChevronRight,
  Sparkles,
  Download,
  FileText,
} from 'lucide-react';
import { MudirReportModal } from '../components/MudirReportModal';

interface ProgressViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOpenDayLog?: (date: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  state,
  onUpdateState,
  onOpenDayLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'weekly' | 'monthly' | 'sixMonths'>('monthly');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [isMudirReportOpen, setIsMudirReportOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'monthly' | 'weekly' | 'sixMonths'>('monthly');

  const scores = calculateScores(state);
  const weeklyData = generateWeeklyReport(state, selectedWeek);
  const monthlyData = generateMonthlyReport(state, selectedMonth);
  const streak = calculateStreak(state.dailyLogs, getTodayDateString());

  // Category comparison data for Recharts Bar Chart
  const chartData = scores.breakdown.map((cat) => ({
    name: cat.nameBn.length > 12 ? cat.nameBn.substring(0, 11) + '..' : cat.nameBn,
    fullName: cat.nameBn,
    score: cat.obtained,
    max: cat.total,
    percentage: cat.percentage,
  }));

  // Heatmap generation for past 28 days
  const today = new Date();
  const heatmapDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = state.dailyLogs[dateStr];

    const completedCount = log?.completedTasks?.length || 0;
    const totalCount = log?.applicableTasks?.length || 6;
    const pct = Math.round((completedCount / totalCount) * 100);

    let status = 'none';
    if (completedCount >= 5) status = 'completed';
    else if (completedCount > 0) status = 'partial';

    return {
      dateStr,
      dayNum: d.getDate(),
      status,
      pct,
    };
  });

  return (
    <div className="space-y-4 pb-28">
      {/* 1. TOP HEADER BANNER (Deep Emerald + Gold) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0A3B2C] via-[#0D4E3A] to-[#06281F] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
              Youth of hiqmah System
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            অগ্রগতি মূল্যায়ন ও পারফরম্যান্স রিপোর্ট
          </h2>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            দৈনিক, সাপ্তাহিক, মাসিক ও ৬ মাসের পূর্ণাঙ্গ রূপান্তর ডাটা অ্যানালিটিক্স
          </p>
        </div>

        {/* Mudir Print Button */}
        <button
          onClick={() => {
            setReportModalType(activeSubTab === 'weekly' ? 'weekly' : activeSubTab === 'sixMonths' ? 'sixMonths' : 'monthly');
            setIsMudirReportOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>মুদির রিপোর্ট (PDF ডাউনলোড/প্রিন্ট)</span>
        </button>
      </section>

      {/* 2. SUBTABS SELECTOR */}
      <section className="bg-white p-1.5 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-xs">
        {[
          { id: 'daily', labelBn: 'দৈনিক ক্যালেন্ডার' },
          { id: 'weekly', labelBn: 'সাপ্তাহিক রিপোর্ট' },
          { id: 'monthly', labelBn: 'মাসিক মূল্যায়ন' },
          { id: 'sixMonths', labelBn: '৬ মাসের জার্নি' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`btn-progress-subtab-${tab.id}`}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-800'
            }`}
          >
            {tab.labelBn}
          </button>
        ))}
      </section>

      {/* SUB-TAB 1: DAILY HEATMAP */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  ধারাবাহিকতা হিটম্যাপ (বিগত ২৮ দিন)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  গাঢ় সবুজ = ৭৫%+ সম্পন্ন | হালকা = আংশিক | ধূসর = অসম্পূর্ণ
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{streak} Days Streak</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 gap-2 pt-2">
              {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'].map((d) => (
                <div key={d} className="text-center text-[11px] font-bold text-slate-400">
                  {d}
                </div>
              ))}
              {heatmapDays.map((item) => (
                <div
                  key={item.dayNum}
                  onClick={() => onOpenDayLog && onOpenDayLog(item.dateStr)}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center cursor-pointer transition-all border ${
                    item.status === 'completed'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs hover:scale-105'
                      : item.status === 'partial'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:scale-105'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-emerald-200'
                  }`}
                  title={`${item.dateStr}: ${item.pct}% সম্পন্ন`}
                >
                  <span className="text-xs font-bold">{item.dayNum}</span>
                  <span className="text-[9px] mt-0.5 font-semibold">
                    {item.status === 'completed' ? '✓' : item.status === 'partial' ? `${item.pct}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WEEKLY EVALUATION */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Week Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[0, 1, 2, 3].map((wIdx) => (
              <button
                key={wIdx}
                onClick={() => setSelectedWeek(wIdx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedWeek === wIdx
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                }`}
              >
                সপ্তাহ ০{wIdx + 1}
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700">
                  সাপ্তাহিক মূল্যায়ন রিপোর্ট
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  সপ্তাহ {selectedWeek + 1}-এর পারফরম্যান্স
                </h3>
                <p className="text-xs text-slate-500">
                  সময়কাল: {weeklyData.startDate} থেকে {weeklyData.endDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">সাপ্তাহিক অর্জন</div>
                  <div className="text-2xl font-black text-emerald-700">{weeklyData.completionRate}%</div>
                </div>
                <button
                  onClick={() => {
                    setReportModalType('weekly');
                    setIsMudirReportOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-emerald-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Category-wise Performance */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                স্তম্ভভিত্তিক পারফরম্যান্স
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {weeklyData.categoryBreakdown.map((cat, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-700">{cat.categoryName}</span>
                    <span className="text-xs font-bold text-emerald-800">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed vs Incomplete */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  কী কী সম্পন্ন হয়েছে (Completed)
                </div>
                <ul className="text-xs text-slate-700 space-y-1 pl-5 list-disc">
                  {weeklyData.completedItems.slice(0, 4).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <XCircle className="w-4 h-4 text-amber-600" />
                  উন্নতি আবশ্যক ক্ষেত্রসমূহ
                </div>
                <ul className="text-xs text-slate-700 space-y-1 pl-5 list-disc">
                  {weeklyData.incompleteItems.slice(0, 3).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                  {weeklyData.incompleteItems.length === 0 && (
                    <li>আলহামদুলিল্লাহ সকল ক্ষেত্র সাফল্যের সাথে পরিচালিত!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MONTHLY REPORT */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  মাসিক পূর্ণাঙ্গ মূল্যায়ন
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                  {monthlyData.monthName} প্রগ্রেস রিপোর্ট
                </h3>
                <p className="text-xs text-slate-500">
                  অর্জিত সম্মাননা স্তর: <strong className="text-amber-600">{monthlyData.levelBadge}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">প্রাপ্ত মোট নম্বর</div>
                  <div className="text-2xl font-black text-[#0A3B2C]">
                    {monthlyData.totalScore}{' '}
                    <span className="text-xs font-normal text-slate-500">/{monthlyData.maxScore}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-emerald-200" />
                <div className="text-right">
                  <div className="text-[10px] text-emerald-700 uppercase font-semibold">শতাংশ</div>
                  <div className="text-2xl font-black text-emerald-700">{monthlyData.percentage}%</div>
                </div>
              </div>
            </div>

            {/* Category Performance Breakdown List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                মূল স্তম্ভসমূহের পারফরম্যান্স গ্রাফ
              </h4>

              <div className="space-y-2">
                {monthlyData.categories.map((cat) => (
                  <div
                    key={cat.key}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">{cat.name}</span>
                      <span className="text-[11px] text-emerald-700 font-bold ml-2">({cat.percentage}%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 sm:w-40 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900 min-w-12 text-right">
                        {cat.obtained}/{cat.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recharts Bar Chart Visual */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                স্তম্ভভিত্তিক তুলনামূলক চিত্র
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#A7F3D0', borderRadius: '12px', color: '#0A3B2C' }}
                    />
                    <Bar dataKey="score" fill="#16A34A" radius={[6, 6, 0, 0]} name="অর্জিত স্কোর" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: 6 MONTHS JOURNEY */}
      {activeSubTab === 'sixMonths' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                ১৮০ দিনের সামগ্রিক রোডম্যাপ
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                ৬ মাসের রূপান্তর যাত্রা (মাস ১ থেকে মাস ৬)
              </h3>
              <p className="text-xs text-slate-500">
                প্রতি মাসে নতুন টার্গেট, ইসলামিক জ্ঞান ও লিডারশিপ অগ্রগতি
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((m) => {
                const isCurrent = m === 1;
                const isCompleted = m < 1;

                return (
                  <div
                    key={m}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        মাস 0{m}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold">
                          চলমান
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] text-emerald-700 font-bold">সম্পন্ন</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">আসন্ন</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1">
                      {m === 1 ? 'বুনিয়াদ ও অভ্যাস গঠন' : m === 2 ? 'জ্ঞান ও মানসিক শৃঙ্খলা' : m === 3 ? 'কমিটমেন্ট ও দৃঢ়তা' : m === 4 ? 'লিডারশিপ ও সমাজসেবা' : m === 5 ? 'দক্ষতা ও উচ্চ লক্ষ্য' : 'পূর্ণাঙ্গ রূপান্তর'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {m === 1 ? 'টার্গেট: ৮০% ধারাবাহিকতা' : 'পরবর্তী স্তরের দায়িত্ব'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MUDIR REPORT MODAL */}
      <MudirReportModal
        isOpen={isMudirReportOpen}
        onClose={() => setIsMudirReportOpen(false)}
        state={state}
        reportType={reportModalType}
      />
    </div>
  );
};
