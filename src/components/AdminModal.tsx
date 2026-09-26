import React, { useState } from 'react';
import { AppState, CategoryConfig, LeadershipTask } from '../types';
import {
  ShieldCheck,
  X,
  BookOpen,
  Users,
  Sliders,
  Save,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface AdminModalProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  state,
  onUpdateState,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'weights' | 'quran' | 'books' | 'leadership' | 'integrity'>('weights');

  // Categories Weights Form State
  const [categories, setCategories] = useState<CategoryConfig[]>(state.categories);

  // Quran Form State
  const [surah, setSurah] = useState(state.quranStudy.assignedSurahOrJuz);
  const [qDeepWeight, setQDeepWeight] = useState(state.quranStudy.weights.deepStudy);
  const [qNotesWeight, setQNotesWeight] = useState(state.quranStudy.weights.notes);
  const [qReviewWeight, setQReviewWeight] = useState(state.quranStudy.weights.groupReview);

  // Book Circle Form State
  const [book1Title, setBook1Title] = useState(state.bookCircle.book1Title);
  const [book1Chapters, setBook1Chapters] = useState(state.bookCircle.book1AssignedChapters);
  const [book2Title, setBook2Title] = useState(state.bookCircle.book2Title);
  const [book2Chapters, setBook2Chapters] = useState(state.bookCircle.book2AssignedChapters);

  // Leadership Form State
  const [leadershipTasks, setLeadershipTasks] = useState<LeadershipTask[]>(state.leadership.tasks);

  // Toast
  const [savedToast, setSavedToast] = useState(false);

  // Handle Category Weight Change
  const handleWeightChange = (key: string, newWeight: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, weight: Math.max(0, newWeight) } : c))
    );
  };

  const totalCalculatedWeight = categories.reduce((sum, c) => sum + (c.weight || 0), 0);

  // Handle Save All Settings
  const handleSaveAll = () => {
    onUpdateState((prev) => ({
      ...prev,
      categories: categories,
      quranStudy: {
        ...prev.quranStudy,
        assignedSurahOrJuz: surah,
        weights: {
          deepStudy: qDeepWeight,
          notes: qNotesWeight,
          groupReview: qReviewWeight,
        },
      },
      bookCircle: {
        ...prev.bookCircle,
        book1Title,
        book1AssignedChapters: book1Chapters,
        book2Title,
        book2AssignedChapters: book2Chapters,
      },
      leadership: {
        ...prev.leadership,
        tasks: leadershipTasks,
      },
    }));

    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-emerald-100 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                আমির ও অ্যাডমিন প্যানেল
              </h3>
              <p className="text-xs text-slate-500">
                Youth of hiqmah কারিকুলাম ও ডায়নামিক স্কোরিং ব্যবস্থাপনা
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
          {[
            { id: 'weights', label: 'স্কোরিং ওয়েট', icon: Sliders },
            { id: 'quran', label: 'কুরআন অ্যাসাইনমেন্ট', icon: BookOpen },
            { id: 'books', label: 'বুক সার্কেল সিলেবাস', icon: BookOpen },
            { id: 'leadership', label: 'লিডারশিপ টাস্ক', icon: Users },
            { id: 'integrity', label: 'ডেটা লক ও অখণ্ডতা', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Category Weights */}
        {activeTab === 'weights' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  ৭টি মূল ক্যাটাগরির মার্কস বন্টন (Weights)
                </h4>
                <p className="text-xs text-slate-500">
                  অ্যাডমিন ওয়েট পরিবর্তন করলে সেন্ট্রাল স্কোরিং ইঞ্জিন স্বয়ংক্রিয়ভাবে নতুন অনুপাতে ফলাফল হিসেব করবে।
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-800">মোট মার্কস</span>
                <div className="text-sm font-black text-emerald-900">{totalCalculatedWeight} Marks</div>
              </div>
            </div>

            <div className="space-y-2">
              {categories.map((cat, i) => (
                <div
                  key={cat.key}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      0{i + 1}. {cat.nameBn}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={cat.weight}
                      onChange={(e) => handleWeightChange(cat.key, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold text-center"
                    />
                    <span className="text-xs text-slate-500 font-semibold">পয়েন্ট</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Quran Study Assignment */}
        {activeTab === 'quran' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                চলতি মাসের নির্ধারিত কুরআন অংশ (মাস ১-৬)
              </h4>
              <p className="text-xs text-slate-500">
                আমির বা সিলেবাস অনুযায়ী এই মাসের জন্য নির্ধারিত সূরা বা পারা সেট করুন
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">নির্ধারিত সূরা / পারা:</label>
                <input
                  type="text"
                  value={surah}
                  onChange={(e) => setSurah(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600">গভীর তাদাব্বুর ওয়েট:</label>
                  <input
                    type="number"
                    value={qDeepWeight}
                    onChange={(e) => setQDeepWeight(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">নোট গ্রহণ ওয়েট:</label>
                  <input
                    type="number"
                    value={qNotesWeight}
                    onChange={(e) => setQNotesWeight(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600">হালকা আলোচনা ওয়েট:</label>
                  <input
                    type="number"
                    value={qReviewWeight}
                    onChange={(e) => setQReviewWeight(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Book Circle */}
        {activeTab === 'books' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                বুক সার্কেল সিলেবাস (২টি নির্বাচিত বই)
              </h4>
              <p className="text-xs text-slate-500">
                মাসে নির্ধারিত অধ্যায় ও বইয়ের তালিকা আপডেট করুন
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-emerald-800">১ম বই (Book 01)</h5>
                <input
                  type="text"
                  value={book1Title}
                  onChange={(e) => setBook1Title(e.target.value)}
                  placeholder="বইয়ের নাম ও লেখক"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                />
                <input
                  type="text"
                  value={book1Chapters}
                  onChange={(e) => setBook1Chapters(e.target.value)}
                  placeholder="চলতি মাসের জন্য নির্ধারিত অধ্যায়সমূহ"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="text-xs font-bold text-emerald-800">২য় বই (Book 02)</h5>
                <input
                  type="text"
                  value={book2Title}
                  onChange={(e) => setBook2Title(e.target.value)}
                  placeholder="বইয়ের নাম ও লেখক"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                />
                <input
                  type="text"
                  value={book2Chapters}
                  onChange={(e) => setBook2Chapters(e.target.value)}
                  placeholder="চলতি মাসের জন্য নির্ধারিত অধ্যায়সমূহ"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Leadership Tasks */}
        {activeTab === 'leadership' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                হিকমাহ আমির/ডিরেক্টর প্রদত্ত সর্বোচ্চ ৫টি দায়িত্ব
              </h4>
              <p className="text-xs text-slate-500">
                প্রতিটি টাস্কের জন্য স্বয়ংক্রিয়ভাবে ৪০ ÷ ৫ = ৮ মার্কস বরাদ্দ থাকবে।
              </p>
            </div>

            <div className="space-y-2">
              {leadershipTasks.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">টাস্ক 0{t.taskNumber}</span>
                    <span className="text-[10px] text-slate-500">বরাদ্দ: ৮ মার্কস</span>
                  </div>
                  <input
                    type="text"
                    value={t.taskName}
                    onChange={(e) => {
                      const updated = [...leadershipTasks];
                      updated[idx].taskName = e.target.value;
                      setLeadershipTasks(updated);
                    }}
                    placeholder="টাস্কের নাম"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                  <input
                    type="date"
                    value={t.deadline}
                    onChange={(e) => {
                      const updated = [...leadershipTasks];
                      updated[idx].deadline = e.target.value;
                      setLeadershipTasks(updated);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Data Integrity Lock */}
        {activeTab === 'integrity' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Data Integrity & Historical Report Locking
              </h4>
              <p className="text-xs text-slate-500">
                ইউজার যেন ভুল করে পূর্ববর্তী মাসের রিপোর্ট নষ্ট না করে সেজন্য ঐতিহাসিক ডেটা লক করে রাখা যায়।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">মাসিক রিপোর্ট লকিং স্ট্যাটাস</h5>
                  <p className="text-[11px] text-slate-500">বর্তমানে: Verified & Protected</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  সুরক্ষিত
                </span>
              </div>
              <p className="text-xs text-slate-600">
                লক থাকা অবস্থায় বিগত মাসের চেক-ইন এবং নম্বর অক্ষুণ্ণ থাকে।
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {savedToast ? (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              অ্যাডমিন কনফিগারেশন সংরক্ষিত হয়েছে!
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              পরিবর্তনগুলো সেন্ট্রাল অ্যাপে তাৎক্ষণিক কার্যকর হবে।
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              id="btn-save-admin-settings"
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
