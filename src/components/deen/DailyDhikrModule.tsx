import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  RotateCcw, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  Maximize2, 
  BookOpen, 
  Check 
} from 'lucide-react';
import { DAILY_ADHKAR, DhikrItem } from '../../data/dailyDhikr';
import { playCalmChime, triggerHapticFeedback } from '../../lib/notifications/notificationService';
import { getTodayKey } from '../../lib/storage/dataService';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'amanah_daily_adhkar_counts_v1';

export const DailyDhikrModule: React.FC = () => {
  const todayKey = getTodayKey();
  
  // Determine default period by time of day
  const currentHour = new Date().getHours();
  const defaultPeriod: 'morning' | 'evening' = currentHour >= 4 && currentHour < 15 ? 'morning' : 'evening';

  const [period, setPeriod] = useState<'morning' | 'evening' | 'all'>(defaultPeriod);
  const [viewMode, setViewMode] = useState<'guided' | 'list'>('guided');
  const [guidedIndex, setGuidedIndex] = useState(0);

  // Persistent counts: { [dhikrId]: number }
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${todayKey}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Save counts to local storage
  const saveCounts = (newCounts: Record<string, number>) => {
    setCounts(newCounts);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY}_${todayKey}`, JSON.stringify(newCounts));
      } catch (err) {
        console.warn('Failed to save adhkar counts:', err);
      }
    }
  };

  // Filter items by current period
  const activeItems = DAILY_ADHKAR.filter((item) => {
    if (period === 'all') return true;
    return item.period === period || item.period === 'both';
  });

  const currentItem: DhikrItem = activeItems[guidedIndex] || activeItems[0];
  const currentCount = counts[currentItem?.id] || 0;
  const isCurrentComplete = currentItem ? currentCount >= currentItem.targetCount : false;

  // Calculate overall completion for the active period
  const totalItems = activeItems.length;
  const completedCount = activeItems.filter((item) => (counts[item.id] || 0) >= item.targetCount).length;
  const periodProgress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const handleTap = (item: DhikrItem) => {
    triggerHapticFeedback();
    const prev = counts[item.id] || 0;
    if (prev >= item.targetCount) return;

    const next = prev + 1;
    const nextCounts = { ...counts, [item.id]: next };
    saveCounts(nextCounts);

    if (next === item.targetCount) {
      playCalmChime();

      // Check if all adhkar in this set are now completed
      const allDone = activeItems.every((it) => {
        const c = it.id === item.id ? next : (counts[it.id] || 0);
        return c >= it.targetCount;
      });

      if (allDone) {
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#2E473B', '#D3C5A3', '#8FA38F'],
          });
        } catch {}
      }
    }
  };

  const handleResetSingle = (itemId: string) => {
    const nextCounts = { ...counts, [itemId]: 0 };
    saveCounts(nextCounts);
    triggerHapticFeedback();
  };

  const handleResetAllPeriod = () => {
    if (confirm(`Reset all ${period === 'morning' ? 'Morning' : period === 'evening' ? 'Evening' : ''} Adhkar counts for today?`)) {
      const nextCounts = { ...counts };
      activeItems.forEach((it) => {
        nextCounts[it.id] = 0;
      });
      saveCounts(nextCounts);
    }
  };

  const handleNextGuided = () => {
    setGuidedIndex((prev) => (prev + 1) % activeItems.length);
  };

  const handlePrevGuided = () => {
    setGuidedIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
  };

  return (
    <div className="space-y-4">
      {/* 1. Module Header & Period Controls */}
      <div className="p-4 rounded-3xl bg-white border border-[#EAE6DD] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E473B]" />
            <h2 className="text-sm font-serif font-bold text-[#1F2421]">
              Daily Adhkar & Remembrance
            </h2>
          </div>
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-[#F4F1EA] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('guided')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'guided' ? 'bg-white text-[#1F2421] shadow-xs' : 'text-[#7E8B82]'
              }`}
              title="Guided Focus View"
              aria-label="Guided Focus View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list' ? 'bg-white text-[#1F2421] shadow-xs' : 'text-[#7E8B82]'
              }`}
              title="List Overview"
              aria-label="List Overview"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F6F4ED] rounded-xl text-xs font-medium">
          <button
            onClick={() => {
              setPeriod('morning');
              setGuidedIndex(0);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              period === 'morning'
                ? 'bg-white text-[#1F2421] font-semibold shadow-xs'
                : 'text-[#6B756E] hover:text-[#1F2421]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#D99A26]" />
            <span>Morning</span>
          </button>
          <button
            onClick={() => {
              setPeriod('evening');
              setGuidedIndex(0);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              period === 'evening'
                ? 'bg-white text-[#1F2421] font-semibold shadow-xs'
                : 'text-[#6B756E] hover:text-[#1F2421]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#5A6E85]" />
            <span>Evening</span>
          </button>
          <button
            onClick={() => {
              setPeriod('all');
              setGuidedIndex(0);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              period === 'all'
                ? 'bg-white text-[#1F2421] font-semibold shadow-xs'
                : 'text-[#6B756E] hover:text-[#1F2421]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#988158]" />
            <span>All Adhkar</span>
          </button>
        </div>

        {/* Progress Bar & Status */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B756E] font-medium">
              {period === 'morning' ? 'Morning Adhkar' : period === 'evening' ? 'Evening Adhkar' : 'Daily Adhkar'}
            </span>
            <span className="font-mono tabular-nums text-xs font-semibold text-[#1F2421]">
              {completedCount} of {totalItems} completed ({periodProgress}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2E473B] transition-all duration-300 ease-out"
              style={{ width: `${periodProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. GUIDED FOCUS MODE (Single Dhikr with prominent tap counter) */}
      {viewMode === 'guided' && currentItem && (
        <div className="p-6 rounded-3xl bg-white border border-[#EAE6DD] shadow-xs space-y-5">
          {/* Top navigation row */}
          <div className="flex items-center justify-between text-xs text-[#7A6B53]">
            <button
              onClick={handlePrevGuided}
              className="p-1.5 rounded-lg border border-[#D5CEC2] text-[#505D54] hover:bg-[#F4F1EA]"
              aria-label="Previous Dhikr"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="font-semibold text-[#1F2421] block">
                {guidedIndex + 1} of {activeItems.length}
              </span>
              <span className="text-[10px] text-[#7A6B53] font-mono">
                {currentItem.source}
              </span>
            </div>
            <button
              onClick={handleNextGuided}
              className="p-1.5 rounded-lg border border-[#D5CEC2] text-[#505D54] hover:bg-[#F4F1EA]"
              aria-label="Next Dhikr"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Badge */}
          <div className="text-center">
            <h3 className="text-base font-serif font-bold text-[#1F2421]">
              {currentItem.title}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-semibold text-[#7A6B53] uppercase tracking-wider">
              Target: {currentItem.targetCount} {currentItem.targetCount === 1 ? 'time' : 'times'}
            </span>
          </div>

          {/* Arabic Text */}
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#ECE6D9] text-right">
            <p className="font-serif text-xl sm:text-2xl text-[#1F2421] leading-loose selection:bg-[#E2D4B7]" dir="rtl">
              {currentItem.arabic}
            </p>
          </div>

          {/* Transliteration & English */}
          <div className="space-y-2 text-xs leading-relaxed text-[#4A554D]">
            <p className="italic text-[#6B756E]">
              {currentItem.transliteration}
            </p>
            <p className="p-3 rounded-xl bg-[#F6F4ED] border border-[#E5DFD3] text-[#1F2421]">
              «{currentItem.translation}»
            </p>
            {currentItem.benefit && (
              <p className="text-[11px] text-[#7D6B4E]">
                <strong>Reward / Benefit:</strong> {currentItem.benefit}
              </p>
            )}
          </div>

          {/* Primary Interactive Tap Counter */}
          <div className="flex flex-col items-center pt-2">
            <button
              onClick={() => handleTap(currentItem)}
              disabled={isCurrentComplete}
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all select-none border-4 shadow-md ${
                isCurrentComplete
                  ? 'bg-[#EBF3ED] border-[#81B98F] text-[#1C512C]'
                  : 'bg-gradient-to-b from-[#2E473B] to-[#203328] border-[#E2D4B7] text-white active:scale-95'
              }`}
              aria-label={`Tap to count ${currentItem.title}`}
            >
              {isCurrentComplete ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-[#2E473B] mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Completed
                  </span>
                  <span className="font-mono text-sm mt-1">
                    {currentItem.targetCount} / {currentItem.targetCount}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-mono text-4xl font-bold tabular-nums">
                    {currentCount}
                  </span>
                  <span className="text-xs text-[#E2D4B7] mt-1 font-medium">
                    of {currentItem.targetCount}
                  </span>
                  <span className="text-[10px] text-[#A5B8A3] mt-2 uppercase tracking-widest font-semibold">
                    Tap to Count
                  </span>
                </>
              )}
            </button>

            {/* Bottom Controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => handleResetSingle(currentItem.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D5CEC2] text-xs font-medium text-[#6B756E] hover:bg-[#F4F1EA]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleNextGuided}
                className="px-4 py-1.5 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E]"
              >
                Next Dhikr →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FULL LIST OVERVIEW MODE */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-[#1F2421] uppercase tracking-wider text-[11px]">
              {period === 'morning' ? 'Morning Adhkar' : period === 'evening' ? 'Evening Adhkar' : 'All Adhkar'} List
            </span>
            <button
              onClick={handleResetAllPeriod}
              className="text-[11px] text-[#B93815] hover:underline"
            >
              Reset All
            </button>
          </div>

          <div className="space-y-2.5">
            {activeItems.map((item, idx) => {
              const count = counts[item.id] || 0;
              const isDone = count >= item.targetCount;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-[#F2F6F3] border-[#C8DFCD]'
                      : 'bg-white border-[#EAE6DD]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-[#EFECE6] text-[#7A6B53] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-[#1F2421] truncate">
                          {item.title}
                        </h4>
                      </div>
                      <p className="font-serif text-sm text-[#1F2421] text-right line-clamp-2 my-1" dir="rtl">
                        {item.arabic}
                      </p>
                      <span className="text-[10px] text-[#7E8B82] block">
                        Target: {item.targetCount}x · {item.source}
                      </span>
                    </div>

                    {/* Interactive Counter Stepper */}
                    <div className="flex flex-col items-center shrink-0 gap-1.5">
                      <button
                        onClick={() => handleTap(item)}
                        disabled={isDone}
                        className={`min-h-[44px] min-w-[56px] px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center justify-center active:scale-95 ${
                          isDone
                            ? 'bg-[#2E473B] text-white'
                            : 'bg-[#FAF8F3] border border-[#D5CEC2] text-[#1F2421] hover:bg-[#F4F1EA]'
                        }`}
                        aria-label={`Tap ${item.title}`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <>
                            <span className="text-sm">{count}</span>
                            <span className="text-[9px] text-[#7A6B53]">/{item.targetCount}</span>
                          </>
                        )}
                      </button>

                      {count > 0 && !isDone && (
                        <button
                          onClick={() => handleResetSingle(item.id)}
                          className="text-[10px] text-[#7E8B82] hover:text-[#B93815]"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
