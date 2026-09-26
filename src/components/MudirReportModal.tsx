import React, { useState, useRef } from 'react';
import { AppState } from '../types';
import { calculateScores, generateWeeklyReport, generateMonthlyReport, calculateStreak } from '../utils/scoring';
import { downloadElementAsPDF, sharePDF } from '../utils/pdfGenerator';
import {
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  X,
  Shield,
  FileText,
  Calendar,
  User,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';

interface MudirReportModalProps {
  state: AppState;
  onClose: () => void;
  defaultType?: 'monthly' | 'weekly' | 'sixMonths';
  isOpen?: boolean;
  reportType?: 'monthly' | 'weekly' | 'sixMonths';
}

export const MudirReportModal: React.FC<MudirReportModalProps> = ({
  state,
  onClose,
  defaultType = 'monthly',
  isOpen,
  reportType: propReportType,
}) => {
  if (isOpen !== undefined && !isOpen) return null;

  const [reportType, setReportType] = useState<'monthly' | 'weekly' | 'sixMonths'>(propReportType || defaultType);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [mudirName, setMudirName] = useState<string>('মুহতারাম মুদির / পরিচালক মহোদয়');
  const [copied, setCopied] = useState(false);

  // PDF Generation State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);
  const [pdfStatusType, setPdfStatusType] = useState<'info' | 'success' | 'error' | null>(null);
  const [lastPdfBlob, setLastPdfBlob] = useState<Blob | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
  const canWebShare = typeof navigator !== 'undefined' && !!navigator.share;

  const scores = calculateScores(state);
  const weeklyData = generateWeeklyReport(state, selectedWeek);
  const monthlyData = generateMonthlyReport(state, selectedMonth);
  const today = new Date();
  const submissionDateStr = today.toISOString().split('T')[0];
  const streak = calculateStreak(state.dailyLogs, submissionDateStr);

  // Journey day calculation
  const start = new Date(state.profile.journeyStartDate || submissionDateStr);
  const diffDays = Math.max(1, Math.min(180, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1));

  // Grade determination
  const getGradeText = (pct: number) => {
    if (pct >= 90) return { grade: 'মুমতায (অনুকরণীয়)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (pct >= 80) return { grade: 'জায়্যিদ জিদ্দান (খুব ভালো)', color: 'text-teal-700 bg-teal-50 border-teal-300' };
    if (pct >= 70) return { grade: 'জায়্যিদ (সন্তোষজনক)', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (pct >= 60) return { grade: 'মাকবুল (উন্নতির সুযোগ আছে)', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    return { grade: 'জরুরি পর্যালোচনা ও কাউন্সিলিং কাম্য', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  const evaluation = getGradeText(reportType === 'weekly' ? weeklyData.completionRate : monthlyData.percentage);

  // Direct High-Resolution Client-Side PDF Download (Works 100% in installed apps & mobile)
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);
    setPdfStatusMessage('পিডিএফ প্রস্তুত হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন...');
    setPdfStatusType('info');

    const periodLabel =
      reportType === 'weekly'
        ? `Weekly-Week${selectedWeek + 1}`
        : reportType === 'monthly'
        ? `Monthly-Month${selectedMonth}`
        : 'SixMonths-Transformation';

    const fileName = `Youth-of-Hiqmah-Report-${periodLabel}-${submissionDateStr}.pdf`;

    try {
      const result = await downloadElementAsPDF(reportRef.current, { fileName });
      setIsGeneratingPDF(false);
      if (result.success && result.blob) {
        setLastPdfBlob(result.blob);
        setPdfStatusMessage('✓ PDF ফাইল সফলভাবে আপনার ডিভাইসে ডাউনলোড হয়েছে!');
        setPdfStatusType('success');
        setTimeout(() => setPdfStatusMessage(null), 6000);
      } else {
        setPdfStatusMessage(result.error || 'PDF ডাউনলোড ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
        setPdfStatusType('error');
        setTimeout(() => setPdfStatusMessage(null), 6000);
      }
    } catch (err: any) {
      setIsGeneratingPDF(false);
      setPdfStatusMessage('PDF তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      setPdfStatusType('error');
      setTimeout(() => setPdfStatusMessage(null), 6000);
    }
  };

  // Trigger browser print with automatic fallback if blocked in installed apps
  const handlePrint = () => {
    try {
      window.print();
      if (isStandalone) {
        setPdfStatusMessage('💡 ইনস্টল করা অ্যাপে যদি প্রিন্ট প্রিভিউ না আসে, তবে "PDF ডাউনলোড" বাটন ব্যবহার করুন।');
        setPdfStatusType('info');
        setTimeout(() => setPdfStatusMessage(null), 6000);
      }
    } catch (err) {
      console.warn('Direct print blocked or failed, falling back to PDF download:', err);
      setPdfStatusMessage('⚠️ প্রিন্ট সার্ভিস সমর্থিত না হওয়ায় সরাসরি PDF ডাউনলোড শুরু হচ্ছে...');
      setPdfStatusType('info');
      handleDownloadPDF();
    }
  };

  // Share PDF on mobile / messaging apps
  const handleSharePDF = async () => {
    const periodLabel =
      reportType === 'weekly'
        ? `Weekly-Week${selectedWeek + 1}`
        : reportType === 'monthly'
        ? `Monthly-Month${selectedMonth}`
        : 'SixMonths-Transformation';
    const fileName = `Youth-of-Hiqmah-Report-${periodLabel}-${submissionDateStr}.pdf`;

    if (lastPdfBlob && canWebShare) {
      await sharePDF(lastPdfBlob, fileName);
    } else {
      if (!reportRef.current) return;
      setIsGeneratingPDF(true);
      setPdfStatusMessage('পিডিএফ তৈরি করে শেয়ার উইন্ডো ওপেন করা হচ্ছে...');
      setPdfStatusType('info');
      const res = await downloadElementAsPDF(reportRef.current, { fileName });
      setIsGeneratingPDF(false);
      if (res.success && res.blob) {
        setLastPdfBlob(res.blob);
        if (canWebShare) {
          await sharePDF(res.blob, fileName);
        }
        setPdfStatusMessage('✓ PDF প্রস্তুত ও ডাউনলোড সম্পন্ন!');
        setPdfStatusType('success');
        setTimeout(() => setPdfStatusMessage(null), 5000);
      }
    }
  };

  // Generate plain-text report for WhatsApp / Telegram / Email
  const handleCopyTextReport = () => {
    const periodLabel = reportType === 'weekly'
      ? `সপ্তাহ ০${selectedWeek + 1} রিপোর্ট`
      : reportType === 'monthly'
      ? `মাস ০${selectedMonth} মূল্যায়ন রিপোর্ট`
      : '৬ মাসের সার্বিক রূপান্তর রিপোর্ট';

    const currentPct = reportType === 'weekly' ? weeklyData.completionRate : monthlyData.percentage;
    const currentScore = reportType === 'weekly'
      ? `${weeklyData.totalScore} মার্কস`
      : `${scores.obtainedTotal}/${scores.maxTotal}`;

    let text = `📋 *Youth of hiqmah — প্রগ্রেস ও জবাবদিহিতা রিপোর্ট*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *প্রার্থী:* ${state.profile.name}\n`;
    text += `🎯 *মূল লক্ষ্য:* ${state.profile.mainGoalTitle}\n`;
    text += `📅 *রিপোর্ট পিরিয়ড:* ${periodLabel}\n`;
    text += `⏳ *সফরের অবস্থান:* DAY ${diffDays} / 180 (ধারাবাহিক স্ট্রিক: ${streak} দিন)\n`;
    text += `📨 *প্রেরিতব্য:* ${mudirName}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `🏆 *সার্বিক ফলাফল:*\n`;
    text += `• মোট নম্বর: ${currentScore} (${currentPct}%)\n`;
    text += `• মূল্যায়ন মান: ${evaluation.grade}\n\n`;

    text += `📊 *৭টি ক্যাটাগরির বিস্তারিত আমল ও অগ্রগতি:*\n`;
    scores.breakdown.forEach((cat, idx) => {
      text += `${idx + 1}. ${cat.nameBn}: ${cat.obtained}/${cat.total} (${cat.percentage}%)\n`;
    });

    text += `\n📌 *ফেসবুক স্ক্রিন টাইম:* মাসে ${state.facebookMonthlyMinutes} মিনিট (অনুমোদিত ৩০০ মিনিট)\n`;
    text += `🌙 *তাহাজ্জুদ সম্পন্ন:* ${state.tahajjudCompletedDates.length} দিন / ৬ দিন\n`;
    text += `⚡ *নফল সিয়াম সাধনা:* ${state.fastingCompletedDates.length} দিন / ৬ দিন\n`;
    text += `📖 *কুরআন অধ্যয়ন:* ${state.quranStudy.assignedSurahOrJuz}\n`;
    text += `📚 *বুক সার্কেল:* ${state.bookCircle.book1AssignedChapters}\n\n`;

    text += `💬 *আত্ম-পর্যালোচনা ও সংকল্প:*\n`;
    text += `“আল্লাহর সাহায্যে ছোট ছোট দৈনন্দিন আমলের দৃঢ়তায় নিজেকে দ্বীন ও উম্মাহর যোগ্য সেবক হিসেবে গড়ে তোলার অবিচল প্রত্যয়।”\n\n`;
    text += `_তারিখ: ${submissionDateStr}_\n`;
    text += `_Youth of hiqmah Accountability System_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto printable-modal-wrapper">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-teal-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print p-4 sm:p-5 bg-gradient-to-r from-[#1A0B2E] via-[#0A132C] to-[#05212A] border-b border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                মুদিরের সমীপে প্রগ্রেস রিপোর্ট (PDF / Print)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              মুদির বা পরিচালকের নিকট প্রেরণের জন্য প্রস্তুত আনুষ্ঠানিক রিপোর্ট
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* PRIMARY ACTION: Download Authentic PDF File */}
            <button
              id="btn-download-pdf-report"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-teal-500/25 active:scale-95 cursor-pointer disabled:opacity-50"
              title="রিপোর্টটি সরাসরি পিডিএফ ফাইল হিসেবে ডিভাইসে ডাউনলোড করুন"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPDF ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
            </button>

            {/* Print Button with fallback */}
            <button
              id="btn-print-pdf-report"
              onClick={handlePrint}
              disabled={isGeneratingPDF}
              className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="প্রিন্ট প্রিভিউ ওপেন করুন"
            >
              <Printer className="w-4 h-4 text-purple-300" />
              <span>প্রিন্ট</span>
            </button>

            {/* Web Share (if supported on mobile / PWA) */}
            {canWebShare && (
              <button
                id="btn-share-pdf-report"
                onClick={handleSharePDF}
                disabled={isGeneratingPDF}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="হোয়াটসঅ্যাপ, টেলিগ্রাম বা ড্রাইভের মাধ্যমে সরাসরি শেয়ার করুন"
              >
                <Share2 className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">শেয়ার</span>
              </button>
            )}

            {/* Copy text for messaging */}
            <button
              id="btn-copy-text-report"
              onClick={handleCopyTextReport}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="মুদিরকে হোয়াটসঅ্যাপ বা মেসেজে পাঠানোর জন্য টেক্সট কপি করুন"
            >
              {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে!' : 'টেক্সট'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Status Toast Banner */}
        {pdfStatusMessage && (
          <div
            className={`no-print px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 border-b transition-all animate-in fade-in ${
              pdfStatusType === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-inner'
                : pdfStatusType === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                : 'bg-teal-950/90 text-teal-200 border-teal-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              {pdfStatusType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : pdfStatusType === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
              )}
              <span>{pdfStatusMessage}</span>
            </div>
            <button
              onClick={() => setPdfStatusMessage(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Offline & Installed Mode Help Notice */}
        <div className="no-print px-4 py-2 bg-gradient-to-r from-purple-950/40 via-[#0A132C] to-teal-950/30 border-b border-purple-900/30 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>
              ইনস্টল করা অ্যাপ ও মোবাইলে <strong>"PDF ডাউনলোড"</strong> বাটনে ক্লিক করলে সরাসরি আপনার ডিভাইসে সম্পূর্ণ অফলাইন A4 PDF ফাইল ডাউনলোড হবে।
            </span>
          </div>
          {isStandalone && (
            <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-600/40 font-bold text-[10px] shrink-0 ml-2">
              ইনস্টল্ড অ্যাপ
            </span>
          )}
        </div>

        {/* Filter Controls (Hidden on Print) */}
        <div className="no-print p-3 sm:px-6 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">রিপোর্ট ধরন:</span>
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setReportType('monthly')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  reportType === 'monthly' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                মাসিক রিপোর্ট
              </button>
              <button
                onClick={() => setReportType('weekly')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  reportType === 'weekly' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                সাপ্তাহিক রিপোর্ট
              </button>
              <button
                onClick={() => setReportType('sixMonths')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  reportType === 'sixMonths' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ৬ মাসের রূপান্তর
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {reportType === 'monthly' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">মাস নির্বাচন:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value={1}>মাস ০১ (সেপ্টেম্বর)</option>
                  <option value={2}>মাস ০২ (অক্টোবর)</option>
                  <option value={3}>মাস ০৩ (নভেম্বর)</option>
                  <option value={4}>মাস ০৪ (ডিসেম্বর)</option>
                  <option value={5}>মাস ০৫ (জানুয়ারি)</option>
                  <option value={6}>মাস ০৬ (ফেব্রুয়ারি)</option>
                </select>
              </div>
            )}

            {reportType === 'weekly' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">সপ্তাহ নির্বাচন:</span>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value={0}>সপ্তাহ ১ (দিন ১-৭)</option>
                  <option value={1}>সপ্তাহ ২ (দিন ৮-১৪)</option>
                  <option value={2}>সপ্তাহ ৩ (দিন ১৫-২১)</option>
                  <option value={3}>সপ্তাহ ৪ (দিন ২২-২৮)</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">মুদিরের সম্বোধন:</span>
              <input
                type="text"
                value={mudirName}
                onChange={(e) => setMudirName(e.target.value)}
                placeholder="মুদিরের নাম"
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs w-36 sm:w-48 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Document Preview / Printable Report Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40">
          <div
            ref={reportRef}
            id="printable-report-content"
            className="printable-report-area max-w-3xl mx-auto bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl font-sans text-xs sm:text-sm border border-slate-200"
          >
            {/* Report Official Header: Clean, Highly Legible Typography */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-sans">
                    Youth <span className="font-serif italic font-normal text-purple-900 text-xl sm:text-2xl">of</span>{' '}
                    <span className="text-teal-800 font-extrabold">Hiqmah</span>
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
                </div>
                <p className="text-[12px] font-bold text-teal-800 mt-0.5">
                  ৬ মাসের আত্ম-উন্নয়ন, লক্ষ্য অর্জন, নিয়মানুবর্তিতা ও জবাবদিহিতা সিস্টেম
                </p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">
                  “Small Daily Actions → Weekly Reports → Monthly Scores → 6-Month Transformation”
                </p>
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-300 font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  {reportType === 'monthly' ? `মাসিক মূল্যায়ন রিপোর্ট (${selectedMonth}/৬)` : reportType === 'weekly' ? `সাপ্তাহিক প্রগ্রেস রিপোর্ট (${selectedWeek + 1}/৪)` : 'সার্বিক ৬ মাসের রূপান্তর রিপোর্ট'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">পেশ করার তারিখ: {submissionDateStr}</p>
              </div>
            </div>

            {/* Recipient & Candidate Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
              <div className="space-y-1">
                <div><strong className="text-slate-700">বরাবর:</strong> <span className="font-semibold text-slate-900">{mudirName}</span></div>
                <div><strong className="text-slate-700">সংগঠন:</strong> Youth of hiqmah কাফেলা</div>
                <div><strong className="text-slate-700">রিপোর্ট পর্ব:</strong> {reportType === 'weekly' ? `সপ্তাহ ০${selectedWeek + 1} (দিন ${(selectedWeek * 7) + 1} - ${(selectedWeek * 7) + 7})` : `মাস ০${selectedMonth}`}</div>
              </div>
              <div className="space-y-1">
                <div><strong className="text-slate-700">প্রার্থীর নাম:</strong> <span className="font-bold text-slate-950">{state.profile.name}</span></div>
                <div><strong className="text-slate-700">সফরের অগ্রগতি:</strong> DAY {diffDays} / 180 দিন (ধারাবাহিক স্ট্রিক: {streak} দিন)</div>
                <div><strong className="text-slate-700">ব্যক্তিগত ৬ মাসের গোল:</strong> <span className="italic">{state.profile.mainGoalTitle}</span></div>
              </div>
            </div>

            {/* Score & Evaluation Banner */}
            <div className="p-4 rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100 via-white to-slate-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">সার্বিক মূল্যায়ন ফলাফল</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  {reportType === 'weekly' ? `${weeklyData.totalScore} মার্কস` : `${scores.obtainedTotal} / ${scores.maxTotal}`}{' '}
                  <span className="text-base font-bold text-teal-700">
                    ({reportType === 'weekly' ? weeklyData.completionRate : monthlyData.percentage}%)
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">অর্জিত মান ও স্ট্যাটাস</span>
                <span className={`inline-block px-3 py-1 rounded-lg border font-bold text-xs ${evaluation.color}`}>
                  {evaluation.grade}
                </span>
              </div>
            </div>

            {/* Detailed Performance Table (7 Categories) */}
            <div className="mb-6 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                ৭টি নির্ধারিত আমল ও ক্যাটাগরির বিস্তারিত মূল্যায়ন
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                      <th className="p-2.5 font-bold">নং</th>
                      <th className="p-2.5 font-bold">ক্যাটাগরি ও বিষয়</th>
                      <th className="p-2.5 font-bold text-center">মোট মান</th>
                      <th className="p-2.5 font-bold text-center">প্রাপ্ত নম্বর</th>
                      <th className="p-2.5 font-bold text-center">অগ্রগতি (%)</th>
                      <th className="p-2.5 font-bold text-right">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scores.breakdown.map((cat, idx) => (
                      <tr key={cat.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2.5 font-medium text-slate-500">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{cat.nameBn}</div>
                          <div className="text-[10px] text-slate-500">{cat.name}</div>
                        </td>
                        <td className="p-2.5 text-center font-semibold text-slate-700">{cat.total}</td>
                        <td className="p-2.5 text-center font-bold text-slate-950">{cat.obtained}</td>
                        <td className="p-2.5 text-center">
                          <span className="font-bold text-teal-800">{cat.percentage}%</span>
                        </td>
                        <td className="p-2.5 text-right font-medium">
                          {cat.percentage >= 80 ? (
                            <span className="text-emerald-700">উত্তম</span>
                          ) : cat.percentage >= 60 ? (
                            <span className="text-amber-700">চলতি</span>
                          ) : (
                            <span className="text-rose-700">মনোযোগ কাম্য</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200/80 font-black text-slate-950 border-t-2 border-slate-400">
                      <td colSpan={2} className="p-2.5 text-right uppercase">সর্বমোট:</td>
                      <td className="p-2.5 text-center">{scores.maxTotal}</td>
                      <td className="p-2.5 text-center">{scores.obtainedTotal}</td>
                      <td className="p-2.5 text-center text-teal-900">{scores.percentage}%</td>
                      <td className="p-2.5 text-right">{scores.percentage >= 70 ? 'সফল' : 'ঘাটতি'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Special Focus Points Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
              <div>
                <strong className="text-slate-800 block">📱 ফেসবুক নিয়ন্ত্রণ:</strong>
                <span className="text-slate-600">
                  {state.facebookMonthlyMinutes} মি. ব্যবহৃত / ৩০০ মি. সর্বোচ্চ
                  {state.facebookMonthlyMinutes > 300 && <span className="text-rose-600 font-bold ml-1">(পেনাল্টি কার্যকর)</span>}
                </span>
              </div>
              <div>
                <strong className="text-slate-800 block">🌙 তাহাজ্জুদ ও সিয়াম:</strong>
                <span className="text-slate-600">
                  তাহাজ্জুদ: {state.tahajjudCompletedDates.length}/৬ দিন | সিয়াম: {state.fastingCompletedDates.length}/৬ দিন
                </span>
              </div>
              <div>
                <strong className="text-slate-800 block">📚 কুরআন ও বই পাঠ:</strong>
                <span className="text-slate-600">
                  কুরআন: {state.quranStudy.notesStatus === 'completed' ? 'নোট জমা' : 'চলমান'} | বই: {state.bookCircle.notesSubmitted ? 'নোট জমা' : 'চলমান'}
                </span>
              </div>
            </div>

            {/* Candidate Reflection & Declaration */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white mb-8 text-xs space-y-2">
              <h5 className="font-bold text-slate-900 uppercase tracking-wide">
                প্রার্থীর স্ব-মূল্যায়ন ও অঙ্গীকার (Candidate Reflection):
              </h5>
              <p className="text-slate-700 leading-relaxed italic">
                “আমি আন্তরিকভাবে সাক্ষ্য দিচ্ছি যে উপরোক্ত রিপোর্টটি সত্যনিষ্ঠ ও আমানতদারিতার সাথে হিসাবকৃত। যেসব বিষয়ে ঘাটতি হয়েছে, সেগুলোর জন্য আল্লাহর নিকট তাওবা ও ক্ষমা প্রার্থনা করে আগামী পর্বে হিকমাহর নির্দেশনানুযায়ী সর্বোচ্চ নিয়মানুবর্তিতা বজায় রাখার দৃঢ় সংকল্প করছি।”
              </p>
              <div className="pt-2 flex justify-between items-end">
                <span className="text-[11px] text-slate-500">প্রার্থীর স্বাক্ষর: <strong className="text-slate-900 underline ml-1">{state.profile.name}</strong></span>
                <span className="text-[11px] text-slate-500">তারিখ: {submissionDateStr}</span>
              </div>
            </div>

            {/* Official Mudir / Director Review & Signature Section */}
            <div className="pt-6 border-t-2 border-dashed border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
              <div>
                <h5 className="font-bold text-slate-900 uppercase tracking-wide mb-1">
                  মুদির / পরিচালকের মূল্যায়ন ও পরামর্শ:
                </h5>
                <div className="h-20 rounded-lg border border-slate-300 p-2 text-slate-400 italic">
                  [মুদিরের মন্তব্য, দোয়া ও বিশেষ নির্দেশনা...]
                </div>
              </div>

              <div className="flex flex-col justify-end items-center sm:items-end space-y-2 text-center sm:text-right">
                <div className="w-48 border-b-2 border-slate-800 pb-1 text-center font-bold text-slate-900">
                  {mudirName}
                </div>
                <span className="text-[11px] text-slate-600">মুদির / পরিচালক, Youth of hiqmah</span>
                <span className="text-[10px] text-slate-400">স্বাক্ষর ও তারিখ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
