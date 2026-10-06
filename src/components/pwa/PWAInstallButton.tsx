import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, MoreVertical, X, CheckCircle } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as standalone installed app, hide prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#2E473B] text-[#F7F3E9] hover:bg-[#23372E] active:scale-95 transition-all shadow-xs shrink-0"
        aria-label="Install Amanah on your phone"
      >
        <Download className="w-3.5 h-3.5 text-[#E2D4B7]" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#FBFBF9] p-5 shadow-2xl border border-[#E3DDD1]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2E473B] flex items-center justify-center text-[#E2D4B7] font-semibold text-sm">
                  أ
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2421]">Install Amanah App</h3>
                  <p className="text-[11px] text-[#717E75]">Run as a fast, private standalone app</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-[#6B756E] hover:text-[#1F2421] hover:bg-[#EAE6DD]"
                aria-label="Close guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-[#445047] leading-relaxed">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F1EA]">
                  <Share2 className="w-4 h-4 text-[#2E473B] shrink-0 mt-0.5" />
                  <p>1. Tap the <strong>Share</strong> button at the bottom of Safari.</p>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F1EA]">
                  <PlusSquare className="w-4 h-4 text-[#2E473B] shrink-0 mt-0.5" />
                  <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-[#445047] leading-relaxed">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F1EA]">
                  <MoreVertical className="w-4 h-4 text-[#2E473B] shrink-0 mt-0.5" />
                  <p>1. Tap the <strong>three dots (⋮)</strong> in Chrome at the top right.</p>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F1EA]">
                  <Download className="w-4 h-4 text-[#2E473B] shrink-0 mt-0.5" />
                  <p>2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EBE4D5] text-[11px] text-[#6E5C3B] space-y-1">
                  <p className="font-semibold text-[#4F3E22]">💡 If Chrome shows "Download failed" / "Couldn't install":</p>
                  <p>Turn on <strong>Airplane mode</strong> for 3 seconds, tap Chrome's <strong>three dots (⋮)</strong> → tap <strong>Add to Home screen</strong>, then turn Airplane mode back off.</p>
                  <p className="text-[10px] text-[#867352]">Or open the link in <strong>Samsung Internet</strong>, <strong>Edge</strong>, or <strong>Firefox</strong> to install instantly in 1 tap!</p>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4F1EA]">
                  <CheckCircle className="w-4 h-4 text-[#2E473B] shrink-0 mt-0.5" />
                  <p>Amanah will launch full-screen with its app icon on your home screen!</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-xl bg-[#2E473B] py-2.5 text-xs font-medium text-[#F7F3E9] hover:bg-[#23372E] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
