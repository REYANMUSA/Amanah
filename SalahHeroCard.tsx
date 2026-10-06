import React, { useState, useEffect } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { getCalculatedPrayerTimes, PrayerSchedule } from '../../lib/prayer/prayerTimes';

interface SalahHeroCardProps {
  onSelectPrayer?: (prayerName: string) => void;
}

const ARABIC_PRAYER_NAMES: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

// 24-hour time formatter helper
function formatTo24h(timeStr: string): string {
  if (!timeStr) return '--:--';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

export const SalahHeroCard: React.FC<SalahHeroCardProps> = ({ onSelectPrayer }) => {
  const [schedule, setSchedule] = useState<PrayerSchedule>(getCalculatedPrayerTimes());

  useEffect(() => {
    const timer = setInterval(() => {
      setSchedule(getCalculatedPrayerTimes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const nextPrayerName = schedule.nextPrayer === 'Sunrise' ? 'Fajr' : schedule.nextPrayer;
  const arabicNext = ARABIC_PRAYER_NAMES[nextPrayerName] || 'الصلاة';

  // Format today's date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const prayers = [
    { name: 'Fajr', time: formatTo24h(schedule.fajr) },
    { name: 'Dhuhr', time: formatTo24h(schedule.dhuhr) },
    { name: 'Asr', time: formatTo24h(schedule.asr) },
    { name: 'Maghrib', time: formatTo24h(schedule.maghrib) },
    { name: 'Isha', time: formatTo24h(schedule.isha) },
  ];

  // Find target next prayer time in 24h
  const nextTargetPrayerObj = prayers.find((p) => p.name.toLowerCase() === nextPrayerName.toLowerCase()) || prayers[3];

  return (
    <div className="p-5 rounded-3xl bg-[#1C3326] text-white shadow-md relative overflow-hidden select-none">
      {/* Decorative background watermark */}
      <div 
        className="absolute -right-3 -bottom-6 text-white/5 font-serif text-8xl font-black pointer-events-none select-none"
        dir="rtl"
      >
        ع
      </div>

      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#B8CEC1] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Next Obligation · فرض قادم</span>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-medium text-white border border-white/10">
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Qibla 118° ESE</span>
          </div>
          <span className="text-[10px] text-[#8EA698] mt-1 font-serif">
            {dateStr}
          </span>
        </div>
      </div>

      {/* Hero Next Prayer Display */}
      <div className="mt-2.5 mb-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
            {nextPrayerName}
          </h2>
          <span className="text-2xl font-serif font-bold text-[#D4AF37]" dir="rtl">
            {arabicNext}
          </span>
        </div>
        <p className="text-xs text-[#C5D7CC] font-mono mt-0.5 font-medium">
          Due in <span className="text-white font-bold">{schedule.timeUntilNext}</span> · {nextTargetPrayerObj.time}
        </p>
      </div>

      {/* Subtle Divider */}
      <div className="border-t border-white/10 my-4" />

      {/* 5 Prayers Grid Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {prayers.map((prayer) => {
          const isNext = prayer.name.toLowerCase() === nextPrayerName.toLowerCase();
          return (
            <div
              key={prayer.name}
              onClick={() => onSelectPrayer && onSelectPrayer(prayer.name)}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                isNext
                  ? 'border-2 border-[#D4AF37] bg-[#274433] shadow-sm'
                  : 'bg-[#15281E]/80 border border-white/5 hover:bg-[#1A3024]'
              }`}
            >
              <span
                className={`text-[11px] font-medium leading-none ${
                  isNext ? 'text-[#D4AF37] font-semibold' : 'text-[#8EA698]'
                }`}
              >
                {prayer.name}
              </span>

              <span className="text-xs font-mono font-bold text-white my-1 tabular-nums">
                {prayer.time}
              </span>

              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isNext ? 'bg-[#D4AF37]' : 'bg-white/20'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
