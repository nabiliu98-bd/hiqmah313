export interface UserProfile {
  name: string;
  photoUrl?: string;
  journeyStartDate: string; // YYYY-MM-DD
  journeyEndDate: string; // YYYY-MM-DD
  mainGoalTitle: string;
  mainGoalDescription: string;
  onboarded: boolean;
  isAdmin?: boolean;
}

export type ScoringMethod =
  | 'penalty'
  | 'weight_subtasks'
  | 'count_target'
  | 'single_session'
  | 'subsections'
  | 'chapters_attendance'
  | 'leadership_composite';

export interface CategoryConfig {
  id: string;
  key: string;
  name: string;
  nameBn: string;
  weight: number;
  scoringMethod: ScoringMethod;
  description: string;
  subWeightConfig?: Record<string, number>;
}

export interface GoalSubtask {
  id: string;
  title: string;
  weight: number; // percentage or points
  completed: boolean;
  dueDate?: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  description: string;
  order: number;
  totalWeight: number; // default 200
  monthlyTarget: string;
  weeklyTarget: string;
  priority: 'high' | 'medium' | 'low';
  subtasks: GoalSubtask[];
  monthlyProgressHistory: { month: number; label: string; percentage: number }[];
}

export interface DeepWorkSession {
  id: string;
  date: string;
  durationHours: number;
  task: string;
  description: string;
  result: string;
  completed: boolean;
}

export interface QuranStudyConfig {
  month: number;
  assignedSurahOrJuz: string;
  deepStudyStatus: 'not_started' | 'in_progress' | 'completed';
  deepStudyProgress: number; // 0 - 100
  notesStatus: 'not_started' | 'in_progress' | 'completed';
  notesContent: string;
  groupReviewStatus: 'not_started' | 'in_progress' | 'completed';
  weights: {
    deepStudy: number; // default 20
    notes: number; // default 10
    groupReview: number; // default 10
  };
}

export interface BookCircleConfig {
  month: number;
  book1Title: string;
  book1AssignedChapters: string;
  book1Progress: number; // 0 - 100
  book2Title: string;
  book2AssignedChapters: string;
  book2Progress: number; // 0 - 100
  notesSubmitted: boolean; // default weight 40
  attendance: boolean; // default weight 40
  notesSummary?: string;
  weights: {
    notes: number; // 40
    attendance: number; // 40
  };
}

export interface LeadershipTask {
  id: string;
  taskNumber: number;
  taskName: string;
  description: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  score: number; // max 8 each (for 5 tasks = 40)
}

export interface LeadershipAccountability {
  reportsScore: number; // max 40
  reportsSubmitted: boolean;
  communicationScore: number; // max 20
  communicationDone: boolean;
  tasks: LeadershipTask[];
  weights: {
    reports: number; // 40
    communication: number; // 20
    tasks: number; // 40
  };
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  facebookMinutes: number;
  tahajjudDone: boolean;
  fastingDone: boolean;
  goalTaskDone: boolean;
  quranStudyDone: boolean;
  bookStudyDone: boolean;
  leadershipTaskDone: boolean;
  deepWorkDone: boolean;
  applicableTasks: string[];
  completedTasks: string[];
  missedTasks?: string[];
  notes?: string;
}

export interface WeeklyReportData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalScore: number;
  completionRate: number;
  categoryBreakdown: {
    categoryName: string;
    percentage: number;
    obtained: number;
    total: number;
  }[];
  completedItems: string[];
  incompleteItems: string[];
  currentStreak: number;
  deltaFromPreviousWeek: number;
}

export interface MonthlyReportData {
  monthNumber: number;
  monthName: string;
  year: number;
  status: 'Draft' | 'Submitted' | 'Verified' | 'Locked';
  totalScore: number;
  maxScore: number;
  percentage: number;
  levelBadge: string;
  categories: {
    key: string;
    name: string;
    obtained: number;
    total: number;
    percentage: number;
  }[];
  strongestArea: string;
  needsImprovement: string;
  bestStreak: number;
  mostConsistentCategory: string;
  weeklyTrend: { week: string; score: number }[];
}

export interface MotivationQuote {
  id: string;
  text: string;
  source: string;
  custom: boolean;
}

export interface NotificationSettings {
  dailyCheckIn: boolean;
  weeklyReport: boolean;
  monthlyReview: boolean;
  tahajjud: boolean;
  quranStudy: boolean;
  bookCircle: boolean;
  leadershipDeadline: boolean;
  deepWork: boolean;
}

export interface BadgeItem {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number; // 0 to 100
}

export interface AppState {
  profile: UserProfile;
  categories: CategoryConfig[];
  facebookMonthlyMinutes: number;
  personalGoal: PersonalGoal;
  tahajjudCompletedDates: string[]; // dates e.g. '2026-09-05'
  fastingCompletedDates: string[];
  deepWorkSession: DeepWorkSession;
  quranStudy: QuranStudyConfig;
  bookCircle: BookCircleConfig;
  leadership: LeadershipAccountability;
  dailyLogs: Record<string, DailyLog>; // key: YYYY-MM-DD
  motivationQuotes: MotivationQuote[];
  notifications: NotificationSettings;
  activeMonth: number; // 1 to 6
}
