import React from 'react';
import { Calendar as CalendarIcon, Bell, Menu, Flame } from 'lucide-react';
import { UserProfile } from '../types';
import { HiqmahLogo } from './HiqmahLogo';

interface HeaderProps {
  profile: UserProfile;
  activeTab: string;
  onOpenCalendar: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenCalendar,
  onOpenAdmin,
  onOpenNotifications,
  streak,
}) => {
  // Calculate journey day (e.g. Day 19 / 180)
  const start = new Date(profile.journeyStartDate || '2026-09-01');
  const today = new Date();
  const diffDays = Math.max(1, Math.min(180, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1));

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand: KahfGuard-inspired clean Logo & Typography */}
        <div className="flex items-center gap-3">
          <HiqmahLogo size="sm" variant="horizontal" showSubtitle={false} />
          
          <div className="hidden lg:block border-l border-slate-200 pl-3">
            <span className="inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
              ৬ মাসের আত্মরূপান্তর
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              “ধারাবাহিক ছোট আমলেই জীবনের স্থায়ী পরিবর্তন”
            </p>
          </div>
        </div>

        {/* Right Info Badges & Quick Action Controls (KahfGuard Clean Aesthetics) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Day Counter Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900 text-white text-xs font-bold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>DAY {diffDays}</span>
            <span className="text-emerald-200/80 font-normal">/ 180</span>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{streak}d</span>
          </div>

          {/* Calendar Button */}
          <button
            id="btn-header-calendar"
            onClick={onOpenCalendar}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            title="মাসিক ক্যালেন্ডার ও দৈনিক হিস্টোরি"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>

          {/* Notifications Button with circular red badge (KahfGuard Screenshot 1 style) */}
          <button
            id="btn-header-notifications"
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            title="নোটিফিকেশন ও রিমাইন্ডার"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
              6
            </span>
          </button>

          {/* Hamburger / Menu button (KahfGuard Screenshot 1 style) */}
          <button
            id="btn-header-admin"
            onClick={onOpenAdmin}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center cursor-pointer shadow-2xs active:scale-95"
            title="অ্যাডমিন ও সেটিংস মেনু"
          >
            <Menu className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>
    </header>
  );
};
