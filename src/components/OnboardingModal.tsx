import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, Sparkles, Calendar, Target, User, ArrowRight } from 'lucide-react';
import { getTodayDateString, get180DaysEndDate } from '../utils/storage';
import { HiqmahLogo } from './HiqmahLogo';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
}) => {
  const todayStr = getTodayDateString();
  const [name, setName] = useState(initialProfile.name || '');
  const [startDate, setStartDate] = useState(initialProfile.journeyStartDate || todayStr);
  const [endDate, setEndDate] = useState(
    initialProfile.journeyEndDate || get180DaysEndDate(initialProfile.journeyStartDate || todayStr)
  );
  const [mainGoalTitle, setMainGoalTitle] = useState(initialProfile.mainGoalTitle || '');
  const [mainGoalDescription, setMainGoalDescription] = useState(initialProfile.mainGoalDescription || '');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    setEndDate(get180DaysEndDate(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onComplete({
      name: name.trim(),
      photoUrl: initialProfile.photoUrl || '',
      journeyStartDate: startDate,
      journeyEndDate: endDate,
      mainGoalTitle: mainGoalTitle.trim() || 'ব্যক্তিগত ৬ মাসের মূল লক্ষ্য',
      mainGoalDescription: mainGoalDescription.trim() || 'নিয়মানুবর্তিতা ও অধ্যবসায়ের সাথে নিজের সর্বোচ্চ প্রচেষ্টা।',
      onboarded: true,
      isAdmin: false,
    });
  };

  if (initialProfile.onboarded && initialProfile.name) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800 my-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <HiqmahLogo size="lg" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0A3B2C] mt-2">
            স্বাগতম! Youth of hiqmah
          </h2>
          <p className="text-xs text-emerald-800 font-semibold mt-1">
            ১৮০ দিনের রূপান্তর যাত্রা • পার্সোনাল ড্যাশবোর্ড সেটআপ
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
            আপনার দৈনন্দিন আমল, ফেসবুক স্ক্রলিং নিয়ন্ত্রণ ও ক্যারিয়ার লক্ষ্যের ভারসাম্যপূর্ণ অগ্রগতির যাত্রা শুরু করুন।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* User Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              আপনার পূর্ণ নাম:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: তানভীর আহমেদ"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                যাত্রার শুরুর তারিখ:
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                ১৮০তম দিন (সমাপ্তি):
              </label>
              <input
                type="date"
                readOnly
                value={endDate}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Personal Main Goal */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-700" />
              ব্যক্তিগত ৬ মাসের মূল লক্ষ্য (Category 02 — ২০০ মার্কস):
            </label>
            <input
              type="text"
              value={mainGoalTitle}
              onChange={(e) => setMainGoalTitle(e.target.value)}
              placeholder="যেমন: ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট ও কোর জাভাস্ক্রিপ্ট আয়ত্ত করা"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Goal Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              লক্ষ্যের বিবরণ ও সংকল্প:
            </label>
            <textarea
              rows={2}
              value={mainGoalDescription}
              onChange={(e) => setMainGoalDescription(e.target.value)}
              placeholder="যেমন: প্রতিদিন ন্যূনতম ১.৫ ঘণ্টা প্র্যাকটিস ও প্রতি মাসে ১টি রিয়েল ওয়ার্ল্ড প্রজেক্ট।"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>যাত্রা শুরু করুন (Bismillah)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
