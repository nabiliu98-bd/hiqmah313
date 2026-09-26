import React, { useState } from 'react';
import { AppState, DailyLog } from '../types';
import { calculateScores, getTodayProgress, calculateStreak } from '../utils/scoring';
import { getTodayDateString } from '../utils/storage';
import { CircularProgress } from '../components/CircularProgress';
import { ActivityTimelineCard } from '../components/ActivityTimelineCard';
import confetti from 'canvas-confetti';
import {
  Flame,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
  Users,
  BrainCircuit,
  Moon,
  Smartphone,
  Check,
  X,
  Minus,
  AlertTriangle,
  Shield,
  Hourglass,
  Layers,
  Globe,
  HeartHandshake,
} from 'lucide-react';

interface HomeViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onNavigateTab: (tab: 'home' | 'today' | 'progress' | 'goals' | 'profile') => void;
  onOpenMotivation: () => void;
  onSelectCategoryDetail: (categoryKey: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onUpdateState,
  onNavigateTab,
  onOpenMotivation,
  onSelectCategoryDetail,
}) => {
  const todayStr = getTodayDateString();
  const scores = calculateScores(state);
  const streak = calculateStreak(state.dailyLogs, todayStr);
  const todayProgress = getTodayProgress(state, todayStr);

  const [showQuickFbInput, setShowQuickFbInput] = useState(false);
  const [fbMinutesInput, setFbMinutesInput] = useState(todayProgress.log.facebookMinutes || 0);

  // 3-State Action Setter directly from Home
  const handleSetTaskStatus = (taskKey: string, status: 'done' | 'missed' | 'pending') => {
    onUpdateState((prev) => {
      const currentLog: DailyLog = prev.dailyLogs[todayStr] || {
        date: todayStr,
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

      const prevCompleted = currentLog.completedTasks || [];
      const prevMissed = currentLog.missedTasks || [];

      let newCompleted = [...prevCompleted];
      let newMissed = [...prevMissed];

      if (status === 'done') {
        if (!newCompleted.includes(taskKey)) newCompleted.push(taskKey);
        newMissed = newMissed.filter((k) => k !== taskKey);

        if (newCompleted.length >= currentLog.applicableTasks.length) {
          try {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          } catch {}
        }
      } else if (status === 'missed') {
        newCompleted = newCompleted.filter((k) => k !== taskKey);
        if (!newMissed.includes(taskKey)) newMissed.push(taskKey);
      } else {
        newCompleted = newCompleted.filter((k) => k !== taskKey);
        newMissed = newMissed.filter((k) => k !== taskKey);
      }

      const updatedState: AppState = {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [todayStr]: {
            ...currentLog,
            completedTasks: newCompleted,
            missedTasks: newMissed,
            tahajjudDone: taskKey === 'tahajjud' ? status === 'done' : currentLog.tahajjudDone,
            fastingDone: taskKey === 'fasting' ? status === 'done' : currentLog.fastingDone,
            goalTaskDone: taskKey === 'goal' ? status === 'done' : currentLog.goalTaskDone,
            quranStudyDone: taskKey === 'quran' ? status === 'done' : currentLog.quranStudyDone,
            bookStudyDone: taskKey === 'book' ? status === 'done' : currentLog.bookStudyDone,
            leadershipTaskDone: taskKey === 'leadership' ? status === 'done' : currentLog.leadershipTaskDone,
          },
        },
      };

      if (taskKey === 'tahajjud') {
        if (status === 'done' && !updatedState.tahajjudCompletedDates.includes(todayStr)) {
          updatedState.tahajjudCompletedDates = [...updatedState.tahajjudCompletedDates, todayStr];
        } else if (status !== 'done') {
          updatedState.tahajjudCompletedDates = updatedState.tahajjudCompletedDates.filter((d) => d !== todayStr);
        }
      }

      if (taskKey === 'fasting') {
        if (status === 'done' && !updatedState.fastingCompletedDates.includes(todayStr)) {
          updatedState.fastingCompletedDates = [...updatedState.fastingCompletedDates, todayStr];
        } else if (status !== 'done') {
          updatedState.fastingCompletedDates = updatedState.fastingCompletedDates.filter((d) => d !== todayStr);
        }
      }

      return updatedState;
    });
  };

  const handleSaveFacebookMinutes = () => {
    onUpdateState((prev) => {
      const currentLog = prev.dailyLogs[todayStr] || {
        date: todayStr,
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

      const diff = fbMinutesInput - (currentLog.facebookMinutes || 0);
      const newMonthly = Math.max(0, prev.facebookMonthlyMinutes + diff);

      return {
        ...prev,
        facebookMonthlyMinutes: newMonthly,
        dailyLogs: {
          ...prev.dailyLogs,
          [todayStr]: {
            ...currentLog,
            facebookMinutes: fbMinutesInput,
          },
        },
      };
    });
    setShowQuickFbInput(false);
  };

  const todayActionItems = [
    {
      id: 'facebook',
      emoji: '📱',
      title: 'সোশ্যাল মিডিয়া স্ক্রিন টাইম',
      tag: 'ডিজিটাল ফোকাস',
      subtitle: `আজকের ব্যবহার: ${todayProgress.log.facebookMinutes || 0} মি. (টার্গেট: সর্বোচ্চ ৩০ মি.)`,
      hasMinutes: true,
    },
    {
      id: 'quran',
      emoji: '📖',
      title: 'কুরআন তিলাওয়াত ও তাদাব্বুর',
      tag: 'দ্বীন ও ইবাদত',
      subtitle: state.quranStudy.assignedSurahOrJuz || 'অর্থ বুঝে দৈনিক তিলাওয়াত ও আমল',
    },
    {
      id: 'tahajjud',
      emoji: '🌙',
      title: 'তাহাজ্জুদ সালাত',
      tag: 'নফল সালাত',
      subtitle: `চলতি মাসে সম্পন্ন: ${state.tahajjudCompletedDates.length} / ৬ দিন`,
    },
    {
      id: 'goal',
      emoji: '🎯',
      title: 'ব্যক্তিগত ৬ মাসের মূল লক্ষ্য',
      tag: 'ক্যারিয়ার ও স্কিল',
      subtitle: state.personalGoal?.title || 'নির্ধারিত অধ্যায় বা কোডিং প্রজেক্ট',
    },
    {
      id: 'fasting',
      emoji: '🌟',
      title: 'সিয়াম সাধনা (নফল রোজা)',
      tag: 'নফল রোজা',
      subtitle: `চলতি মাসে সম্পন্ন: ${state.fastingCompletedDates.length} / ৬ দিন`,
    },
    {
      id: 'book',
      emoji: '📚',
      title: 'ইসলামিক বই অধ্যয়ন',
      tag: 'ইলম চর্চা',
      subtitle: `${state.bookCircle.book1Title.split('(')[0]} - নির্ধারিত পৃষ্ঠা পাঠ`,
    },
    {
      id: 'leadership',
      emoji: '👥',
      title: 'জবাবদিহিতা ও মুদির রিপোর্ট',
      tag: 'মুদির যোগাযোগ',
      subtitle: 'আমির নির্দেশিত রিপোর্ট ও সার্বিক অগ্রগতি',
    },
  ];

  // KahfGuard Category Pillars (Matching Screenshots 1 & 2)
  const categoryGroups = [
    {
      groupTitle: 'সুরক্ষা ও আত্মশুদ্ধি',
      items: [
        {
          key: 'deen',
          title: '৫ ওয়াক্ত জামাতে সালাত ও তাহাজ্জুদ',
          subtitle: 'দৈনিক সালাত ও আত্মশুদ্ধি চর্চা কনফিগার করুন',
          icon: Moon,
          scoreKey: 'deen',
          cardBg: 'bg-[#EAFBF3]',
          borderColor: 'border-[#B2F0D4]',
          iconBoxBg: 'bg-[#D2F6E5]',
          iconColor: 'text-emerald-700',
        },
        {
          key: 'quran',
          title: 'কুরআন তিলাওয়াত ও তাদাব্বুর',
          subtitle: 'অর্থসহ অনুধাবন ও দৈনিক আযকার সুরক্ষা',
          icon: BookOpen,
          scoreKey: 'quran',
          cardBg: 'bg-[#EBF9FB]',
          borderColor: 'border-[#BCEFF5]',
          iconBoxBg: 'bg-[#CEF4F4]',
          iconColor: 'text-teal-700',
        },
        {
          key: 'facebook',
          title: 'ডিজিটাল ডিটক্স ও রিলস প্রতিরোধ',
          subtitle: 'ফেসবুক, রিলস ও সোশ্যাল মিডিয়া ব্যবহার সীমিত করুন',
          icon: Smartphone,
          scoreKey: 'facebook',
          cardBg: 'bg-[#FFF9EA]',
          borderColor: 'border-[#FFE8B4]',
          iconBoxBg: 'bg-[#FFF0C7]',
          iconColor: 'text-amber-700',
        },
      ],
    },
    {
      groupTitle: 'ক্যারিয়ার, পরিবার ও লক্ষ্য',
      items: [
        {
          key: 'goal',
          title: '৬ মাসের মূল ক্যারিয়ার গোল (২০০ মার্কস)',
          subtitle: 'কোর স্কিল, প্রজেক্ট ও টেকনিক্যাল অগ্রগতি ট্র্যাক করুন',
          icon: Target,
          scoreKey: 'goal',
          cardBg: 'bg-[#EEF1FF]',
          borderColor: 'border-[#D6DDFF]',
          iconBoxBg: 'bg-[#DDE3FF]',
          iconColor: 'text-indigo-700',
        },
        {
          key: 'bookcircle',
          title: 'ধারাবাহিক বই অধ্যয়ন ও ইলম সার্কেল',
          subtitle: 'প্রতি মাসে নির্ধারিত বইয়ের লক্ষ্য ও সংক্ষিপ্ত নোট',
          icon: Layers,
          scoreKey: 'bookcircle',
          cardBg: 'bg-[#FAF0FF]',
          borderColor: 'border-[#F0D5FF]',
          iconBoxBg: 'bg-[#F3D9FF]',
          iconColor: 'text-purple-700',
        },
        {
          key: 'leadership',
          title: 'মুদির ও অ্যাকাউন্টেবিলিটি পার্টনার',
          subtitle: 'বিশ্বস্ত আমির ও পরিচালকের নিকট জবাবদিহিতা শিট পেশ করুন',
          icon: Users,
          scoreKey: 'leadership',
          cardBg: 'bg-[#F0FDF4]',
          borderColor: 'border-[#BBF7D0]',
          iconBoxBg: 'bg-[#DCFCE7]',
          iconColor: 'text-emerald-700',
        },
      ],
    },
  ];

  return (
    <div className="space-y-4 pb-28 font-sans">
      {/* 1. KAHFGUARD STYLE ATTENTION BANNER (Screenshot 1 & 3) */}
      {todayProgress.pendingCount > 0 ? (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#FED7AA] flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-rose-900 truncate">
                আজকের আমল ও স্ক্রিন টাইম লগিং বাকি
              </h4>
              <p className="text-[11px] text-rose-700 font-medium truncate">
                এখনো {todayProgress.pendingCount}টি আমল অপেক্ষমাণ রয়েছে
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('today')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shrink-0 flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <span>লগ করুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#EAFBF3] border border-[#B2F0D4] flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950">
                মাশাআল্লাহ! আজকের সকল আমল সম্পন্ন
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                ধারাবাহিকতা বজায় রাখুন • আল্লাহ আপনার প্রচেষ্টায় বরকত দিন
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
            আলহামদুলিল্লাহ
          </span>
        </div>
      )}

      {/* 2. HERO PROGRESS GAUGE (Deep Emerald & Gold) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A3B2C] via-[#0D4E3A] to-[#06281F] p-5 sm:p-6 text-white shadow-md">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="w-full md:w-3/5 space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Youth of hiqmah • ১৮০ দিনের যাত্রা</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              আসসালামু আলাইকুম,{' '}
              <span className="text-amber-300">
                {state.profile.name.split(' ')[0] || 'Brother'}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              আপনার আজকের ধারাবাহিক অগ্রগতি, ইবাদত ও আত্মউন্নয়ন ট্র্যাক করুন
            </p>

            <div
              onClick={onOpenMotivation}
              className="mt-3 p-3 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/15 transition-all flex items-center justify-between gap-2 text-xs text-emerald-50 cursor-pointer shadow-inner"
            >
              <div className="truncate">
                <span className="text-amber-300 font-bold mr-1.5">প্রেরণা:</span>
                <span className="italic">
                  {state.motivationQuotes[0]?.text || '“প্রতিদিনের ছোট ছোট বিজয়েই গড়ে উঠবে বড় পরিবর্তন।”'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-300 shrink-0" />
            </div>
          </div>

          <div className="w-full md:w-2/5 flex flex-col items-center justify-center">
            <CircularProgress
              value={todayProgress.percentage}
              size={160}
              strokeWidth={13}
              label="TODAY PROGRESS"
              subLabel={`${todayProgress.completedCount}/${todayProgress.totalCount} আমল সম্পন্ন`}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10 relative z-10">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-2xs">
            <div className="text-[10px] font-bold text-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              আজকের সম্পন্ন
            </div>
            <div className="text-xl font-black text-white mt-0.5">
              {todayProgress.completedCount}{' '}
              <span className="text-[11px] font-normal text-emerald-200">টাস্ক</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-2xs">
            <div className="text-[10px] font-bold text-emerald-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              বাকি আছে
            </div>
            <div className="text-xl font-black text-white mt-0.5">
              {todayProgress.pendingCount}{' '}
              <span className="text-[11px] font-normal text-emerald-200">টাস্ক</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-400/20 border border-amber-300/30 shadow-2xs">
            <div className="text-[10px] font-bold text-amber-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              ধারাবাহিক স্ট্রিক
            </div>
            <div className="text-xl font-black text-amber-300 mt-0.5">
              {streak} <span className="text-[11px] font-normal text-amber-200">দিন</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-2xs">
            <div className="text-[10px] font-bold text-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              সামগ্রিক রেটিং
            </div>
            <div className="text-xl font-black text-white mt-0.5">
              {scores.percentage}%
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCREEN TIME & DAILY ACTIVITY TIMELINE CARD (Screenshot 3 KahfGuard Style) */}
      <ActivityTimelineCard state={state} onNavigateTab={onNavigateTab} />

      {/* 4. TODAY'S HABITS WITH 3-STATE BUTTONS (Fast Action Section) */}
      <section className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              আজকের নির্ধারিত আমল ও চেকলিস্ট
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              সরাসরি ৩টি বাটনে স্ট্যাটাস সিলেক্ট করে ট্র্যাকিং আপডেট করুন
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('today')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
          >
            <span>পূর্ণাঙ্গ ভিউ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Facebook Inline Input */}
        {showQuickFbInput && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>ফেসবুক স্ক্রল সময় নির্ধারণ (মিনিট)</span>
              <button onClick={() => setShowQuickFbInput(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="360"
                value={fbMinutesInput}
                onChange={(e) => setFbMinutesInput(parseInt(e.target.value) || 0)}
                className="w-24 px-2 py-1 rounded-lg bg-white border border-amber-300 text-slate-900 text-xs font-bold"
              />
              <span className="text-xs text-amber-800">মিনিট (সর্বোচ্চ ৩০ মি.)</span>
              <button
                onClick={handleSaveFacebookMinutes}
                className="ml-auto px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                সেভ
              </button>
            </div>
          </div>
        )}

        {/* Habit Items */}
        <div className="space-y-2.5">
          {todayActionItems.map((item) => {
            const isDone = todayProgress.log.completedTasks?.includes(item.id) ?? false;
            const isMissed = todayProgress.log.missedTasks?.includes(item.id) ?? false;
            const isPending = !isDone && !isMissed;

            return (
              <div
                key={item.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#F8FAF9] border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl shrink-0 mt-0.5">{item.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        {item.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {item.hasMinutes && (
                    <button
                      onClick={() => setShowQuickFbInput(!showQuickFbInput)}
                      className="text-[11px] font-bold text-amber-700 hover:underline px-1 cursor-pointer"
                    >
                      সময় এডিট
                    </button>
                  )}

                  {/* 3-State Buttons */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      onClick={() => handleSetTaskStatus(item.id, isDone ? 'pending' : 'done')}
                      className={`w-9 h-7 rounded-lg font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-600'
                          : 'bg-slate-50 hover:bg-emerald-50 text-emerald-700'
                      }`}
                      title="সম্পন্ন (Done)"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <button
                      onClick={() => handleSetTaskStatus(item.id, isMissed ? 'pending' : 'missed')}
                      className={`w-9 h-7 rounded-lg font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isMissed
                          ? 'bg-rose-600 text-white shadow-2xs ring-1 ring-rose-600'
                          : 'bg-slate-50 hover:bg-rose-50 text-rose-600'
                      }`}
                      title="ছুটে গেছে (Missed)"
                    >
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <button
                      onClick={() => handleSetTaskStatus(item.id, 'pending')}
                      className={`w-9 h-7 rounded-lg font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isPending
                          ? 'bg-slate-700 text-white ring-1 ring-slate-700'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                      }`}
                      title="অপেক্ষমাণ (Pending)"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. KAHFGUARD INSPIRED CATEGORY TILES (Screenshot 1 & 2 Style) */}
      {categoryGroups.map((group, gIdx) => (
        <section key={gIdx} className="space-y-2.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-500 px-1">
            {group.groupTitle}
          </h3>

          <div className="space-y-2.5">
            {group.items.map((item) => {
              const catData = scores.breakdown.find((b) => b.key === item.scoreKey);
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  onClick={() => onSelectCategoryDetail(item.key)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] ${item.cardBg} ${item.borderColor}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${item.iconBoxBg} ${item.iconColor}`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {catData && (
                      <span className="hidden sm:inline-flex text-xs font-black px-2.5 py-1 rounded-xl bg-white/80 border border-slate-200 text-slate-800">
                        {catData.obtained}/{catData.total}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
