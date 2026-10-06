import React, { useState } from 'react';
import { Heart, Sparkles, RefreshCw, BookOpen, Quote, Check, Copy } from 'lucide-react';
import { MARITAL_INSPIRATIONS, getDailyMaritalInspiration, MaritalInspiration } from '../../data/maritalInspirations';
import { triggerHapticFeedback, playCalmChime } from '../../lib/notifications/notificationService';

export const DailyInspirationCard: React.FC = () => {
  const dayOfYear = Math.floor(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );

  const [currentIndex, setCurrentIndex] = useState(dayOfYear % MARITAL_INSPIRATIONS.length);
  const [copied, setCopied] = useState(false);

  const inspiration: MaritalInspiration = MARITAL_INSPIRATIONS[currentIndex];

  const handleNext = () => {
    triggerHapticFeedback();
    setCurrentIndex((prev) => (prev + 1) % MARITAL_INSPIRATIONS.length);
  };

  const handleCopy = () => {
    triggerHapticFeedback();
    const textToCopy = `«${inspiration.english}»\n— ${inspiration.source}\n\nReflection: ${inspiration.reflection}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    playCalmChime();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FCFBF8] to-[#F7F4EB] border border-[#E8E1D2] shadow-xs space-y-3 relative overflow-hidden">
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2D4B7]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FAF0E6] border border-[#EADBBD] flex items-center justify-center text-[#7F5353]">
            <Heart className="w-3.5 h-3.5 fill-[#7F5353]/20" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#8B6E38] uppercase tracking-wider block">
              Daily Inspiration · Husband & Wife
            </span>
            <span className="text-xs font-serif font-bold text-[#1F2421]">
              {inspiration.theme}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-[#DDD5C5] text-[#6B756E] hover:text-[#1F2421] hover:bg-white transition-colors"
            title="Copy inspiration"
            aria-label="Copy inspiration"
          >
            {copied ? <Check className="w-3 h-3 text-[#2E473B]" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-[#DDD5C5] text-[#6B756E] hover:text-[#1F2421] hover:bg-white transition-colors"
            title="Read another verse or hadith"
            aria-label="Next inspiration"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Arabic Script */}
      <div className="p-3.5 rounded-2xl bg-white/80 border border-[#ECE5D8] text-right">
        <p className="font-serif text-base sm:text-lg text-[#1F2421] leading-loose selection:bg-[#E2D4B7]" dir="rtl">
          {inspiration.arabic}
        </p>
      </div>

      {/* English Translation */}
      <div className="space-y-1">
        <p className="text-xs font-serif italic text-[#1F2421] leading-relaxed">
          «{inspiration.english}»
        </p>
        <span className="text-[10px] font-mono font-medium text-[#7A6B53] block text-right">
          — {inspiration.source}
        </span>
      </div>

      {/* Practical Marital Reflection */}
      <div className="pt-1.5 border-t border-[#EAE3D4]/80 flex items-start gap-2 text-xs text-[#525E56] leading-relaxed">
        <Sparkles className="w-3.5 h-3.5 text-[#A58957] shrink-0 mt-0.5" />
        <p className="text-[11px]">
          {inspiration.reflection}
        </p>
      </div>
    </div>
  );
};
