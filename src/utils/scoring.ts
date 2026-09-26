import { AppState, MonthlyReportData, WeeklyReportData, BadgeItem, DailyLog } from '../types';

export interface CalculatedCategoryScore {
  key: string;
  name: string;
  nameBn: string;
  obtained: number;
  total: number;
  percentage: number;
}

export interface OverallScoreResult {
  obtainedTotal: number;
  maxTotal: number;
  percentage: number;
  breakdown: CalculatedCategoryScore[];
}

/**
 * Calculates current month scores across all 7 categories dynamically
 */
export function calculateScores(state: AppState): OverallScoreResult {
  const categories = state.categories;

  // 1. Facebook Time Management
  const fbConfig = categories.find((c) => c.key === 'facebook') || { weight: 100 };
  const fbActualMinutes = state.facebookMonthlyMinutes;
  const fbTarget = 300;
  let fbScoreRaw = 100;
  if (fbActualMinutes > fbTarget) {
    fbScoreRaw = Math.max(0, 100 - (fbActualMinutes - fbTarget));
  }
  const fbObtained = Math.round((fbScoreRaw / 100) * fbConfig.weight);

  // 2. Personal Goal (Default weight 200)
  const goalConfig = categories.find((c) => c.key === 'goal') || { weight: 200 };
  const subtasks = state.personalGoal.subtasks;
  let goalObtained = 0;
  if (subtasks.length > 0) {
    const totalSubtaskWeight = subtasks.reduce((sum, t) => sum + (t.weight || 1), 0);
    const completedSubtaskWeight = subtasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + (t.weight || 1), 0);
    const goalRatio = totalSubtaskWeight > 0 ? completedSubtaskWeight / totalSubtaskWeight : 0;
    goalObtained = Math.round(goalRatio * goalConfig.weight);
  } else {
    goalObtained = 0;
  }

  // 3. Tajweed / Tahajjud + Fasting (Default 100: Fasting 60, Tahajjud 40)
  const deenConfig = categories.find((c) => c.key === 'deen') || { weight: 100 };
  const fastingCount = Math.min(6, state.fastingCompletedDates.length);
  const tahajjudCount = Math.min(6, state.tahajjudCompletedDates.length);
  const fastingScore = (fastingCount / 6) * 60;
  const tahajjudScore = (tahajjudCount / 6) * 40;
  const deenRawScore = fastingScore + tahajjudScore; // max 100
  const deenObtained = Math.round((deenRawScore / 100) * deenConfig.weight);

  // 4. Monthly Deep Work (Default 20)
  const deepWorkConfig = categories.find((c) => c.key === 'deepwork') || { weight: 20 };
  const deepWorkObtained = state.deepWorkSession.completed ? deepWorkConfig.weight : 0;

  // 5. Qur'an Monthly Study (Default 40: Deep Study 20, Notes 10, Group Review 10)
  const quranConfig = categories.find((c) => c.key === 'quran') || { weight: 40 };
  const qWeights = state.quranStudy.weights || { deepStudy: 20, notes: 10, groupReview: 10 };
  let quranDeepStudyScore = 0;
  if (state.quranStudy.deepStudyStatus === 'completed') {
    quranDeepStudyScore = qWeights.deepStudy;
  } else if (state.quranStudy.deepStudyStatus === 'in_progress') {
    quranDeepStudyScore = Math.round((state.quranStudy.deepStudyProgress / 100) * qWeights.deepStudy);
  }
  const quranNotesScore =
    state.quranStudy.notesStatus === 'completed'
      ? qWeights.notes
      : state.quranStudy.notesStatus === 'in_progress'
      ? Math.round(qWeights.notes * 0.5)
      : 0;
  const quranReviewScore =
    state.quranStudy.groupReviewStatus === 'completed'
      ? qWeights.groupReview
      : state.quranStudy.groupReviewStatus === 'in_progress'
      ? Math.round(qWeights.groupReview * 0.5)
      : 0;
  const quranRawTotal = qWeights.deepStudy + qWeights.notes + qWeights.groupReview;
  const quranObtained = Math.round(
    ((quranDeepStudyScore + quranNotesScore + quranReviewScore) / (quranRawTotal || 40)) *
      quranConfig.weight
  );

  // 6. 6-Month Book Circle (Default 80: Notes 40, Attendance 40)
  const bookConfig = categories.find((c) => c.key === 'bookcircle') || { weight: 80 };
  const bWeights = state.bookCircle.weights || { notes: 40, attendance: 40 };
  const bNotesScore = state.bookCircle.notesSubmitted ? bWeights.notes : 0;
  const bAttendanceScore = state.bookCircle.attendance ? bWeights.attendance : 0;
  const bookRawTotal = bWeights.notes + bWeights.attendance;
  const bookObtained = Math.round(((bNotesScore + bAttendanceScore) / (bookRawTotal || 80)) * bookConfig.weight);

  // 7. Leadership Tasks & Accountability (Default 100: Reports 40, Communication 20, Tasks 40)
  const leaderConfig = categories.find((c) => c.key === 'leadership') || { weight: 100 };
  const lWeights = state.leadership.weights || { reports: 40, communication: 20, tasks: 40 };
  const reportsScore = state.leadership.reportsSubmitted ? lWeights.reports : state.leadership.reportsScore;
  const commScore = state.leadership.communicationDone ? lWeights.communication : state.leadership.communicationScore;
  const leaderTasks = state.leadership.tasks || [];
  const taskCount = Math.max(1, leaderTasks.length);
  const taskPerItemWeight = lWeights.tasks / taskCount;
  const tasksObtained = leaderTasks.reduce((acc, t) => {
    if (t.status === 'completed') return acc + taskPerItemWeight;
    if (t.status === 'in_progress') return acc + taskPerItemWeight * 0.5;
    return acc;
  }, 0);
  const leaderRawTotal = lWeights.reports + lWeights.communication + lWeights.tasks;
  const leaderObtained = Math.round(
    ((reportsScore + commScore + tasksObtained) / (leaderRawTotal || 100)) * leaderConfig.weight
  );

  const breakdown: CalculatedCategoryScore[] = [
    {
      key: 'facebook',
      name: 'Facebook Discipline',
      nameBn: 'ফেসবুক ডিসিপ্লিন',
      obtained: fbObtained,
      total: fbConfig.weight,
      percentage: Math.round((fbObtained / fbConfig.weight) * 100),
    },
    {
      key: 'goal',
      name: '6-Month Personal Goal',
      nameBn: 'ব্যক্তিগত ৬ মাসের গোল',
      obtained: goalObtained,
      total: goalConfig.weight,
      percentage: Math.round((goalObtained / goalConfig.weight) * 100),
    },
    {
      key: 'deen',
      name: 'Tahajjud + Fasting',
      nameBn: 'তাহাজ্জুদ ও সিয়াম সাধনা',
      obtained: deenObtained,
      total: deenConfig.weight,
      percentage: Math.round((deenObtained / deenConfig.weight) * 100),
    },
    {
      key: 'deepwork',
      name: 'Monthly Deep Work',
      nameBn: 'মাসিক ডিপ ওয়ার্ক',
      obtained: deepWorkObtained,
      total: deepWorkConfig.weight,
      percentage: Math.round((deepWorkObtained / deepWorkConfig.weight) * 100),
    },
    {
      key: 'quran',
      name: 'Qur’an Monthly Study',
      nameBn: 'কুরআন মান্থলি স্টাডি',
      obtained: quranObtained,
      total: quranConfig.weight,
      percentage: Math.round((quranObtained / quranConfig.weight) * 100),
    },
    {
      key: 'bookcircle',
      name: '6-Month Book Circle',
      nameBn: 'বুক সার্কেল ও পাঠচক্র',
      obtained: bookObtained,
      total: bookConfig.weight,
      percentage: Math.round((bookObtained / bookConfig.weight) * 100),
    },
    {
      key: 'leadership',
      name: 'Leadership & Accountability',
      nameBn: 'হিকমাহ লিডারশিপ ও জবাবদিহিতা',
      obtained: leaderObtained,
      total: leaderConfig.weight,
      percentage: Math.round((leaderObtained / leaderConfig.weight) * 100),
    },
  ];

  const obtainedTotal = breakdown.reduce((sum, item) => sum + item.obtained, 0);
  const maxTotal = breakdown.reduce((sum, item) => sum + item.total, 0);
  const percentage = maxTotal > 0 ? Math.round((obtainedTotal / maxTotal) * 100) : 0;

  return {
    obtainedTotal,
    maxTotal,
    percentage,
    breakdown,
  };
}

/**
 * Calculates current streak in days based on continuous daily check-ins
 */
export function calculateStreak(dailyLogs: Record<string, DailyLog>, todayStr: string): number {
  let streak = 0;
  const d = new Date(todayStr);

  // check today first, if not logged yet, check yesterday to keep streak active
  const todayLog = dailyLogs[todayStr];
  if (todayLog && (todayLog.completedTasks.length > 0 || todayLog.tahajjudDone || todayLog.goalTaskDone)) {
    streak++;
  }

  // Count backwards
  for (let i = 1; i <= 180; i++) {
    const prevDate = new Date(d);
    prevDate.setDate(d.getDate() - i);
    const key = prevDate.toISOString().split('T')[0];
    const log = dailyLogs[key];
    if (log && (log.completedTasks.length > 0 || log.tahajjudDone || log.goalTaskDone || log.quranStudyDone)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates today's progress percentage & counts
 */
export function getTodayProgress(state: AppState, dateKey: string) {
  const log = state.dailyLogs[dateKey] || {
    date: dateKey,
    facebookMinutes: 0,
    tahajjudDone: false,
    fastingDone: false,
    goalTaskDone: false,
    quranStudyDone: false,
    bookStudyDone: false,
    leadershipTaskDone: false,
    deepWorkDone: false,
    applicableTasks: ['facebook', 'goal', 'tahajjud', 'quran', 'book', 'leadership'],
    completedTasks: [],
  };

  const applicable = log.applicableTasks || ['facebook', 'goal', 'tahajjud', 'quran', 'book', 'leadership'];
  const completed = log.completedTasks || [];
  const count = completed.length;
  const total = Math.max(1, applicable.length);
  const percentage = Math.round((count / total) * 100);

  return {
    completedCount: count,
    pendingCount: Math.max(0, total - count),
    totalCount: total,
    percentage,
    log,
  };
}

/**
 * Generates Weekly Report dynamically
 */
export function generateWeeklyReport(state: AppState, weekOffset: number = 0): WeeklyReportData {
  const scores = calculateScores(state);
  const start = new Date(state.profile.journeyStartDate || '2026-09-01');
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const completedItems: string[] = [];
  const incompleteItems: string[] = [];

  scores.breakdown.forEach((item) => {
    if (item.percentage >= 70) {
      completedItems.push(`${item.nameBn} (${item.percentage}%)`);
    } else {
      incompleteItems.push(`${item.nameBn} (${item.percentage}%)`);
    }
  });

  const weeklyPercentage = scores.percentage;
  const weeklyScore = Math.round((scores.obtainedTotal / scores.maxTotal) * 100);

  return {
    weekNumber: weekOffset + 1,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
    totalScore: weeklyScore,
    completionRate: weeklyPercentage,
    categoryBreakdown: scores.breakdown.map((b) => ({
      categoryName: b.nameBn,
      percentage: b.percentage,
      obtained: b.obtained,
      total: b.total,
    })),
    completedItems,
    incompleteItems,
    currentStreak: calculateStreak(state.dailyLogs, new Date().toISOString().split('T')[0]),
    deltaFromPreviousWeek: weekOffset > 0 ? 6 : 0,
  };
}

/**
 * Generates Monthly Report
 */
export function generateMonthlyReport(state: AppState, monthIndex: number = 1): MonthlyReportData {
  const scores = calculateScores(state);
  const monthNames = [
    'Month 1 - September 2026',
    'Month 2 - October 2026',
    'Month 3 - November 2026',
    'Month 4 - December 2026',
    'Month 5 - January 2027',
    'Month 6 - February 2027',
  ];

  // Find strongest and needs improvement
  const sorted = [...scores.breakdown].sort((a, b) => b.percentage - a.percentage);
  const strongest = sorted[0] ? `${sorted[0].nameBn} (${sorted[0].percentage}%)` : 'ব্যক্তিগত গোল';
  const weakest = sorted[sorted.length - 1] ? `${sorted[sorted.length - 1].nameBn} (${sorted[sorted.length - 1].percentage}%)` : 'ফেসবুক ডিসিপ্লিন';

  let badge = 'হিকমাহ মুরাকাবা শিক্ষানবিস';
  if (scores.percentage >= 85) badge = 'মুজাহিদুন ফি সাবিলিল্লাহ (উচ্চ শৃঙ্খলা)';
  else if (scores.percentage >= 70) badge = 'মুতাওয়াস্সিতুন (অগ্রগামী মুসাফির)';
  else if (scores.percentage >= 50) badge = 'মুস্তাইদুন (প্রস্তুতির পথে)';

  return {
    monthNumber: monthIndex,
    monthName: monthNames[monthIndex - 1] || `Month ${monthIndex}`,
    year: 2026,
    status: 'Submitted',
    totalScore: scores.obtainedTotal,
    maxScore: scores.maxTotal,
    percentage: scores.percentage,
    levelBadge: badge,
    categories: scores.breakdown.map((b) => ({
      key: b.key,
      name: b.nameBn,
      obtained: b.obtained,
      total: b.total,
      percentage: b.percentage,
    })),
    strongestArea: strongest,
    needsImprovement: weakest,
    bestStreak: Math.max(14, calculateStreak(state.dailyLogs, new Date().toISOString().split('T')[0])),
    mostConsistentCategory: sorted[0]?.nameBn || 'তাহাজ্জুদ ও সিয়াম',
    weeklyTrend: [
      { week: 'Week 1', score: 68 },
      { week: 'Week 2', score: 74 },
      { week: 'Week 3', score: scores.percentage },
      { week: 'Week 4', score: Math.min(100, scores.percentage + 4) },
    ],
  };
}

/**
 * Badges system checks
 */
export function checkBadges(state: AppState): BadgeItem[] {
  const scores = calculateScores(state);
  const streak = calculateStreak(state.dailyLogs, new Date().toISOString().split('T')[0]);
  const goalDone = state.personalGoal.subtasks.filter((s) => s.completed).length;

  return [
    {
      id: 'streak_7',
      title: '7 Days Consistent',
      titleBn: '৭ দিনের অবিচলতা',
      description: 'টানা ৭ দিন দৈনিক ট্র্যাকিং ও আমল সম্পন্ন',
      iconName: 'Flame',
      unlocked: streak >= 7,
      progress: Math.min(100, Math.round((streak / 7) * 100)),
    },
    {
      id: 'streak_30',
      title: '30 Days Consistent',
      titleBn: '৩০ দিনের ইসতিকামাত',
      description: 'এক মাস ধরে নিরবচ্ছিন্ন সাধনা ও শৃঙ্খলা',
      iconName: 'ShieldCheck',
      unlocked: streak >= 30,
      progress: Math.min(100, Math.round((streak / 30) * 100)),
    },
    {
      id: 'tasks_100',
      title: '100 Tasks Completed',
      titleBn: '১০০টি অ্যাকশন সম্পন্ন',
      description: 'ছোট ছোট বিজয়ে ১০০টি কাজ সমাপ্তির মাইলফলক',
      iconName: 'CheckCircle2',
      unlocked: goalDone >= 5 || streak >= 15,
      progress: Math.min(100, goalDone * 20),
    },
    {
      id: 'goal_milestone',
      title: 'Goal Milestone',
      titleBn: 'মাইলফলক অর্জন',
      description: 'ব্যক্তিগত ৬ মাসের লক্ষ্যের গুরুত্বপূর্ণ পর্যায় সম্পন্ন',
      iconName: 'Target',
      unlocked: scores.breakdown.find((b) => b.key === 'goal')?.percentage! >= 50,
      progress: scores.breakdown.find((b) => b.key === 'goal')?.percentage || 0,
    },
    {
      id: 'quran_complete',
      title: 'Qur’an Study Master',
      titleBn: 'কুরআন ফাহম ও নোটস',
      description: 'মাসিক কুরআন পাঠ, তাদাব্বুর ও গ্রুপ ডিসকাশন সমাপ্ত',
      iconName: 'BookOpen',
      unlocked: state.quranStudy.deepStudyStatus === 'completed' && state.quranStudy.notesStatus === 'completed',
      progress: state.quranStudy.deepStudyProgress,
    },
    {
      id: 'book_circle',
      title: 'Book Circle Scholar',
      titleBn: 'বুক সার্কেল একনিষ্ঠ পাঠ',
      description: 'উভয় বইয়ের নির্ধারিত অধ্যায় পাঠ ও পাঠচক্রে উপস্থিতি',
      iconName: 'GraduationCap',
      unlocked: state.bookCircle.notesSubmitted && state.bookCircle.attendance,
      progress: (state.bookCircle.book1Progress + state.bookCircle.book2Progress) / 2,
    },
    {
      id: 'six_month_finisher',
      title: '6-Month Transformation Finisher',
      titleBn: 'হিকমাহ ৬ মাসের বিজয়ী',
      description: 'সম্পূর্ণ ১৮০ দিনের রূপান্তর যুদ্ধ সাফল্যের সাথে সম্পন্ন',
      iconName: 'Trophy',
      unlocked: false,
      progress: 32,
    },
  ];
}
