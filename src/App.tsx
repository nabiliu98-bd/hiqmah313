import React, { useState, useEffect } from 'react';
import { AppState, MotivationQuote } from './types';
import { loadAppState, saveAppState, getTodayDateString } from './utils/storage';
import { calculateStreak, getTodayProgress } from './utils/scoring';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { MotivationModal } from './components/MotivationModal';
import { AdminModal } from './components/AdminModal';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { CalendarModal } from './components/CalendarModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

// Views
import { HomeView } from './views/HomeView';
import { TodayView } from './views/TodayView';
import { ProgressView } from './views/ProgressView';
import { GoalsView } from './views/GoalsView';
import { ProfileView } from './views/ProfileView';

export default function App() {
  const [state, setState] = useState<AppState>(loadAppState);
  const [activeTab, setActiveTab] = useState<'home' | 'today' | 'progress' | 'goals' | 'profile'>('home');

  // Modals state
  const [isMotivationOpen, setIsMotivationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const todayDateStr = getTodayDateString();
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [targetDateForToday, setTargetDateForToday] = useState<string>(todayDateStr);

  // Auto-save whenever state changes
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Native Android Hardware Back Button & Esc Handler
  useEffect(() => {
    let removeListener: (() => void) | null = null;

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('backButton', () => {
        if (selectedCategoryKey) {
          setSelectedCategoryKey(null);
        } else if (isCalendarOpen) {
          setIsCalendarOpen(false);
        } else if (isMotivationOpen) {
          setIsMotivationOpen(false);
        } else if (isAdminOpen) {
          setIsAdminOpen(false);
        } else if (activeTab !== 'home') {
          setActiveTab('home');
        } else {
          CapacitorApp.exitApp();
        }
      }).then((handle) => {
        removeListener = () => handle.remove();
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCategoryKey) setSelectedCategoryKey(null);
        else if (isCalendarOpen) setIsCalendarOpen(false);
        else if (isMotivationOpen) setIsMotivationOpen(false);
        else if (isAdminOpen) setIsAdminOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (removeListener) removeListener();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCategoryKey, isCalendarOpen, isMotivationOpen, isAdminOpen, activeTab]);

  // Central state updater
  const handleUpdateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveAppState(next);
      return next;
    });
  };

  // Complete onboarding
  const handleCompleteOnboarding = (profile: {
    name: string;
    photoUrl?: string;
    journeyStartDate: string;
    journeyEndDate: string;
    mainGoalTitle: string;
    mainGoalDescription: string;
    onboarded: boolean;
    isAdmin?: boolean;
  }) => {
    handleUpdateState((prev) => ({
      ...prev,
      profile,
      personalGoal: {
        ...prev.personalGoal,
        title: profile.mainGoalTitle,
        description: profile.mainGoalDescription,
      },
    }));
  };

  // Quick navigation to a specific day log from Calendar or Heatmap
  const handleOpenDayLog = (dateStr: string) => {
    setTargetDateForToday(dateStr);
    setActiveTab('today');
  };

  // Save quotes from MotivationModal
  const handleSaveQuotes = (quotes: MotivationQuote[]) => {
    handleUpdateState((prev) => ({
      ...prev,
      motivationQuotes: quotes,
    }));
  };

  // Calculate metrics for navigation & badges
  const streak = calculateStreak(state.dailyLogs, todayDateStr);
  const todayProgress = getTodayProgress(state, todayDateStr);
  const pendingTasksCount = Math.max(
    0,
    (todayProgress.log.applicableTasks?.length || 6) - (todayProgress.log.completedTasks?.length || 0)
  );

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Sticky Header */}
      <Header
        profile={state.profile}
        activeTab={activeTab}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenNotifications={() => setActiveTab('profile')}
        streak={streak}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-16">
        {activeTab === 'home' && (
          <HomeView
            state={state}
            onUpdateState={handleUpdateState}
            onNavigateTab={setActiveTab}
            onOpenMotivation={() => setIsMotivationOpen(true)}
            onSelectCategoryDetail={(key) => setSelectedCategoryKey(key)}
          />
        )}

        {activeTab === 'today' && (
          <TodayView
            state={state}
            onUpdateState={handleUpdateState}
            onOpenMotivation={() => setIsMotivationOpen(true)}
            dateOverride={targetDateForToday}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            state={state}
            onUpdateState={handleUpdateState}
            onOpenDayLog={handleOpenDayLog}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            state={state}
            onUpdateState={handleUpdateState}
            onOpenMotivation={() => setIsMotivationOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            state={state}
            onUpdateState={handleUpdateState}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenMotivation={() => setIsMotivationOpen(true)}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        todayPendingCount={pendingTasksCount}
      />

      {/* Onboarding Modal (shows if first-time user) */}
      {!state.profile.onboarded && (
        <OnboardingModal
          initialProfile={state.profile}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* My Motivation Modal */}
      {isMotivationOpen && (
        <MotivationModal
          quotes={state.motivationQuotes}
          onSaveQuotes={handleSaveQuotes}
          onClose={() => setIsMotivationOpen(false)}
        />
      )}

      {/* Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminModal
          state={state}
          onUpdateState={handleUpdateState}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Category Detail Modal (Percentage, Obtained Marks, Total Marks, Daily, Weekly, Monthly) */}
      {selectedCategoryKey && (
        <CategoryDetailModal
          categoryKey={selectedCategoryKey}
          state={state}
          onClose={() => setSelectedCategoryKey(null)}
        />
      )}

      {/* Monthly Interactive Calendar Modal */}
      {isCalendarOpen && (
        <CalendarModal
          state={state}
          onSelectDate={handleOpenDayLog}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}
    </div>
  );
}
