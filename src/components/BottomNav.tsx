import React from 'react';
import { Home, CheckSquare, TrendingUp, Target, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'today' | 'progress' | 'goals' | 'profile';
  onChangeTab: (tab: 'home' | 'today' | 'progress' | 'goals' | 'profile') => void;
  todayPendingCount: number;
}

interface TabItem {
  id: 'home' | 'today' | 'progress' | 'goals' | 'profile';
  label: string;
  labelBn: string;
  icon: any;
  badge?: number | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  todayPendingCount,
}) => {
  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', labelBn: 'হোম', icon: Home },
    { id: 'today', label: 'Today', labelBn: 'টুডে', icon: CheckSquare, badge: todayPendingCount > 0 ? todayPendingCount : null },
    { id: 'progress', label: 'Progress', labelBn: 'অগ্রগতি', icon: TrendingUp },
    { id: 'goals', label: 'Goals', labelBn: 'গোলস', icon: Target },
    { id: 'profile', label: 'Profile', labelBn: 'প্রোফাইল', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-emerald-100 shadow-[0_-2px_12px_rgba(10,59,44,0.06)] px-2 py-1 sm:py-1.5">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#0A3B2C] font-bold scale-105'
                  : 'text-slate-500 hover:text-emerald-800'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 w-7 h-1 rounded-full bg-[#16A34A] shadow-xs" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4] text-[#0A3B2C]' : 'stroke-[1.8]'}`} />
                {tab.badge && !isActive && (
                  <span className="absolute -top-1 -right-2.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-amber-500 text-[9px] font-black text-white shadow-xs animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-0.5 ${isActive ? 'text-[#0A3B2C] font-extrabold' : 'text-slate-500 font-medium'}`}>
                {tab.labelBn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
