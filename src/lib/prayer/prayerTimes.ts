export interface PrayerSchedule {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  currentPrayer: string;
  nextPrayer: string;
  timeUntilNext: string;
}

// Standard prayer time approximation based on day of year and standard solar calculations
export function getCalculatedPrayerTimes(date: Date = new Date()): PrayerSchedule {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  
  // Seasonal variation in minutes
  const seasonalOffset = Math.sin((dayOfYear - 80) * (2 * Math.PI / 365)) * 40;

  // Base schedule
  const fajrMin = Math.round(5 * 60 + 15 - seasonalOffset * 0.8);
  const sunriseMin = Math.round(6 * 60 + 35 - seasonalOffset * 0.7);
  const dhuhrMin = Math.round(12 * 60 + 45);
  const asrMin = Math.round(16 * 60 + 10 + seasonalOffset * 0.5);
  const maghribMin = Math.round(18 * 60 + 40 + seasonalOffset * 0.8);
  const ishaMin = Math.round(20 * 60 + 0 + seasonalOffset * 0.7);

  const formatMin = (m: number) => {
    const hours = Math.floor(m / 60) % 24;
    const mins = m % 60;
    const h12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${h12}:${String(mins).padStart(2, '0')} ${ampm}`;
  };

  const nowMin = date.getHours() * 60 + date.getMinutes();

  let current = 'Isha';
  let next = 'Fajr';
  let nextTimeMin = fajrMin + 24 * 60; // Tomorrow's Fajr

  if (nowMin < fajrMin) {
    current = 'Isha (Night)';
    next = 'Fajr';
    nextTimeMin = fajrMin;
  } else if (nowMin < sunriseMin) {
    current = 'Fajr';
    next = 'Sunrise';
    nextTimeMin = sunriseMin;
  } else if (nowMin < dhuhrMin) {
    current = 'Duha';
    next = 'Dhuhr';
    nextTimeMin = dhuhrMin;
  } else if (nowMin < asrMin) {
    current = 'Dhuhr';
    next = 'Asr';
    nextTimeMin = asrMin;
  } else if (nowMin < maghribMin) {
    current = 'Asr';
    next = 'Maghrib';
    nextTimeMin = maghribMin;
  } else if (nowMin < ishaMin) {
    current = 'Maghrib';
    next = 'Isha';
    nextTimeMin = ishaMin;
  } else {
    current = 'Isha';
    next = 'Fajr';
    nextTimeMin = fajrMin + 24 * 60;
  }

  const diff = nextTimeMin - nowMin;
  const hoursLeft = Math.floor(diff / 60);
  const minsLeft = diff % 60;
  const timeUntilNext = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`;

  return {
    fajr: formatMin(fajrMin),
    sunrise: formatMin(sunriseMin),
    dhuhr: formatMin(dhuhrMin),
    asr: formatMin(asrMin),
    maghrib: formatMin(maghribMin),
    isha: formatMin(ishaMin),
    currentPrayer: current,
    nextPrayer: next,
    timeUntilNext,
  };
}
