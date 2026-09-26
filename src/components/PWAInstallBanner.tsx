import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { HiqmahLogo } from './HiqmahLogo';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already installed in standalone mode or dismissed for session, don't show
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* Top Notification / Install Banner */}
      <div className="bg-gradient-to-r from-[#0A3B2C] to-[#135844] text-white px-3 sm:px-4 py-2 text-xs border-b border-emerald-800/40 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-amber-300">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <p className="truncate font-semibold text-slate-100 text-[11px] sm:text-xs">
            <span className="text-amber-300 font-bold">ক্রোম শর্টকাট:</span> ওয়েবসাইটটি মোবাইলে অ্যাপ হিসেবে ইনস্টল করুন
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>অ্যাপ ইনস্টল করুন</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-emerald-200 hover:text-white rounded-md cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Guide Modal for Manual Chrome/Safari Add-to-Home-Screen */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-emerald-100 p-5 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HiqmahLogo size="xs" showSubtitle={false} />
                <h3 className="text-sm font-black text-[#0A3B2C]">
                  {isIOS ? 'আইফোনে হোম স্ক্রিনে যুক্ত করুন' : 'ক্রোম ব্রাউজারে অ্যাপ ইনস্টল'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">
                  Safari ব্রাউজারে নিচের ২টি সহজ ধাপে শর্টকাট তৈরি করুন:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900">ধাপ ১:</strong> নিচের সাফারি মেনুর <strong>Share</strong> (শেয়ার) বাটনে ট্যাপ করুন।
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-amber-100 text-amber-800 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900">ধাপ ২:</strong> নিচে স্ক্রোল করে <strong>"Add to Home Screen"</strong> (হোম স্ক্রিনে যোগ করুন) চাপুন।
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">
                  Google Chrome ব্রাউজারে যেভাবে যুক্ত করবেন:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">১</span>
                    <span>ক্রোম মেনু ওপেন করুন:</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5">
                    ক্রোমের উপরে ডানপাশে থাকা <strong>৩টি ডট (⋮)</strong> মেনুতে চাপুন।
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">২</span>
                    <span>ইনস্টল বা শর্টকাট সিলেক্ট করুন:</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5">
                    <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> (হোম স্ক্রিনে যোগ করুন) চাপুন।
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>সুবিধাসমূহ:</span>
                  </div>
                  <p>✓ মোবাইলের হোম স্ক্রিনে সরাসরি অ্যাপের মতো আইকন থাকবে।</p>
                  <p>✓ কোনো ব্রাউজার ইউআরএল বার ছাড়াই ফুল-স্ক্রিনে চলবে।</p>
                  <p>✓ ইন্টারনেট না থাকলেও অফলাইনে কাজ করবে।</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              বুঝেছি (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
