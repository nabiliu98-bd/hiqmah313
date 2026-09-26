import React, { useState, useEffect } from 'react';
import { AppState, DailyLog } from '../types';
import { getTodayProgress } from '../utils/scoring';
import { saveDirectToDisk, loadDirectFromDisk, getLastLocalSyncTime, recordLocalSyncTime } from '../utils/localDiskSync';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Smartphone,
  Target,
  Moon,
  BookOpen,
  Users,
  Flame,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Download,
  Upload,
  History,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  XCircle,
  MinusCircle,
  Check,
  X,
  Minus,
} from 'lucide-react';

interface TodayViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOpenMotivation: () => void;
  dateOverride?: string;
}

export const TodayView: React.FC<TodayViewProps> = ({
  state,
  onUpdateState,
  dateOverride,
}) => {
  // Today's real date
  const realTodayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(dateOverride || realTodayStr);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [lastSyncText, setLastSyncText] = useState<string>(getLastLocalSyncTime());
  const [diskBackupToast, setDiskBackupToast] = useState<string | null>(null);

  // Sync date if dateOverride changes from outside
  useEffect(() => {
    if (dateOverride) {
      setSelectedDate(dateOverride);
    }
  }, [dateOverride]);

  // Current selected date log
  const todayProgress = getTodayProgress(state, selectedDate);
  const currentLog = todayProgress.log;

  const [fbMinutes, setFbMinutes] = useState(currentLog.facebookMinutes || 0);
  const [notes, setNotes] = useState(currentLog.notes || '');

  // Automatically sync local inputs whenever selectedDate changes
  useEffect(() => {
    const log = state.dailyLogs[selectedDate];
    if (log) {
      setFbMinutes(log.facebookMinutes || 0);
      setNotes(log.notes || '');
    } else {
      setFbMinutes(0);
      setNotes('');
    }
  }, [selectedDate, state.dailyLogs]);

  // Quick date navigation
  const changeDateBy = (offsetDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offsetDays);
    const nextDate = d.toISOString().split('T')[0];
    setSelectedDate(nextDate);
  };

  // Preset selection
  const selectPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Helper to calculate streak for a specific task
  const getTaskStreak = (taskKey: string): { current: number; max: number } => {
    const dates = Object.keys(state.dailyLogs).sort();
    if (dates.length === 0) return { current: 0, max: 0 };

    let current = 0;
    let max = 0;
    let streak = 0;

    // Calculate max streak across all time
    for (const d of dates) {
      const log = state.dailyLogs[d];
      if (log && log.completedTasks && log.completedTasks.includes(taskKey)) {
        streak++;
        if (streak > max) max = streak;
      } else {
        streak = 0;
      }
    }

    // Calculate current continuous streak starting backwards from today/yesterday
    let checkDate = new Date();
    // If today is not yet done, start checking from yesterday to see current active streak
    const todayLog = state.dailyLogs[realTodayStr];
    if (todayLog && todayLog.completedTasks && todayLog.completedTasks.includes(taskKey)) {
      current++;
    }

    // Check consecutive past days
    for (let i = 1; i <= 180; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const pastLog = state.dailyLogs[dStr];
      if (pastLog && pastLog.completedTasks && pastLog.completedTasks.includes(taskKey)) {
        current++;
      } else {
        break;
      }
    }

    return { current, max: Math.max(max, current, 1) };
  };

  // 3-State Action Setter: 'done' | 'missed' | 'pending'
  const handleSetTaskStatus = (taskKey: string, status: 'done' | 'missed' | 'pending') => {
    onUpdateState((prev) => {
      const prevLog: DailyLog = prev.dailyLogs[selectedDate] || {
        date: selectedDate,
        facebookMinutes: fbMinutes,
        tahajjudDone: false,
        fastingDone: false,
        goalTaskDone: false,
        quranStudyDone: false,
        bookStudyDone: false,
        leadershipTaskDone: false,
        deepWorkDone: false,
        applicableTasks: ['facebook', 'goal', 'tahajjud', 'fasting', 'quran', 'book', 'leadership'],
        completedTasks: [],
        missedTasks: [],
        notes,
      };

      const prevCompleted = prevLog.completedTasks || [];
      const prevMissed = prevLog.missedTasks || [];

      let newCompleted = [...prevCompleted];
      let newMissed = [...prevMissed];

      if (status === 'done') {
        if (!newCompleted.includes(taskKey)) newCompleted.push(taskKey);
        newMissed = newMissed.filter((k) => k !== taskKey);

        // Confetti if user completed all applicable tasks!
        if (newCompleted.length >= prevLog.applicableTasks.length) {
          try {
            confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
          } catch {}
        }
      } else if (status === 'missed') {
        newCompleted = newCompleted.filter((k) => k !== taskKey);
        if (!newMissed.includes(taskKey)) newMissed.push(taskKey);
      } else {
        // 'pending' / reset
        newCompleted = newCompleted.filter((k) => k !== taskKey);
        newMissed = newMissed.filter((k) => k !== taskKey);
      }

      const updatedLog: DailyLog = {
        ...prevLog,
        completedTasks: newCompleted,
        missedTasks: newMissed,
        tahajjudDone: taskKey === 'tahajjud' ? status === 'done' : prevLog.tahajjudDone,
        fastingDone: taskKey === 'fasting' ? status === 'done' : prevLog.fastingDone,
        goalTaskDone: taskKey === 'goal' ? status === 'done' : prevLog.goalTaskDone,
        quranStudyDone: taskKey === 'quran' ? status === 'done' : prevLog.quranStudyDone,
        bookStudyDone: taskKey === 'book' ? status === 'done' : prevLog.bookStudyDone,
        leadershipTaskDone: taskKey === 'leadership' ? status === 'done' : prevLog.leadershipTaskDone,
        deepWorkDone: taskKey === 'deepwork' ? status === 'done' : prevLog.deepWorkDone,
      };

      // Sync arrays for Tahajjud / Fasting
      let newTahajjud = [...prev.tahajjudCompletedDates];
      if (taskKey === 'tahajjud') {
        if (status === 'done' && !newTahajjud.includes(selectedDate)) {
          newTahajjud.push(selectedDate);
        } else if (status !== 'done') {
          newTahajjud = newTahajjud.filter((d) => d !== selectedDate);
        }
      }

      let newFasting = [...prev.fastingCompletedDates];
      if (taskKey === 'fasting') {
        if (status === 'done' && !newFasting.includes(selectedDate)) {
          newFasting.push(selectedDate);
        } else if (status !== 'done') {
          newFasting = newFasting.filter((d) => d !== selectedDate);
        }
      }

      recordLocalSyncTime();
      setLastSyncText(getLastLocalSyncTime());

      return {
        ...prev,
        tahajjudCompletedDates: newTahajjud,
        fastingCompletedDates: newFasting,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: updatedLog,
        },
      };
    });
  };

  // Toggle whether Fasting is applicable today
  const handleToggleApplicable = (taskKey: string) => {
    onUpdateState((prev) => {
      const prevLog: DailyLog = prev.dailyLogs[selectedDate] || {
        date: selectedDate,
        facebookMinutes: fbMinutes,
        tahajjudDone: false,
        fastingDone: false,
        goalTaskDone: false,
        quranStudyDone: false,
        bookStudyDone: false,
        leadershipTaskDone: false,
        deepWorkDone: false,
        applicableTasks: ['facebook', 'goal', 'tahajjud', 'fasting', 'quran', 'book', 'leadership'],
        completedTasks: [],
        missedTasks: [],
      };

      const isApplicable = prevLog.applicableTasks.includes(taskKey);
      const newApplicable = isApplicable
        ? prevLog.applicableTasks.filter((k) => k !== taskKey)
        : [...prevLog.applicableTasks, taskKey];
      const newCompleted = (prevLog.completedTasks || []).filter((k) => newApplicable.includes(k));
      const newMissed = (prevLog.missedTasks || []).filter((k) => newApplicable.includes(k));

      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...prevLog,
            applicableTasks: newApplicable,
            completedTasks: newCompleted,
            missedTasks: newMissed,
          },
        },
      };
    });
  };

  // Save notes & Facebook minutes to storage
  const handleSaveDaily = () => {
    onUpdateState((prev) => {
      const prevLog = prev.dailyLogs[selectedDate] || {
        date: selectedDate,
        facebookMinutes: 0,
        tahajjudDone: false,
        fastingDone: false,
        goalTaskDone: false,
        quranStudyDone: false,
        bookStudyDone: false,
        leadershipTaskDone: false,
        deepWorkDone: false,
        applicableTasks: ['facebook', 'goal', 'tahajjud', 'fasting', 'quran', 'book', 'leadership'],
        completedTasks: [],
        missedTasks: [],
      };

      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...prevLog,
            facebookMinutes: fbMinutes,
            notes,
          },
        },
      };
    });

    setDiskBackupToast('✅ দৈনিক নোট ও সময় সংরক্ষিত হয়েছে!');
    setTimeout(() => setDiskBackupToast(null), 3000);
  };

  // Export to disk
  const handleExportToDisk = async () => {
    const res = await saveDirectToDisk(state);
    if (res.success) {
      setDiskBackupToast(`✅ লোকাল ডিস্কে ব্যাকআপ ফাইল সেভ হয়েছে: ${res.filename}`);
      setLastSyncText(getLastLocalSyncTime());
      setTimeout(() => setDiskBackupToast(null), 4000);
    }
  };

  // Import from disk
  const handleImportFromDisk = async () => {
    const loaded = await loadDirectFromDisk();
    if (loaded) {
      onUpdateState(() => loaded);
      setDiskBackupToast('✅ লোকাল ডিস্ক থেকে ডেটা সফলভাবে রিস্টোর হয়েছে!');
      setLastSyncText(getLastLocalSyncTime());
      setTimeout(() => setDiskBackupToast(null), 4000);
    }
  };

  // Format date display
  const formatBengaliDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        return `${days[d.getDay()]}, ${parts[2]} ${months[d.getMonth()]} ${parts[0]}`;
      }
    } catch {}
    return dateStr;
  };

  const loggedDatesList = Object.keys(state.dailyLogs).sort().reverse();

  // Tasks definitions matching KahfGuard soft pastel card layout
  const tasksDefinition = [
    {
      key: 'facebook',
      iconEmoji: '📱',
      title: 'Social Media নিয়ন্ত্রণ',
      categoryTag: '📱 ডিজিটাল সচেতনতা',
      subtitle: 'অপ্রয়োজনীয় স্ক্রল পরিহার ও দিনে সর্বোচ্চ ৩০ মিনিট',
      hasInput: true,
      cardBg: 'bg-[#FFF9EA]',
      borderColor: 'border-[#FFE8B4]',
      iconBg: 'bg-[#FFF0C7]',
    },
    {
      key: 'quran',
      iconEmoji: '🕌',
      title: 'কুরআন পড়া ও তাদাব্বুর',
      categoryTag: '🕌 দ্বীন ও ইবাদত',
      timeTag: '⏱️ ১৫ মিনিট',
      subtitle: 'অর্থ বুঝে প্রতিদিন কুরআন তিলাওয়াত ও তাদাব্বুর',
      cardBg: 'bg-[#EAFBF3]',
      borderColor: 'border-[#B2F0D4]',
      iconBg: 'bg-[#D2F6E5]',
    },
    {
      key: 'tahajjud',
      iconEmoji: '🌙',
      title: 'তাহাজ্জুদ সালাত',
      categoryTag: '🕌 দ্বীন ও ইবাদত',
      subtitle: 'রাতের শেষ তৃতীয়াংশে সালাত আদায় ও একান্ত মুনাজাত',
      cardBg: 'bg-[#EEF1FF]',
      borderColor: 'border-[#D6DDFF]',
      iconBg: 'bg-[#DDE3FF]',
    },
    {
      key: 'goal',
      iconEmoji: '🎯',
      title: 'আজকের Goal সম্পন্ন করা',
      categoryTag: '🎯 আজকের Goal',
      subtitle: state.personalGoal?.title || 'ব্যক্তিগত লক্ষ্যের আজকের নির্ধারিত কাজ সম্পন্ন করা',
      cardBg: 'bg-[#FAF0FF]',
      borderColor: 'border-[#F0D5FF]',
      iconBg: 'bg-[#F3D9FF]',
    },
    {
      key: 'fasting',
      iconEmoji: '🌟',
      title: 'সিয়াম সাধনা (নফল রোজা)',
      categoryTag: '🕌 নফল ইবাদত',
      subtitle: 'সোমবার/বৃহস্পতিবার অথবা আইয়ামে বীজের নফল সিয়াম',
      canToggleApplicable: true,
      cardBg: 'bg-[#FFF8E7]',
      borderColor: 'border-[#FEDE9A]',
      iconBg: 'bg-[#FFECC2]',
    },
    {
      key: 'book',
      iconEmoji: '📚',
      title: 'ইসলামিক বই অধ্যয়ন',
      categoryTag: '📚 ইলম চর্চা',
      timeTag: '⏱️ ২০ মিনিট',
      subtitle: 'সিরাত, তাফসির বা আদর্শিক বই নিয়মিত পাঠ ও নোট গ্রহণ',
      cardBg: 'bg-[#EBF9FB]',
      borderColor: 'border-[#BCEFF5]',
      iconBg: 'bg-[#CEF4F4]',
    },
    {
      key: 'leadership',
      iconEmoji: '👥',
      title: 'লিডারশিপ ও সমাজসেবা',
      categoryTag: '🤝 উম্মাহ সেবা',
      subtitle: 'যুবসমাজকে সচেতনকরণ, দায়িত্ব পালন ও নিয়মিত যোগাযোগ',
      cardBg: 'bg-[#FFF1F2]',
      borderColor: 'border-[#FED7AA]',
      iconBg: 'bg-[#FFE2E5]',
    },
  ];

  return (
    <div className="space-y-4 pb-28">
      {/* 1. HEADER CARD (ব্যক্তিগত প্রগ্রেস ট্র্যাকার - Matching User's Image 2) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#0A3B2C] tracking-tight">
                ব্যক্তিগত প্রগ্রেস ট্র্যাকার
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                Daily Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              অভ্যাস গঠন, লক্ষ্য বাস্তবায়ন ও ধারাবাহিক অগ্রগতি
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
          className="w-9 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
          title="বিগত দিনের হিস্টোরি দেখুন"
        >
          <History className="w-4 h-4" />
        </button>
      </section>

      {/* 2. DATE SELECTOR BAR (< ১৭ সেপ্টেম্বর ২০২৬ [আজ] >) */}
      <section className="p-2 sm:p-2.5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-center justify-between gap-2">
        <button
          onClick={() => changeDateBy(-1)}
          className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer border border-slate-200"
          title="পূর্ববর্তী দিন"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {formatBengaliDate(selectedDate)}
          </span>

          {selectedDate === realTodayStr ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-bold">
              আজ
            </span>
          ) : (
            <button
              onClick={() => setSelectedDate(realTodayStr)}
              className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold transition-colors cursor-pointer"
            >
              আজকে ফিরে যান
            </button>
          )}
        </div>

        <button
          onClick={() => changeDateBy(1)}
          className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer border border-slate-200"
          title="পরবর্তী দিন"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* Collapsible History Drawer */}
      {showHistoryDrawer && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 animate-in fade-in shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700">সংরক্ষিত তারিখের তালিকা</span>
            <span className="text-[11px] text-slate-400 font-normal">যেকোনো তারিখে ক্লিক করে রিপোর্ট দেখুন</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
            {loggedDatesList.map((dt) => {
              const log = state.dailyLogs[dt];
              const count = log?.completedTasks?.length || 0;
              const total = log?.applicableTasks?.length || 6;
              const isCurrent = dt === selectedDate;

              return (
                <button
                  key={dt}
                  onClick={() => {
                    setSelectedDate(dt);
                    setShowHistoryDrawer(false);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-300 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{dt}</div>
                  <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-emerald-100' : 'text-emerald-700'}`}>
                    {count}/{total} সম্পন্ন
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAILY PROGRESS BANNER */}
      <section className="p-4 rounded-2xl bg-gradient-to-br from-[#0A3B2C] to-[#06281F] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
            {selectedDate}-এর অগ্রগতি
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {todayProgress.percentage}%
            </span>
            <span className="text-xs text-emerald-200 font-medium">
              ({todayProgress.completedCount} / {todayProgress.totalCount} টি আমল সম্পন্ন)
            </span>
          </div>
        </div>

        <div className="w-full sm:w-56 h-3 rounded-full bg-emerald-950/80 overflow-hidden border border-emerald-600/40 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${todayProgress.percentage}%` }}
          />
        </div>
      </section>

      {/* 4. HABIT CARDS (Matching User's Sample Layout Exactly) */}
      <div className="space-y-3">
        {tasksDefinition.map((task) => {
          const isApplicable = currentLog.applicableTasks?.includes(task.key) ?? true;
          const isDone = currentLog.completedTasks?.includes(task.key) ?? false;
          const isMissed = currentLog.missedTasks?.includes(task.key) ?? false;
          const isPending = isApplicable && !isDone && !isMissed;
          const taskStreak = getTaskStreak(task.key);

          return (
            <div
              key={task.key}
              className={`p-4 rounded-2xl border transition-all ${
                !isApplicable
                  ? 'bg-slate-50/70 border-slate-200 opacity-60'
                  : `${task.cardBg || 'bg-white'} ${task.borderColor || 'border-slate-200'} hover:shadow-xs`
              }`}
            >
              {/* Header inside card: Icon, Title, Badges */}
              <div className="flex items-start gap-3">
                {/* Left Emoji/Icon Box (KahfGuard Rounded Square) */}
                <div className={`w-12 h-12 rounded-2xl ${task.iconBg || 'bg-slate-100'} border border-black/5 flex items-center justify-center text-xl shrink-0 shadow-2xs`}>
                  {task.iconEmoji}
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      {task.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
                      {task.categoryTag}
                    </span>
                    {task.timeTag && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                        {task.timeTag}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {task.subtitle}
                  </p>

                  {/* Streak Flame Pill */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{taskStreak.current} Days Streak</span>
                      <span className="text-amber-600/70 font-normal">| সর্বোচ্চ: {taskStreak.max} দিন</span>
                    </div>

                    {task.canToggleApplicable && (
                      <button
                        onClick={() => handleToggleApplicable(task.key)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          isApplicable
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isApplicable ? 'আজ প্রযোজ্য' : 'আজ প্রযোজ্য নয়'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row: [ ✓✓ ] [ ✕✕ ] [ -- ] */}
              {isApplicable && (
                <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-100">
                  {/* Done Button [ ✓✓ ] */}
                  <button
                    onClick={() => handleSetTaskStatus(task.key, isDone ? 'pending' : 'done')}
                    className={`flex-1 sm:flex-initial sm:w-28 py-2 px-3 rounded-xl font-black text-sm flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20 ring-2 ring-emerald-600'
                        : 'bg-slate-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                    title="সম্পন্ন হয়েছে চিহ্নিত করুন"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <Check className="w-4 h-4 stroke-[3] -ml-2.5" />
                  </button>

                  {/* Missed Button [ ✕✕ ] */}
                  <button
                    onClick={() => handleSetTaskStatus(task.key, isMissed ? 'pending' : 'missed')}
                    className={`flex-1 sm:flex-initial sm:w-28 py-2 px-3 rounded-xl font-black text-sm flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      isMissed
                        ? 'bg-rose-600 text-white shadow-rose-600/20 ring-2 ring-rose-600'
                        : 'bg-slate-50 hover:bg-rose-50 text-rose-600 border border-rose-200'
                    }`}
                    title="মিস হয়েছে চিহ্নিত করুন"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    <X className="w-4 h-4 stroke-[3] -ml-2.5" />
                  </button>

                  {/* Pending / Neutral Button [ -- ] */}
                  <button
                    onClick={() => handleSetTaskStatus(task.key, 'pending')}
                    className={`flex-1 sm:flex-initial sm:w-28 py-2 px-3 rounded-xl font-black text-sm flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      isPending
                        ? 'bg-slate-700 text-white ring-2 ring-slate-700'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                    title="পেন্ডিং বা অপরিবর্তিত রাখুন"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                    <Minus className="w-4 h-4 stroke-[3] -ml-2.5" />
                  </button>
                </div>
              )}

              {/* Social Media Minute Input Field */}
              {task.hasInput && isApplicable && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">আজকের ফেসবুক/স্ক্রল সময়:</span>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={fbMinutes}
                      onChange={(e) => setFbMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 font-bold text-center text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500 font-medium">মিনিট</span>
                  </div>

                  {fbMinutes > 30 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      ৩০ মিনিটের বেশি হয়েছে (সীমা অতিক্রম)
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      লক্ষ্য: ৩০ মিনিটের মধ্যে রাখা
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. DAILY NOTES & LOCAL DISK SYNC SECTION */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">
            দৈনিক নোট ও আত্মপর্যালোচনা (Muhasabah)
          </h4>
          <span className="text-[11px] text-slate-400">লোকাল স্টোরেজে সংরক্ষিত</span>
        </div>

        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="আজকের দিনটি কেমন কাটল? কোনো ভুল বা বিশেষ উপলব্ধি থাকলে লিখুন..."
          className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleSaveDaily}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-all active:scale-95"
          >
            নোট ও সময় সেভ করুন
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportToDisk}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="কম্পিউটার বা ফোনে ব্যাকআপ ফাইল ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডিস্কে ব্যাকআপ</span>
            </button>

            <button
              onClick={handleImportFromDisk}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="ব্যাকআপ ফাইল থেকে ডেটা রিস্টোর করুন"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>রিস্টোর</span>
            </button>
          </div>
        </div>
      </section>

      {/* Disk Backup Toast */}
      {diskBackupToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white border border-emerald-500 text-xs font-bold shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {diskBackupToast}
        </div>
      )}
    </div>
  );
};
