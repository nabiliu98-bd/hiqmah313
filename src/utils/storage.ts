import { AppState, CategoryConfig, MotivationQuote } from '../types';
import { recordLocalSyncTime } from './localDiskSync';

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'c1',
    key: 'facebook',
    name: 'Facebook Time Management',
    nameBn: 'ফেসবুক ডিসিপ্লিন (সর্বোচ্চ ৩০০ মিনিট/মাস)',
    weight: 100,
    scoringMethod: 'penalty',
    description: 'প্রতি সপ্তাহে Facebook-এ সর্বোচ্চ ১ ঘণ্টা অপচয় (মাসে ৩০০ মিনিট)। অতিরিক্ত ব্যবহারে ১ মার্ক করে কাটা।',
  },
  {
    id: 'c2',
    key: 'goal',
    name: '6-Month Personal Goal',
    nameBn: 'ব্যক্তিগত ৬ মাসের গোল ও সাব-টাস্ক',
    weight: 200,
    scoringMethod: 'weight_subtasks',
    description: 'আপনার মূল ৬ মাসের লক্ষ্য, মাসিক টার্গেট ও সাব-টাস্কসমূহ বাস্তবায়ন।',
  },
  {
    id: 'c3',
    key: 'deen',
    name: 'Tajweed/Tahajjud + Fasting',
    nameBn: 'তাহাজ্জুদ (৬ দিন) + সিয়াম (৬ দিন)',
    weight: 100,
    scoringMethod: 'count_target',
    description: 'মাসে ৬ দিন তাহাজ্জুদ (৪০ মার্কস) এবং ৬ দিন নফল সিয়াম (৬০ মার্কস)।',
  },
  {
    id: 'c4',
    key: 'deepwork',
    name: 'Monthly Deep Work',
    nameBn: 'মাসিক ডিপ ওয়ার্ক সেশন (১ দিন)',
    weight: 20,
    scoringMethod: 'single_session',
    description: 'মাসে ন্যূনতম ১টি উচ্চমাত্রার গভীর মনোযোগের কর্ম-সেশন (৩+ ঘণ্টা)।',
  },
  {
    id: 'c5',
    key: 'quran',
    name: 'Qur’an Monthly Study',
    nameBn: 'কুরআন মান্থলি স্টাডি ও তাদাব্বুর',
    weight: 40,
    scoringMethod: 'subsections',
    description: 'হিকমাহ নির্দেশিত নির্ধারিত অংশের গভীর পাঠ (২০), নোটস (১০) ও গ্রুপ রিভিউ (১০)।',
  },
  {
    id: 'c6',
    key: 'bookcircle',
    name: '6-Month Book Circle',
    nameBn: '৬ মাসের বুক সার্কেল (২টি বই)',
    weight: 80,
    scoringMethod: 'chapters_attendance',
    description: 'নির্ধারিত ২টি বই পাঠ, নোটস তৈরি (৪০) এবং পাঠচক্রে উপস্থিতি (৪০)।',
  },
  {
    id: 'c7',
    key: 'leadership',
    name: 'Hiqmah Leadership & Accountability',
    nameBn: 'হিকমাহ লিডারশিপ ও জবাবদিহিতা',
    weight: 100,
    scoringMethod: 'leadership_composite',
    description: 'মাসিক/সাপ্তাহিক রিপোর্ট (৪০), নিয়মিত যোগাযোগ (২০) এবং আমির প্রদত্ত অ্যাসাইন্ড টাস্ক (৪০)।',
  },
];

export const DEFAULT_MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    id: 'mq1',
    text: '“যে ব্যক্তি জ্ঞানার্জনের উদ্দেশ্যে কোনো পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।”',
    source: 'সহীহ মুসলিম',
    custom: false,
  },
  {
    id: 'mq2',
    text: '“আল্লাহর নিকট সবচেয়ে প্রিয় আমল হলো যা নিয়মিত করা হয়, যদিও তা পরিমাণে কম হোক।”',
    source: 'সহীহ বুখারী',
    custom: false,
  },
  {
    id: 'mq3',
    text: '“শৃঙ্খলা হলো আপনি যা এখন চান এবং আপনি সবচেয়ে বেশি যা হতে চান—তার মধ্যকার সেতুবন্ধন।”',
    source: 'হিকমাহ প্রেরণা',
    custom: false,
  },
  {
    id: 'mq4',
    text: '“প্রতিদিনের ক্ষুদ্র ক্ষুদ্র বিজয়েই গড়ে উঠবে ৬ মাসের অবিস্মরণীয় বিপ্লব ও রূপান্তর।”',
    source: 'Youth of hiqmah',
    custom: false,
  },
  {
    id: 'mq5',
    text: '“সময়ের অপচয় মৃত্যুর চেয়েও ভয়াবহ; কারণ মৃত্যু আপনাকে দুনিয়া থেকে বিচ্ছিন্ন করে, আর সময়ের অপচয় আপনাকে আল্লাহ ও পরকাল থেকে বিচ্ছিন্ন করে।”',
    source: 'ইবনুল কায়্যিম (রহ.)',
    custom: false,
  },
  {
    id: 'mq6',
    text: '“আপনার আজকের ত্যাগই আগামীকালের যোগ্যতার ভিত্তিপ্রস্তর।”',
    source: 'হিকমাহ মানতাজিম কাফেলা',
    custom: false,
  },
];

export const getTodayDateString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const get180DaysEndDate = (startDateStr: string): string => {
  try {
    const d = new Date(startDateStr);
    if (isNaN(d.getTime())) {
      const now = new Date();
      now.setDate(now.getDate() + 180);
      return now.toISOString().split('T')[0];
    }
    d.setDate(d.getDate() + 180);
    return d.toISOString().split('T')[0];
  } catch {
    const now = new Date();
    now.setDate(now.getDate() + 180);
    return now.toISOString().split('T')[0];
  }
};

export function getInitialState(): AppState {
  const todayStr = getTodayDateString();
  const endStr = get180DaysEndDate(todayStr);

  return {
    profile: {
      name: '',
      photoUrl: '',
      journeyStartDate: todayStr,
      journeyEndDate: endStr,
      mainGoalTitle: '',
      mainGoalDescription: '',
      onboarded: false, // Ensures every user sets their name when entering!
      isAdmin: false,
    },
    categories: DEFAULT_CATEGORIES,
    facebookMonthlyMinutes: 0, // 0 minutes used
    personalGoal: {
      id: 'pg-1',
      title: 'ব্যক্তিগত ৬ মাসের মূল লক্ষ্য',
      description: 'নিয়মানুবর্তিতা ও আত্ম-উন্নয়নের মাধ্যমে কাঙ্ক্ষিত লক্ষ্যে পৌঁছানো।',
      order: 1,
      totalWeight: 200,
      monthlyTarget: '১ম মাসের লক্ষ্য ও নিয়মিত প্রস্তুতি',
      weeklyTarget: 'সাপ্তাহিক রুটিন ও অধ্যয়ন',
      priority: 'high',
      subtasks: [
        { id: 'st-1', title: 'লক্ষ্যের রিসোর্স/সিলেবাস সংগ্রহ ও প্রাথমিক পরিকল্পনা', weight: 40, completed: false, dueDate: '' },
        { id: 'st-2', title: 'নিয়মিত হ্যান্ডনোট ও স্টাডি মেটেরিয়াল তৈরি', weight: 50, completed: false, dueDate: '' },
        { id: 'st-3', title: 'গভীর অনুশীলন ও বিষয়ভিত্তিক প্রস্তুতি', weight: 50, completed: false, dueDate: '' },
        { id: 'st-4', title: 'পর্যাপ্ত রিভিশন ও অধ্যবসায়', weight: 30, completed: false, dueDate: '' },
        { id: 'st-5', title: 'চূড়ান্ত মূল্যায়ন ও মক টেস্ট', weight: 30, completed: false, dueDate: '' },
      ],
      monthlyProgressHistory: [
        { month: 1, label: 'Month 1', percentage: 0 },
        { month: 2, label: 'Month 2', percentage: 0 },
        { month: 3, label: 'Month 3', percentage: 0 },
        { month: 4, label: 'Month 4', percentage: 0 },
        { month: 5, label: 'Month 5', percentage: 0 },
        { month: 6, label: 'Month 6', percentage: 0 },
      ],
    },
    tahajjudCompletedDates: [], // 0 days
    fastingCompletedDates: [], // 0 days
    deepWorkSession: {
      id: 'dw-1',
      date: todayStr,
      durationHours: 0,
      task: '',
      description: '',
      result: '',
      completed: false,
    },
    quranStudy: {
      month: 1,
      assignedSurahOrJuz: 'সূরা আল-হুজুরাত ও সূরা লুকমান',
      deepStudyStatus: 'not_started',
      deepStudyProgress: 0,
      notesStatus: 'not_started',
      notesContent: '',
      groupReviewStatus: 'not_started',
      weights: {
        deepStudy: 20,
        notes: 10,
        groupReview: 10,
      },
    },
    bookCircle: {
      month: 1,
      book1Title: 'The Productive Muslim (মুহাম্মাদ ফারিস)',
      book1AssignedChapters: 'অধ্যায় ১ থেকে ৪',
      book1Progress: 0,
      book2Title: 'যাদের হৃদয় জিন্দা (শাইখ আহমাদ মূসা জিবরিল)',
      book2AssignedChapters: '১ম খণ্ড: কলবের পরিশুদ্ধি',
      book2Progress: 0,
      notesSubmitted: false,
      attendance: false,
      notesSummary: '',
      weights: {
        notes: 40,
        attendance: 40,
      },
    },
    leadership: {
      reportsScore: 0,
      reportsSubmitted: false,
      communicationScore: 0,
      communicationDone: false,
      tasks: [
        {
          id: 'lt-1',
          taskNumber: 1,
          taskName: 'সাপ্তাহিক মুরাকাবা ও হালকার রিপোর্ট জমাদান',
          description: 'আমির ভাইয়ের নিকট নিজের এবং অধীনের সাপ্তাহিক জবাবদিহিতা রিপোর্ট যথাসময়ে উপস্থাপন।',
          deadline: '',
          status: 'pending',
          score: 0,
        },
        {
          id: 'lt-2',
          taskNumber: 2,
          taskName: 'সদস্য যোগাযোগ ও খোঁজখবর নেওয়া',
          description: 'হিকমাহ ইউনিটের সদস্যদের সাথে ব্যক্তিগত সেশন ও পড়াশোনার অগ্রগতি পর্যালোচনা।',
          deadline: '',
          status: 'pending',
          score: 0,
        },
        {
          id: 'lt-3',
          taskNumber: 3,
          taskName: 'পাঠচক্রের রিসোর্স সমন্বয়',
          description: 'মাসিক বুক সার্কেল আলোচনার হ্যান্ডআউট ও গ্রুপ রিভিউ সম্পন্ন করা।',
          deadline: '',
          status: 'pending',
          score: 0,
        },
        {
          id: 'lt-4',
          taskNumber: 4,
          taskName: 'আমির প্রদত্ত অ্যাসাইন্ড দায়িত্ব পালন',
          description: 'হিকমাহ কর্তৃক নির্দেশিত নির্দিষ্ট সাংগঠনিক বা সামাজিক দায়িত্ব পালন।',
          deadline: '',
          status: 'pending',
          score: 0,
        },
        {
          id: 'lt-5',
          taskNumber: 5,
          taskName: 'মাসিক মূল্যায়ন মিটিংয়ে উপস্থিতি ও ব্রিফিং',
          description: 'হিকমাহ কেন্দ্রীয় মাসিক ডিরেক্টর মিটিংয়ে পুরো মাসের অগ্রগতি রিপোর্ট পেশ করা।',
          deadline: '',
          status: 'pending',
          score: 0,
        },
      ],
      weights: {
        reports: 40,
        communication: 20,
        tasks: 40,
      },
    },
    dailyLogs: {}, // completely empty for a true fresh zero start!
    motivationQuotes: DEFAULT_MOTIVATION_QUOTES,
    notifications: {
      dailyCheckIn: true,
      weeklyReport: true,
      monthlyReview: true,
      tahajjud: true,
      quranStudy: true,
      bookCircle: true,
      leadershipDeadline: true,
      deepWork: true,
    },
    activeMonth: 1,
  };
}

const STORAGE_KEY = 'youth_of_hiqmah_app_state_v5_zero';
const ZERO_RESET_FLAG = 'youth_of_hiqmah_zero_reset_v5_applied';

export function loadState(): AppState {
  try {
    // Auto-wipe previous demo data to ensure a completely fresh 0 start for everyone
    if (typeof window !== 'undefined' && localStorage.getItem(ZERO_RESET_FLAG) !== 'true') {
      localStorage.removeItem('youth_of_hiqmah_app_state_v1');
      localStorage.removeItem('youth_of_hiqmah_app_state_v2');
      localStorage.removeItem('youth_of_hiqmah_app_state_v3');
      localStorage.removeItem('youth_of_hiqmah_app_state_v4');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(ZERO_RESET_FLAG, 'true');

      const freshZero = getInitialState();
      saveState(freshZero);
      return freshZero;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = getInitialState();
      saveState(init);
      return init;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return getInitialState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    recordLocalSyncTime();
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function resetAllDataToZero(): AppState {
  const fresh = getInitialState();
  saveState(fresh);
  return fresh;
}

export const loadAppState = loadState;
export const saveAppState = saveState;

