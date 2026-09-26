import React, { useState } from 'react';
import { AppState } from '../types';
import { Calendar, X, CheckCircle2, XCircle, Clock, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTodayDateString } from '../utils/storage';

interface CalendarModalProps {
  state: AppState;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  state,
  onSelectDate,
  onClose,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(todayStr);

  const daysInMonth = 30;
  const monthName = 'September 2026';

  const daysList = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = idx + 1;
    const dateStr = `2026-09-${day < 10 ? '0' + day : day}`;
    const log = state.dailyLogs[dateStr];

    let pct = 0;
    let label = '✕';
    let statusClass = 'bg-slate-50 border-slate-200 text-slate-400';

    if (log) {
      const total = log.applicableTasks?.length || 6;
      const completed = log.completedTasks?.length || 0;
      pct = Math.round((completed / Math.max(1, total)) * 100);

      if (pct >= 85) {
        label = '✓';
        statusClass = 'bg-emerald-600 text-white border-emerald-700 font-bold';
      } else if (pct > 0) {
        label = `${pct}%`;
        statusClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      } else {
        label = '✕';
        statusClass = 'bg-rose-50 border-rose-200 text-rose-500 font-semibold';
      }
    }

    return {
      day,
      dateStr,
      pct,
      label,
      statusClass,
      log,
    };
  });

  const activeDayLog = selectedDayDetail ? state.dailyLogs[selectedDayDetail] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-emerald-100 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                মাসিক ক্যালেন্ডার ও দৈনিক হিস্টোরি
              </h3>
              <p className="text-xs text-slate-500">{monthName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
            <span>সম্পূর্ণ (৮৫%+)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block" />
            <span>আংশিক</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-md bg-rose-50 border border-rose-200 inline-block" />
            <span>অনুপস্থিত</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
          {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'].map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400">
              {d}
            </div>
          ))}

          {daysList.map((item) => {
            const isSelected = item.dateStr === selectedDayDetail;

            return (
              <button
                key={item.day}
                onClick={() => setSelectedDayDetail(item.dateStr)}
                className={`p-2 rounded-xl text-center transition-all border cursor-pointer ${item.statusClass} ${
                  isSelected ? 'ring-2 ring-emerald-500 scale-105 shadow-xs' : ''
                }`}
              >
                <div className="text-xs font-black">{item.day}</div>
                <div className="text-[9px] mt-0.5">{item.label}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Quick Card */}
        {selectedDayDetail && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                তারিখ: {selectedDayDetail}
              </span>
              <button
                onClick={() => {
                  onSelectDate(selectedDayDetail);
                  onClose();
                }}
                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
              >
                আজকে এই দিনে লগ দেখুন / এডিট করুন
              </button>
            </div>

            {activeDayLog ? (
              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <strong>সম্পন্ন আমল:</strong> {activeDayLog.completedTasks?.length || 0} টি
                </div>
                <div>
                  <strong>ফেসবুক স্ক্রল সময়:</strong> {activeDayLog.facebookMinutes || 0} মিনিট
                </div>
                {activeDayLog.notes && (
                  <div className="italic text-slate-500">
                    “{activeDayLog.notes}”
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400">এই দিনে কোনো তথ্য রেকর্ড করা হয়নি।</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
