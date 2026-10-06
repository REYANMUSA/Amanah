export interface DailyReminder {
  category: 'Character' | 'Deen' | 'Restraint' | 'Purpose' | 'Restarting' | 'Future' | 'Patience';
  text: string;
  reflection: string;
}

export const DAILY_REMINDERS: DailyReminder[] = [
  {
    category: 'Restarting',
    text: 'A stumble is not a collapse.',
    reflection: 'Resetting today with sincerity is far more noble than remaining paralyzed by yesterday’s missed standard. Begin again calmly.'
  },
  {
    category: 'Deen',
    text: 'Sincerity requires no audience.',
    reflection: 'What you do in quiet solitude—your two quiet rak’ahs, your silent istighfar, your hidden self-restraint—builds the true foundation of your life.'
  },
  {
    category: 'Restraint',
    text: 'True strength is the gap between reaction and impulse.',
    reflection: 'Anyone can react in fury or emotion. The one carrying an amanah chooses calmness, silence, and deliberate intention.'
  },
  {
    category: 'Character',
    text: 'Gentleness never entered something without beautifying it.',
    reflection: 'In your speech with family, your personal thoughts, and your quiet expectations: lead with gentleness rather than harsh critique.'
  },
  {
    category: 'Future',
    text: 'Growing separately so we can stand together with purpose.',
    reflection: 'Prepare your mind, your health, your deen, and your discipline today. A noble future is built on two whole, self-disciplined individuals.'
  },
  {
    category: 'Purpose',
    text: 'Guard your mornings.',
    reflection: 'The early hours after Fajr hold barakah that no midnight hurry can ever reclaim. Protect your dawn routine.'
  },
  {
    category: 'Patience',
    text: 'Small, unglamorous consistency outlasts temporary intensity.',
    reflection: 'Three pages of Quran daily with contemplation will transform your year. One small disciplined habit builds lifetime trust.'
  }
];

export function getDailyReminder(dayOfYear: number): DailyReminder {
  return DAILY_REMINDERS[dayOfYear % DAILY_REMINDERS.length];
}
