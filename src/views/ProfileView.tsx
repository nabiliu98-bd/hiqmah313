import React, { useState } from 'react';
import { AppState } from '../types';
import { calculateScores, checkBadges, calculateStreak } from '../utils/scoring';
import { saveDirectToDisk, loadDirectFromDisk, getLastLocalSyncTime } from '../utils/localDiskSync';
import { getTodayDateString, resetAllDataToZero } from '../utils/storage';
import {
  User,
  Flame,
  Shield,
  Award,
  Calendar,
  Bell,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Lock,
  Edit,
  ExternalLink,
  HardDrive,
  FileText,
  AlertOctagon,
  X,
} from 'lucide-react';
import { MudirReportModal } from '../components/MudirReportModal';

interface ProfileViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOpenAdmin: () => void;
  onOpenMotivation: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  state,
  onUpdateState,
  onOpenAdmin,
  onOpenMotivation,
}) => {
  const profile = state.profile;
  const scores = calculateScores(state);
  const todayStr = getTodayDateString();
  const streak = calculateStreak(state.dailyLogs, todayStr);
  const badges = checkBadges(state);
  const [isMudirReportOpen, setIsMudirReportOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const start = new Date(profile.journeyStartDate || todayStr);
  const today = new Date();
  const diffDays = Math.max(
    1,
    Math.min(180, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  );

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  // Notification toggles
  const handleToggleNotification = (key: keyof typeof state.notifications) => {
    onUpdateState((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  // Export state directly to local disk
  const handleExportData = async () => {
    const res = await saveDirectToDisk(state);
    if (res.success) {
      showToast(`✅ লোকাল ডিস্কে ব্যাকআপ ফাইল সংরক্ষিত হয়েছে: ${res.filename}`);
    }
  };

  // Import state directly from local disk
  const handleImportData = async () => {
    const loaded = await loadDirectFromDisk();
    if (loaded) {
      onUpdateState(() => loaded);
      showToast('✅ লোকাল ডিস্ক থেকে ডেটা সফলভাবে রিস্টোর করা হয়েছে!');
    } else {
      showToast('⚠️ ফাইল লোড করা সম্ভব হয়নি বা বাতিল করা হয়েছে।');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: nameInput.trim(),
      },
    }));
    setIsEditingProfile(false);
  };

  const notificationItems = [
    { key: 'dailyCheckIn', label: 'দৈনিক চেক-ইন রিমাইন্ডার', desc: 'প্রতিদিন এশার পর দৈনিক আমল ও ফেসবুক লগ রিমাইন্ডার' },
    { key: 'tahajjud', label: 'তাহাজ্জুদ ও কিয়ামুল লাইল সতর্কতা', desc: 'রাতের শেষ তৃতীয়াংশে তাহাজ্জুদের প্রস্তুতি সতর্কতা' },
    { key: 'weeklyReport', label: 'সাপ্তাহিক মূল্যায়ন নোটিফিকেশন', desc: 'প্রতি শুক্রবার রাতে সাপ্তাহিক রিপোর্ট পর্যালোচনা' },
    { key: 'monthlyReview', label: 'মাসিক মূল্যায়ন ও সনদ রিমাইন্ডার', desc: 'মাসের শেষ দিনে সার্বিক স্কোর ও সার্টিফিকেট প্রস্তুত' },
    { key: 'quranStudy', label: 'কুরআন তাদাব্বুর ও নোট গ্রহণ', desc: 'হিকমাহ মাসিক কুরআন অংশের গভীর পাঠ ও নোট রিমাইন্ডার' },
    { key: 'bookCircle', label: 'বুক সার্কেল নির্ধারিত অধ্যায় পাঠ', desc: 'নির্ধারিত বইয়ের অধ্যায় ও আলোচনা সভার ডেডলাইন' },
    { key: 'leadershipDeadline', label: 'লিডারশিপ ও সমাজকর্ম টাস্ক', desc: 'আমির নির্দেশিত দায়িত্ব বাস্তবায়নের সময়সীমা সতর্কতা' },
  ] as const;

  return (
    <div className="space-y-4 pb-28">
      {/* 1. Profile Hero Card */}
      <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0A3B2C] via-[#0D4E3A] to-[#06281F] text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-400 p-0.5 shadow-md">
              <div className="w-full h-full rounded-2xl bg-[#0A3B2C] flex items-center justify-center text-amber-300 font-black text-2xl">
                {profile.name ? profile.name.slice(0, 2) : 'YK'}
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                Active
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{profile.name}</h2>
                <button
                  onClick={() => {
                    setNameInput(profile.name);
                    setIsEditingProfile(true);
                  }}
                  className="text-emerald-200 hover:text-white p-1 cursor-pointer"
                  title="নাম পরিবর্তন করুন"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-amber-300 font-bold mt-0.5">
                Youth of hiqmah • ১৮০ দিনের রূপান্তর যাত্রা
              </p>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-md">
                “{profile.mainGoalTitle}”
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdmin}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
          >
            আমির / অ্যাডমিন কন্ট্রোল
          </button>
        </div>

        {/* Milestones Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/15">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-2xs text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-200">বর্তমান দিন</span>
            <div className="text-xl font-black text-white mt-0.5">
              DAY {diffDays}{' '}
              <span className="text-xs font-normal text-emerald-200">/ 180</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-400/20 border border-amber-300/30 shadow-2xs text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-amber-200 flex items-center justify-center sm:justify-start gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Current Streak
            </span>
            <div className="text-xl font-black text-amber-300 mt-0.5">
              {streak} <span className="text-xs font-normal text-amber-200">দিন</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-2xs text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-200">সাপ্তাহিক পারফরম্যান্স</span>
            <div className="text-xl font-black text-white mt-0.5">
              {scores.percentage}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-2xs text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-200">মাসিক মোট নম্বর</span>
            <div className="text-xl font-black text-white mt-0.5">
              {scores.obtainedTotal}{' '}
              <span className="text-xs font-normal text-emerald-200">/{scores.maxTotal}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOCAL DISK STORAGE & BACKUP SECTION */}
      <section className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0A3B2C]">
                লোকাল ডিস্ক ব্যাকআপ ও রিস্টোর
              </h3>
              <p className="text-xs text-slate-500">
                সম্পূর্ণ অফলাইন: আপনার সব ডেটা আপনার ডিভাইসের মেমোরিতেই সম্পূর্ণ সুরক্ষিত
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-emerald-900">
            <strong>সর্বশেষ লোকাল ব্যাকআপ:</strong> {getLastLocalSyncTime()}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডিস্কে সেভ (.json)</span>
            </button>

            <button
              onClick={handleImportData}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ডিস্ক থেকে লোড</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. NOTIFICATION & REMINDER PREFERENCES */}
      <section className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Bell className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm sm:text-base font-black text-[#0A3B2C]">
            নোটিফিকেশন ও রিমাইন্ডার সেটিংস
          </h3>
        </div>

        <div className="space-y-2">
          {notificationItems.map((item) => {
            const isEnabled = state.notifications[item.key] ?? true;

            return (
              <div
                key={item.key}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>

                <button
                  onClick={() => handleToggleNotification(item.key)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 relative shrink-0 ${
                    isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-2xs transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. MUDIR REPORT EXPORT BUTTON */}
      <section className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-[#0A3B2C] flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            মুদির মাসিক মূল্যায়ন রিপোর্ট
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            হিকমাহ আমির ও দায়িত্বশীলের কাছে পেশ করার উপযোগী অফিসিয়াল মূল্যায়ন শিট
          </p>
        </div>

        <button
          onClick={() => setIsMudirReportOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>রিপোর্ট ডাউনলোড / প্রিন্ট</span>
        </button>
      </section>

      {/* 5. DANGER ZONE: RESET DATA */}
      <section className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-900">
            রিসেট জোন (সতর্কতা)
          </h3>
        </div>

        <p className="text-xs text-slate-600">
          প্রয়োজন হলে অ্যাপ্লিকেশনের সমস্ত ট্র্যাকিং ডেটা রিসেট করতে পারবেন। এটি লোকাল মেমোরি থেকে সব লগ মুছে দেবে।
        </p>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>সকল ডেটা রিসেট করুন</span>
        </button>
      </section>

      {/* MODAL 1: Edit Profile Name */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-emerald-100 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">নাম পরিবর্তন করুন</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">আপনার নাম:</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reset Confirm */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-rose-200 p-6 shadow-2xl space-y-3">
            <h3 className="text-base font-black text-rose-900">আপনি কি নিশ্চিত?</h3>
            <p className="text-xs text-slate-600">
              সমস্ত ট্র্যাকিং ডেটা এবং দৈনিক লগ মুছে যাবে। এই কাজ পূর্বাবস্থায় ফিরিয়ে আনা সম্ভব নয়।
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  const resetState = resetAllDataToZero();
                  onUpdateState(() => resetState);
                  setIsResetConfirmOpen(false);
                  showToast('ডেটা সফলভাবে রিসেট করা হয়েছে!');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Mudir Report Modal */}
      <MudirReportModal
        isOpen={isMudirReportOpen}
        onClose={() => setIsMudirReportOpen(false)}
        state={state}
        reportType="monthly"
      />
    </div>
  );
};
