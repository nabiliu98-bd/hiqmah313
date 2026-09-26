import React, { useState } from 'react';
import { AppState, GoalSubtask, PersonalGoal } from '../types';
import { calculateScores } from '../utils/scoring';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Save,
  X,
  TrendingUp,
} from 'lucide-react';

interface GoalsViewProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onOpenMotivation: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  state,
  onUpdateState,
  onOpenMotivation,
}) => {
  const goal = state.personalGoal;
  const scores = calculateScores(state);
  const goalScore = scores.breakdown.find((c) => c.key === 'goal') || {
    obtained: 90,
    total: 200,
    percentage: 45,
  };

  // State for Goal Edit Modal
  const [isEditingMainGoal, setIsEditingMainGoal] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDesc, setEditDesc] = useState(goal.description);
  const [editMonthlyTarget, setEditMonthlyTarget] = useState(goal.monthlyTarget);
  const [editWeeklyTarget, setEditWeeklyTarget] = useState(goal.weeklyTarget);
  const [editPriority, setEditPriority] = useState(goal.priority);
  const [editWeight, setEditWeight] = useState(goal.totalWeight || 200);

  // State for Subtask Add/Edit Modal
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskWeight, setSubtaskWeight] = useState(30);
  const [subtaskDueDate, setSubtaskDueDate] = useState('2026-10-15');

  // Toggle subtask completed status
  const handleToggleSubtask = (subtaskId: string) => {
    onUpdateState((prev) => {
      const updatedSubtasks = prev.personalGoal.subtasks.map((st) => {
        if (st.id === subtaskId) {
          return { ...st, completed: !st.completed };
        }
        return st;
      });

      return {
        ...prev,
        personalGoal: {
          ...prev.personalGoal,
          subtasks: updatedSubtasks,
        },
      };
    });
  };

  // Save Main Goal edits
  const handleSaveMainGoal = () => {
    onUpdateState((prev) => ({
      ...prev,
      personalGoal: {
        ...prev.personalGoal,
        title: editTitle,
        description: editDesc,
        monthlyTarget: editMonthlyTarget,
        weeklyTarget: editWeeklyTarget,
        priority: editPriority,
        totalWeight: editWeight,
      },
    }));
    setIsEditingMainGoal(false);
  };

  // Move subtask up or down
  const handleMoveSubtask = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= goal.subtasks.length) return;

    onUpdateState((prev) => {
      const newSubtasks = [...prev.personalGoal.subtasks];
      const temp = newSubtasks[index];
      newSubtasks[index] = newSubtasks[targetIndex];
      newSubtasks[targetIndex] = temp;

      return {
        ...prev,
        personalGoal: {
          ...prev.personalGoal,
          subtasks: newSubtasks,
        },
      };
    });
  };

  // Delete subtask
  const handleDeleteSubtask = (id: string) => {
    onUpdateState((prev) => ({
      ...prev,
      personalGoal: {
        ...prev.personalGoal,
        subtasks: prev.personalGoal.subtasks.filter((st) => st.id !== id),
      },
    }));
  };

  // Save or Add subtask
  const handleSaveSubtask = () => {
    if (!subtaskTitle.trim()) return;

    onUpdateState((prev) => {
      let updatedSubtasks = [...prev.personalGoal.subtasks];

      if (editingSubtaskId) {
        updatedSubtasks = updatedSubtasks.map((st) =>
          st.id === editingSubtaskId
            ? {
                ...st,
                title: subtaskTitle,
                weight: subtaskWeight,
                dueDate: subtaskDueDate,
              }
            : st
        );
      } else {
        const newSubtask: GoalSubtask = {
          id: `st-${Date.now()}`,
          title: subtaskTitle,
          weight: subtaskWeight,
          completed: false,
          dueDate: subtaskDueDate,
        };
        updatedSubtasks.push(newSubtask);
      }

      return {
        ...prev,
        personalGoal: {
          ...prev.personalGoal,
          subtasks: updatedSubtasks,
        },
      };
    });

    setIsAddingSubtask(false);
    setEditingSubtaskId(null);
    setSubtaskTitle('');
  };

  const openEditSubtask = (st: GoalSubtask) => {
    setEditingSubtaskId(st.id);
    setSubtaskTitle(st.title);
    setSubtaskWeight(st.weight);
    setSubtaskDueDate(st.dueDate || '2026-10-15');
    setIsAddingSubtask(true);
  };

  // 6-Month trajectory projection
  const trajectoryData = [
    { month: 'Month 1', progress: goalScore.percentage, target: 35 },
    { month: 'Month 2', progress: 0, target: 50 },
    { month: 'Month 3', progress: 0, target: 65 },
    { month: 'Month 4', progress: 0, target: 75 },
    { month: 'Month 5', progress: 0, target: 88 },
    { month: 'Month 6', progress: 0, target: 100 },
  ];

  return (
    <div className="space-y-4 pb-28">
      {/* Category 02 Header & Main Goal Card */}
      <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0A3B2C] via-[#0D4E3A] to-[#06281F] text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                CATEGORY 02 — মূল লক্ষ্য
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-bold">
                মোট ওয়েট: {goal.totalWeight || 200} পয়েন্ট
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {goal.title}
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
              {goal.description}
            </p>
          </div>

          <button
            id="btn-edit-main-goal"
            onClick={() => {
              setEditTitle(goal.title);
              setEditDesc(goal.description);
              setEditMonthlyTarget(goal.monthlyTarget);
              setEditWeeklyTarget(goal.weeklyTarget);
              setEditPriority(goal.priority);
              setEditWeight(goal.totalWeight || 200);
              setIsEditingMainGoal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>লক্ষ্য কাস্টমাইজ করুন</span>
          </button>
        </div>

        {/* Targets & Completion Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-white/15">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-200">মাসিক টার্গেট</span>
            <p className="text-xs font-semibold text-white mt-0.5">{goal.monthlyTarget}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/10 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-300">সাপ্তাহিক টার্গেট</span>
            <p className="text-xs font-semibold text-white mt-0.5">{goal.weeklyTarget}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200">অর্জিত স্কোর</span>
              <p className="text-lg font-black text-white mt-0.5">
                {goalScore.obtained} / {goalScore.total}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-300">{goalScore.percentage}%</span>
              <div className="w-16 h-2 rounded-full bg-emerald-950/80 mt-1 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${goalScore.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subtasks Section with Add/Edit/Reorder/Delete */}
      <section className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#0A3B2C] flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              ব্যক্তিগত সাব-টাস্ক ও মূল্যায়ন পয়েন্ট (Sub-tasks)
            </h3>
            <p className="text-xs text-slate-500">
              সাব-টাস্ক সম্পন্ন করলে স্বয়ংক্রিয়ভাবে ২০০ নম্বরের মধ্যে স্কোর যুক্ত হবে
            </p>
          </div>

          <button
            id="btn-add-subtask"
            onClick={() => {
              setEditingSubtaskId(null);
              setSubtaskTitle('');
              setSubtaskWeight(30);
              setSubtaskDueDate('2026-10-15');
              setIsAddingSubtask(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ সাব-টাস্ক যোগ করুন</span>
          </button>
        </div>

        {/* Subtask list */}
        <div className="space-y-2">
          {goal.subtasks.map((st, index) => (
            <div
              key={st.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                st.completed
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-600'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-300 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Checkbox */}
                <button
                  id={`btn-toggle-goal-subtask-${st.id}`}
                  onClick={() => handleToggleSubtask(st.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    st.completed
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'border-2 border-slate-400 hover:border-emerald-600 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="min-w-0">
                  <p
                    className={`text-xs sm:text-sm font-bold truncate ${
                      st.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {st.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="text-emerald-700 font-bold">পয়েন্ট: {st.weight}</span>
                    {st.dueDate && <span>• ডেডলাইন: {st.dueDate}</span>}
                  </div>
                </div>
              </div>

              {/* Action Controls: Up, Down, Edit, Delete */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleMoveSubtask(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="উপরে নিন"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveSubtask(index, 'down')}
                  disabled={index === goal.subtasks.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="নিচে নিন"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openEditSubtask(st)}
                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-800 cursor-pointer"
                  title="এডিট"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 cursor-pointer"
                  title="মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {goal.subtasks.length === 0 && (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
              কোনো সাব-টাস্ক যুক্ত করা নেই। "+ সাব-টাস্ক যোগ করুন" বাটনে ক্লিক করে নতুন সাব-টাস্ক যোগ করুন।
            </div>
          )}
        </div>
      </section>

      {/* 6-Month Goal Progress Line Chart */}
      <section className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          ৬ মাসের গোল অগ্রগতি ট্র্যাজেক্টরি
        </h3>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#A7F3D0', borderRadius: '12px', color: '#0A3B2C' }}
              />
              <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2} name="টার্গেট (%)" />
              <Line type="monotone" dataKey="progress" stroke="#16A34A" strokeWidth={3} name="প্রকৃত অগ্রগতি (%)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* MODAL 1: Edit Main Goal */}
      {isEditingMainGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-emerald-100 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                প্রধান লক্ষ্য কাস্টমাইজ করুন
              </h3>
              <button
                onClick={() => setIsEditingMainGoal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">লক্ষ্যের শিরোনাম:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">বিবরণ / উদ্দেশ্য:</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">মাসিক টার্গেট:</label>
                  <input
                    type="text"
                    value={editMonthlyTarget}
                    onChange={(e) => setEditMonthlyTarget(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">সাপ্তাহিক টার্গেট:</label>
                  <input
                    type="text"
                    value={editWeeklyTarget}
                    onChange={(e) => setEditWeeklyTarget(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditingMainGoal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveMainGoal}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                পরিবর্তন সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add/Edit Subtask */}
      {isAddingSubtask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-emerald-100 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingSubtaskId ? 'সাব-টাস্ক সম্পাদনা' : 'নতুন সাব-টাস্ক যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setIsAddingSubtask(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">টাস্কের নাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: অধ্যায় ১-৩ নোট সম্পন্ন করা..."
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">পয়েন্ট / ওয়েট:</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={subtaskWeight}
                    onChange={(e) => setSubtaskWeight(parseInt(e.target.value) || 20)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">সমাপ্তির তারিখ:</label>
                  <input
                    type="date"
                    value={subtaskDueDate}
                    onChange={(e) => setSubtaskDueDate(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddingSubtask(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveSubtask}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
